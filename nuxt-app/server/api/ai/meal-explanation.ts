import { streamText, type CoreMessage } from "ai";
import { useAiSdk } from "~/composables/useAiSdk";

export default defineLazyEventHandler(async () => {
  const { googleAi } = useAiSdk();

  return defineEventHandler(async (event: any) => {
    const {
      meal,
      analysis,
    }: {
      meal: any;
      analysis?: any;
    } = await readBody(event);

    // Prompt système pour l'explication de repas
    const systemPrompt = `Tu es un nutritionniste expert qui explique les repas de manière pédagogique et encourageante.

RÔLE :
- Analyser la composition du repas
- Expliquer les bienfaits nutritionnels
- Donner des conseils constructifs
- Rester positif et motivant

STYLE :
- Langage accessible et bienveillant
- Explications scientifiques simples
- Encouragements personnalisés
- Suggestions concrètes

STRUCTURE :
- Analyse des aliments présents
- Points forts nutritionnels
- Suggestions d'amélioration (si pertinentes)
- Message d'encouragement

Génère une explication claire et motivante du repas en 2-3 phrases maximum.`;

    try {
      // Préparer les informations sur le repas
      const foodsList =
        meal.foods?.map((f: any) => f.name).join(", ") || "Repas non spécifié";
      const mealType = getMealTypeText(meal.type);
      const satisfactionText = meal.satisfaction
        ? `Satisfaction : ${meal.satisfaction}/5`
        : "Satisfaction non renseignée";

      const messages: CoreMessage[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Repas à analyser :
Type : ${mealType}
Aliments : ${foodsList}
${satisfactionText}

${analysis ? `Analyse existante : ${JSON.stringify(analysis)}` : ""}

Génère une explication pédagogique et encourageante de ce repas.`,
        },
      ];

      const result = await streamText({
        model: googleAi("gemini-2.0-flash-exp"),
        messages,
        temperature: 0.4,
      });

      const explanation = await result.text;

      return {
        success: true,
        explanation: explanation.trim(),
      };
    } catch (error) {
      console.error("Meal explanation error:", error);

      // Fallback : explication générée automatiquement
      const fallbackExplanation = generateFallbackExplanation(meal, analysis);

      return {
        success: false,
        error: "Erreur lors de la génération de l'explication",
        explanation: fallbackExplanation,
        fallback: true,
      };
    }
  });
});

// Fonction utilitaire pour obtenir le texte du type de repas
function getMealTypeText(type: string): string {
  const types: Record<string, string> = {
    "petit-dejeuner": "petit-déjeuner",
    dejeuner: "déjeuner",
    diner: "dîner",
    collation: "collation",
  };
  return types[type] || type;
}

// Fonction de fallback pour générer une explication simple
function generateFallbackExplanation(meal: any, analysis?: any): string {
  const foodNames =
    meal.foods?.map((f: any) => f.name).join(", ") || "aliments variés";
  const mealTypeText = getMealTypeText(meal.type);

  let explanation = `Votre ${mealTypeText} composé de ${foodNames} `;

  if (analysis?.healthScore) {
    const score = Math.round(analysis.healthScore);
    explanation += `présente un score santé de ${score}/10. `;
  }

  if (meal.foods && meal.foods.length >= 3) {
    explanation +=
      "Cette variété d'aliments est excellente pour l'équilibre nutritionnel. ";
  } else {
    explanation +=
      "Pensez à ajouter plus de variété pour optimiser l'apport nutritionnel. ";
  }

  if (meal.satisfaction && meal.satisfaction >= 4) {
    explanation +=
      "Votre satisfaction élevée indique un bon alignement avec vos besoins.";
  } else if (meal.satisfaction && meal.satisfaction <= 2) {
    explanation +=
      "Une satisfaction faible peut indiquer un besoin d'ajustement dans vos choix alimentaires.";
  }

  return explanation;
}
