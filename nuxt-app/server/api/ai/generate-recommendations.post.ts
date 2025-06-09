import type { MealData, MealRecommendation } from "~/composables/useMeals";
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
        endpoint: "/api/ai/generate-recommendations",
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
        endpoint: "/api/ai/generate-recommendations",
        hasToken: !!csrfToken,
        hasSession: !!sessionToken,
      });

      throw createError({
        statusCode: 403,
        statusMessage: "Token de sécurité invalide",
      });
    }

    const body = await readBody(event);
    const { meals, currentMeal, userPreferences, context } = body;

    if (!meals || !Array.isArray(meals)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Données de repas invalides",
      });
    }

    const startTime = Date.now();

    // Générer des recommandations avec Google AI
    const result = await generateWithGoogleAI(
      meals,
      currentMeal,
      userPreferences,
      context
    );

    const generationTime = Date.now() - startTime;

    return {
      success: true,
      recommendations: result.recommendations,
      explanation: result.explanation,
      confidence: result.confidence,
      generationTime,
    };
  } catch (error: any) {
    console.error("Erreur génération IA:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Erreur lors de la génération avec l'IA",
    });
  }
});

/**
 * Génère des recommandations avec Google Generative AI (Gemini)
 */
async function generateWithGoogleAI(
  meals: MealData[],
  currentMeal?: MealData,
  userPreferences?: any,
  context?: string
): Promise<{
  recommendations: MealRecommendation[];
  explanation: string;
  confidence: number;
}> {
  const config = useRuntimeConfig();
  const apiKey = config.googleAiApiKey;

  if (!apiKey) {
    console.warn("Clé API Google AI manquante, utilisation du mode simulation");
    return generateFallbackRecommendations(meals, currentMeal, userPreferences);
  }

  try {
    // Créer le prompt pour l'IA
    const prompt = createGeminiPrompt(
      meals,
      currentMeal,
      userPreferences,
      context
    );

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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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

    const generatedText = data.candidates[0].content.parts[0].text;

    // Parser la réponse JSON de l'IA
    const parsed = parseAIResponse(generatedText);

    return {
      recommendations: parsed.recommendations,
      explanation: parsed.explanation,
      confidence: 0.85, // Confiance élevée pour l'IA réelle
    };
  } catch (error) {
    console.error("Erreur lors de l'appel à Google AI:", error);
    // Fallback en cas d'erreur
    return generateFallbackRecommendations(meals, currentMeal, userPreferences);
  }
}

/**
 * Crée un prompt optimisé pour Gemini
 */
function createGeminiPrompt(
  meals: MealData[],
  currentMeal?: MealData,
  userPreferences?: any,
  context?: string
): string {
  const recentMeals = meals.slice(0, 7);

  let prompt = `En tant que nutritionniste expert, analysez les habitudes alimentaires et fournissez des recommandations personnalisées.

**Données d'analyse :**
- Nombre de repas récents : ${recentMeals.length}
`;

  // Ajouter les détails des repas
  recentMeals.forEach((meal, index) => {
    const foods = meal.foods
      .map(
        (f) => `${f.name}${f.quantity ? ` (${f.quantity}${f.unit || ""})` : ""}`
      )
      .join(", ");
    prompt += `- Repas ${index + 1} (${meal.type}) : ${foods}`;
    if (meal.satisfaction) {
      prompt += ` - Satisfaction: ${meal.satisfaction}/5`;
    }
    prompt += "\n";
  });

  // Ajouter le repas actuel si fourni
  if (currentMeal) {
    const currentFoods = currentMeal.foods.map((f) => f.name).join(", ");
    prompt += `\n**Repas actuel :** ${currentMeal.type} avec ${currentFoods}\n`;
  }

  // Ajouter les préférences utilisateur
  if (userPreferences) {
    prompt += `\n**Préférences utilisateur :** ${JSON.stringify(
      userPreferences
    )}\n`;
  }

  // Ajouter le contexte supplémentaire
  if (context) {
    prompt += `\n**Contexte supplémentaire :** ${context}\n`;
  }

  prompt += `
**Instructions :**
Fournissez exactement 3 recommandations personnalisées au format JSON suivant :

{
  "recommendations": [
    {
      "category": "nutrition|variety|portion|timing|hydration",
      "title": "Titre engageant (max 60 caractères)",
      "description": "Description détaillée avec conseils pratiques (150-200 mots)",
      "priority": "high|medium|low"
    }
  ],
  "explanation": "Explication générale des habitudes observées et du raisonnement derrière les recommandations (100-150 mots)"
}

**Critères pour les recommandations :**
- Personnalisées selon l'analyse des repas
- Pratiques et réalisables au quotidien
- Motivantes et encourageantes
- Basées sur des principes nutritionnels solides
- Adaptées au contexte français/francophone
- Évitez les recommandations trop génériques

**Important :** Répondez UNIQUEMENT avec le JSON valide, sans texte supplémentaire.`;

  return prompt;
}

/**
 * Parse la réponse de l'IA
 */
function parseAIResponse(response: string): {
  recommendations: MealRecommendation[];
  explanation: string;
} {
  try {
    // Nettoyer la réponse (supprimer les marqueurs markdown si présents)
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleanResponse);

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error("Format de réponse invalide");
    }

    // Enrichir les recommandations avec les champs manquants
    const recommendations: MealRecommendation[] = parsed.recommendations.map(
      (rec: any) => ({
        category: rec.category || "nutrition",
        title: rec.title || "Recommandation personnalisée",
        description: rec.description || "Aucune description disponible",
        priority: rec.priority || "medium",
        is_read: false,
        is_bookmarked: false,
        created_at: new Date().toISOString(),
      })
    );

    return {
      recommendations,
      explanation:
        parsed.explanation ||
        "Analyse basée sur vos habitudes alimentaires récentes.",
    };
  } catch (error) {
    console.error("Erreur parsing réponse IA:", error);
    // Fallback avec des recommandations par défaut
    return {
      recommendations: [
        {
          category: "nutrition",
          title: "Équilibrer votre alimentation",
          description:
            "Basé sur l'analyse de vos repas, il serait bénéfique d'inclure plus de légumes variés et de protéines de qualité dans votre alimentation quotidienne.",
          priority: "high" as const,
          is_read: false,
          is_bookmarked: false,
          created_at: new Date().toISOString(),
        },
      ],
      explanation:
        "Analyse générée automatiquement basée sur vos habitudes alimentaires.",
    };
  }
}

/**
 * Génère des recommandations de fallback (simulation)
 */
async function generateFallbackRecommendations(
  meals: MealData[],
  currentMeal?: MealData,
  userPreferences?: any
): Promise<{
  recommendations: MealRecommendation[];
  explanation: string;
  confidence: number;
}> {
  // Simuler un délai de traitement
  await new Promise((resolve) => setTimeout(resolve, 500));

  const analysisContext = createMealAnalysisContext(meals, currentMeal);

  const recommendations: MealRecommendation[] = [
    {
      category: "nutrition",
      title: "Optimisez vos macronutriments",
      description: `D'après l'analyse de vos ${meals.length} derniers repas, nous recommandons d'augmenter votre consommation de légumes verts riches en fibres et en micronutriments. Visez une répartition de 50% légumes, 25% protéines maigres et 25% glucides complexes pour un équilibre optimal.`,
      priority: "high" as const,
      is_read: false,
      is_bookmarked: false,
      created_at: new Date().toISOString(),
    },
    {
      category: "variety",
      title: "Diversifiez vos sources de protéines",
      description:
        "Pour optimiser votre profil nutritionnel, alternez entre différentes sources : poissons gras (saumon, maquereau), légumineuses (lentilles, haricots), volaille bio, et intégrez occasionnellement des protéines végétales comme le tofu ou le tempeh.",
      priority: "medium" as const,
      is_read: false,
      is_bookmarked: false,
      created_at: new Date().toISOString(),
    },
    {
      category: "timing",
      title: "Structurez vos prises alimentaires",
      description:
        "Maintenez une régularité dans vos horaires de repas pour stabiliser votre métabolisme et votre énergie. Espacez vos repas principaux de 4-5 heures et évitez les grignotages tardifs qui peuvent perturber la qualité du sommeil.",
      priority: "low" as const,
      is_read: false,
      is_bookmarked: false,
      created_at: new Date().toISOString(),
    },
  ];

  const explanation =
    analysisContext.summary +
    " Les recommandations sont basées sur des principes nutritionnels éprouvés et adaptées à vos habitudes observées.";

  return {
    recommendations,
    explanation,
    confidence: 0.7, // Confiance modérée pour les recommandations simulées
  };
}

/**
 * Crée un contexte d'analyse des repas
 */
function createMealAnalysisContext(meals: MealData[], currentMeal?: MealData) {
  const recentMeals = meals.slice(0, 7);

  // Analyse des types de repas
  const mealTypes = recentMeals.map((m) => m.type);
  const typeFrequency = mealTypes.reduce((acc: any, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Analyse des catégories d'aliments
  const foodCategories = recentMeals.flatMap((m) =>
    m.foods.map((f) => f.category || "autres")
  );
  const categoryFrequency = foodCategories.reduce((acc: any, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Satisfaction moyenne
  const satisfactionLevels = recentMeals
    .filter((m) => m.satisfaction)
    .map((m) => m.satisfaction!);

  const avgSatisfaction =
    satisfactionLevels.length > 0
      ? satisfactionLevels.reduce((a, b) => a + b, 0) /
        satisfactionLevels.length
      : null;

  const summary =
    `Analyse de ${recentMeals.length} repas récents. ` +
    `Répartition des types: ${Object.entries(typeFrequency)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")}. ` +
    `Satisfaction moyenne: ${
      avgSatisfaction ? avgSatisfaction.toFixed(1) + "/5" : "non renseignée"
    }.`;

  return {
    typeFrequency,
    categoryFrequency,
    avgSatisfaction,
    summary,
    currentMeal,
  };
}
