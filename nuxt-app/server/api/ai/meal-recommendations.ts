import { streamText, type CoreMessage } from "ai";
import { useAiSdk } from "~/composables/useAiSdk";

export default defineLazyEventHandler(async () => {
  const { googleAi } = useAiSdk();

  return defineEventHandler(async (event: any) => {
    const {
      meals,
      currentMeal,
      userPreferences,
      context,
    }: {
      meals: Array<any>;
      currentMeal?: any;
      userPreferences?: any;
      context?: string;
    } = await readBody(event);

    // Prompt système pour la génération de recommandations alimentaires
    const systemPrompt = `Tu es un expert en nutrition et santé qui aide à créer des recommandations alimentaires personnalisées et pratiques.

DONNÉES DISPONIBLES :
- Historique des repas récents de l'utilisateur
- Détails du repas actuel (si fourni)
- Préférences utilisateur (si disponibles)
- Contexte additionnel (si fourni)

RÈGLES POUR LES RECOMMANDATIONS :
1. Basées sur l'analyse nutritionnelle des repas
2. Adaptées aux habitudes alimentaires observées
3. Pratiques et réalisables
4. Encourageantes et positives
5. Scientifiquement fondées

CATÉGORIES DE RECOMMANDATIONS :
- nutrition: Équilibre nutritionnel, macronutriments
- variety: Diversité alimentaire, nouveaux aliments
- timing: Horaires des repas, fréquence
- portions: Quantités, satiété

PRIORITÉS :
- high: Urgent, impact santé important
- medium: Amélioration recommandée
- low: Optimisation, conseil général

STRUCTURE DE RÉPONSE :
Génère 3-5 recommandations au format JSON avec :
{
  "recommendations": [
    {
      "category": "nutrition|variety|timing|portions",
      "title": "Titre court et motivant",
      "description": "Description détaillée et actionnable",
      "priority": "low|medium|high"
    }
  ],
  "explanation": "Analyse générale des habitudes alimentaires",
  "confidence": score_0_100
}

CONSIGNES :
- Analyse les patterns alimentaires
- Identifie les déséquilibres nutritionnels
- Propose des améliorations concrètes
- Sois encourageant et bienveillant
- Évite les recommandations trop restrictives

Réponds uniquement en JSON valide.`;

    try {
      const messages: CoreMessage[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Historique des repas récents :
${JSON.stringify(meals, null, 2)}

${
  currentMeal
    ? `Repas actuel :
${JSON.stringify(currentMeal, null, 2)}`
    : ""
}

${
  userPreferences
    ? `Préférences utilisateur :
${JSON.stringify(userPreferences, null, 2)}`
    : ""
}

${
  context
    ? `Contexte additionnel :
${context}`
    : ""
}

Génère des recommandations personnalisées basées sur ces informations.`,
        },
      ];

      const result = await streamText({
        model: googleAi("gemini-2.0-flash-exp"),
        messages,
        temperature: 0.3, // Plus déterministe pour des conseils cohérents
        topP: 0.9,
      });

      const fullText = await result.text;

      try {
        // Parser la réponse JSON
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Pas de JSON valide trouvé dans la réponse");
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);

        // Valider la structure
        if (
          !parsedResponse.recommendations ||
          !Array.isArray(parsedResponse.recommendations)
        ) {
          throw new Error("Structure de réponse invalide");
        }

        return {
          success: true,
          recommendations: parsedResponse.recommendations,
          explanation: parsedResponse.explanation || "",
          confidence: parsedResponse.confidence || 80,
          generationTime: Date.now(),
        };
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);

        // Fallback : recommandations par défaut
        const fallbackRecommendations = generateFallbackRecommendations(
          meals,
          currentMeal
        );

        return {
          success: true,
          recommendations: fallbackRecommendations,
          explanation: "Recommandations générées par analyse de base",
          confidence: 70,
          generationTime: Date.now(),
          fallback: true,
        };
      }
    } catch (error) {
      console.error("Meal recommendations error:", error);

      // Fallback en cas d'erreur complète
      const fallbackRecommendations = generateFallbackRecommendations(
        meals,
        currentMeal
      );

      return {
        success: false,
        error: "Erreur lors de la génération des recommandations",
        recommendations: fallbackRecommendations,
        explanation: "Recommandations de base générées automatiquement",
        confidence: 60,
        generationTime: Date.now(),
        fallback: true,
      };
    }
  });
});

// Fonction de fallback pour générer des recommandations de base
function generateFallbackRecommendations(meals: Array<any>, currentMeal?: any) {
  const recommendations = [];

  // Analyse de base des repas
  const totalMeals = meals.length;
  const recentMeals = meals.slice(0, 7);

  // Comptage des catégories d'aliments
  const foodCategories = new Map();
  recentMeals.forEach((meal) => {
    if (meal.foods && Array.isArray(meal.foods)) {
      meal.foods.forEach((food: any) => {
        const category = food.category || "autres";
        foodCategories.set(category, (foodCategories.get(category) || 0) + 1);
      });
    }
  });

  // Recommandation basée sur la diversité
  if (foodCategories.size < 4) {
    recommendations.push({
      category: "variety",
      title: "Diversifiez vos repas",
      description:
        "Essayez d'intégrer plus de variété dans vos repas en incluant différents groupes d'aliments : légumes, protéines, céréales complètes et fruits.",
      priority: "high",
    });
  }

  // Recommandation nutritionnelle générale
  recommendations.push({
    category: "nutrition",
    title: "Équilibrez vos macronutriments",
    description:
      "Visez un équilibre avec 50% de légumes, 25% de protéines de qualité et 25% de glucides complexes dans vos repas principaux.",
    priority: "medium",
  });

  // Recommandation sur les horaires
  if (totalMeals > 0) {
    recommendations.push({
      category: "timing",
      title: "Régularité des repas",
      description:
        "Maintenez des horaires réguliers pour vos repas principaux afin de stabiliser votre métabolisme et améliorer votre digestion.",
      priority: "low",
    });
  }

  return recommendations;
}
