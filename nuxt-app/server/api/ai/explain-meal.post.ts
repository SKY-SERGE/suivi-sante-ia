import type { MealData } from "~/composables/useMeals";
import {
  getClientIP,
  checkRateLimit,
  logSecurityEvent,
  validateCSRFToken,
} from "../../utils/security";

export default defineEventHandler(async (event) => {
  try {
    // Vérifier la méthode
    if (getMethod(event) !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
      });
    }

    const clientIP = getClientIP(event);

    // Rate limiting pour les requêtes AI
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      logSecurityEvent(event, "RATE_LIMIT_EXCEEDED", {
        endpoint: "/api/ai/explain-meal",
        remaining: rateLimitCheck.remaining,
      });

      throw createError({
        statusCode: 429,
        statusMessage: "Trop de requêtes. Veuillez réessayer plus tard.",
      });
    }

    // Protection CSRF
    const csrfToken =
      getCookie(event, "csrf-token") || getHeader(event, "x-csrf-token");
    const sessionToken = getCookie(event, "csrf-session");

    if (
      !csrfToken ||
      !sessionToken ||
      !validateCSRFToken(csrfToken, sessionToken)
    ) {
      logSecurityEvent(event, "CSRF_VALIDATION_FAILED", {
        endpoint: "/api/ai/explain-meal",
        hasToken: !!csrfToken,
        hasSession: !!sessionToken,
      });

      throw createError({
        statusCode: 403,
        statusMessage: "Token de sécurité invalide",
      });
    }

    const body = await readBody(event);
    const { meal, analysis } = body;

    if (!meal || !meal.type || !meal.foods) {
      throw createError({
        statusCode: 400,
        statusMessage: "Données de repas invalides",
      });
    }

    // Générer l'explication avec Google AI
    const explanation = await generateMealExplanationWithAI(meal, analysis);

    return {
      success: true,
      explanation,
    };
  } catch (error: any) {
    console.error("Erreur explication repas:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Erreur lors de la génération de l'explication",
    });
  }
});

/**
 * Génère une explication de repas avec Google AI
 */
async function generateMealExplanationWithAI(
  meal: MealData,
  analysis?: any
): Promise<string> {
  const config = useRuntimeConfig();
  const apiKey = config.googleAiApiKey;

  if (!apiKey) {
    console.warn("Clé API Google AI manquante, utilisation du mode simulation");
    return generateFallbackExplanation(meal, analysis);
  }

  try {
    // Créer le prompt pour l'explication
    const prompt = createExplanationPrompt(meal, analysis);

    // Appel à l'API Google Generative AI (Gemini)
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.6,
            topK: 30,
            topP: 0.9,
            maxOutputTokens: 300,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erreur API Google AI:", response.status, errorData);
      throw new Error(`Erreur API Google AI: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("Réponse invalide de l'API Google AI");
    }

    const explanation = data.candidates[0].content.parts[0].text.trim();

    return explanation;
  } catch (error) {
    console.error(
      "Erreur lors de l'appel à Google AI pour l'explication:",
      error
    );
    // Fallback en cas d'erreur
    return generateFallbackExplanation(meal, analysis);
  }
}

/**
 * Crée un prompt pour l'explication de repas
 */
function createExplanationPrompt(meal: MealData, analysis?: any): string {
  const foods = meal.foods
    .map((f) => {
      let foodDesc = f.name;
      if (f.quantity && f.unit) {
        foodDesc += ` (${f.quantity}${f.unit})`;
      }
      if (f.category) {
        foodDesc += ` [${f.category}]`;
      }
      return foodDesc;
    })
    .join(", ");

  const mealTypeText = getMealTypeText(meal.type);

  let prompt = `En tant que nutritionniste bienveillant, rédigez une explication courte et encourageante sur ce repas.

**Repas analysé :**
- Type : ${mealTypeText}
- Aliments : ${foods}
- Date/Heure : ${meal.datetime}`;

  if (meal.satisfaction) {
    prompt += `\n- Satisfaction ressentie : ${meal.satisfaction}/5`;
  }

  if (meal.hunger_level) {
    prompt += `\n- Niveau de faim initial : ${meal.hunger_level}/5`;
  }

  if (meal.notes) {
    prompt += `\n- Notes : ${meal.notes}`;
  }

  if (analysis) {
    if (analysis.healthScore) {
      prompt += `\n- Score santé calculé : ${analysis.healthScore}/10`;
    }
    if (analysis.totalCalories) {
      prompt += `\n- Calories estimées : ${analysis.totalCalories} kcal`;
    }
  }

  prompt += `

**Instructions :**
Rédigez une explication en français de 80-120 mots qui :
- Analyse positivement les choix alimentaires
- Souligne les points forts du repas
- Propose une suggestion d'amélioration si pertinente
- Utilise un ton encourageant et non culpabilisant
- Évite le jargon technique
- S'adapte au contexte français/francophone

Répondez UNIQUEMENT avec le texte d'explication, sans formatage ni titre.`;

  return prompt;
}

/**
 * Génère une explication de fallback
 */
function generateFallbackExplanation(meal: MealData, analysis?: any): string {
  const foodNames = meal.foods.map((f) => f.name).join(", ");
  const mealTypeText = getMealTypeText(meal.type);
  const foodCount = meal.foods.length;

  let explanation = `Votre ${mealTypeText} composé de ${foodNames} `;

  // Analyse basée sur le nombre d'aliments
  if (foodCount >= 4) {
    explanation += "présente une excellente variété alimentaire. ";
  } else if (foodCount >= 2) {
    explanation += "offre un bon équilibre. ";
  } else {
    explanation += "pourrait bénéficier de plus de variété. ";
  }

  // Analyse basée sur l'analyse IA si disponible
  if (analysis?.healthScore) {
    const score = Math.round(analysis.healthScore);
    if (score >= 8) {
      explanation += `Avec un score santé de ${score}/10, c'est un excellent choix nutritionnel ! `;
    } else if (score >= 6) {
      explanation += `Le score santé de ${score}/10 indique un repas équilibré. `;
    } else {
      explanation += `Avec un score de ${score}/10, il y a quelques pistes d'amélioration. `;
    }
  }

  // Analyse basée sur la satisfaction
  if (meal.satisfaction) {
    if (meal.satisfaction >= 4) {
      explanation +=
        "Votre satisfaction élevée montre que ce repas répond bien à vos besoins. ";
    } else if (meal.satisfaction <= 2) {
      explanation +=
        "Une satisfaction plus faible suggère peut-être d'explorer d'autres options. ";
    }
  }

  // Suggestion générale
  if (foodCount < 3) {
    explanation +=
      "Pensez à ajouter des légumes ou des fruits pour enrichir le profil nutritionnel.";
  } else {
    explanation +=
      "Continuez à maintenir cette diversité dans vos choix alimentaires !";
  }

  return explanation;
}

/**
 * Utilitaire pour obtenir le texte du type de repas
 */
function getMealTypeText(type: string): string {
  const types: Record<string, string> = {
    "petit-dejeuner": "petit-déjeuner",
    dejeuner: "déjeuner",
    diner: "dîner",
    collation: "collation",
  };
  return types[type] || type;
}
