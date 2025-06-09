/**
 * Composable pour l'intégration avec Google Generative AI (Gemini)
 * Génère du texte naturel pour les recommandations alimentaires
 */
import type { MealData, MealRecommendation } from "./useMeals";

export interface AIGenerationRequest {
  meals: MealData[];
  currentMeal?: MealData;
  userPreferences?: any;
  context?: string;
}

export interface AIGenerationResponse {
  recommendations: MealRecommendation[];
  explanation: string;
  confidence: number;
  generationTime: number;
}

export interface GenerativeError {
  code: string;
  message: string;
  retryable: boolean;
}

export const useGoogleGenerativeAI = () => {
  const config = useRuntimeConfig();
  const { showToast } = useToast();

  const isGenerating = ref(false);
  const generationProgress = ref(0);
  const lastResponse = ref<AIGenerationResponse | null>(null);
  const generationError = ref<GenerativeError | null>(null);

  /**
   * Génère des recommandations personnalisées avec l'IA Google Gemini
   */
  const generateRecommendations = async (
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse | null> => {
    if (
      !config.public.googleAiEnabled ||
      config.public.googleAiEnabled === "false"
    ) {
      console.warn("Google AI non activé, utilisation du mode simulation");
      return generateSimulatedRecommendations(request);
    }

    isGenerating.value = true;
    generationProgress.value = 0;
    generationError.value = null;

    try {
      generationProgress.value = 25;

      // Appel à l'API serveur pour la génération de texte
      const response = await $fetch<{
        success: boolean;
        recommendations: MealRecommendation[];
        explanation?: string;
        confidence?: number;
        generationTime?: number;
        error?: string;
      }>("/api/ai/generate-recommendations", {
        method: "POST",
        body: {
          meals: request.meals,
          currentMeal: request.currentMeal,
          userPreferences: request.userPreferences,
          context: request.context,
        },
      });

      generationProgress.value = 75;

      if (!response.success) {
        throw new Error(response.error || "Erreur lors de la génération IA");
      }

      const result: AIGenerationResponse = {
        recommendations: response.recommendations,
        explanation: response.explanation || "",
        confidence: response.confidence || 0.8,
        generationTime: response.generationTime || 0,
      };

      lastResponse.value = result;
      generationProgress.value = 100;

      return result;
    } catch (error: any) {
      console.error("Erreur génération IA:", error);

      const errorObj: GenerativeError = {
        code: error.statusCode || "GENERATION_ERROR",
        message: error.message || "Erreur lors de la génération",
        retryable: error.statusCode !== 400,
      };

      generationError.value = errorObj;

      showToast({
        title: "Erreur IA",
        description: errorObj.message,
        variant: "error",
      });

      // Fallback en mode simulation en cas d'erreur
      console.log("Fallback en mode simulation");
      return generateSimulatedRecommendations(request);
    } finally {
      isGenerating.value = false;
      generationProgress.value = 0;
    }
  };

  /**
   * Génère des recommandations simulées (fallback)
   */
  const generateSimulatedRecommendations = async (
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> => {
    // Simuler un délai de traitement
    await new Promise((resolve) => setTimeout(resolve, 800));

    const analysisContext = createAnalysisContext(
      request.meals,
      request.currentMeal
    );

    const recommendations: MealRecommendation[] = [
      {
        category: "nutrition",
        title: "Équilibrez vos macronutriments",
        description: `D'après l'analyse de vos ${request.meals.length} derniers repas, il serait bénéfique d'augmenter votre consommation de légumes verts et de protéines de qualité. Visez 50% de légumes, 25% de protéines et 25% de glucides complexes dans votre assiette.`,
        priority: "high" as const,
        is_read: false,
        is_bookmarked: false,
        created_at: new Date().toISOString(),
      },
      {
        category: "variety",
        title: "Diversifiez vos sources alimentaires",
        description:
          "Pour optimiser votre apport nutritionnel, alternez entre différentes sources : poissons gras (saumon, sardines), légumineuses (lentilles, pois chiches), volaille, et intégrez plus de couleurs dans vos légumes.",
        priority: "medium" as const,
        is_read: false,
        is_bookmarked: false,
        created_at: new Date().toISOString(),
      },
      {
        category: "timing",
        title: "Optimisez vos horaires",
        description:
          "Maintenez une régularité dans vos heures de repas pour stabiliser votre métabolisme. Espacez vos repas principaux de 4-5 heures et évitez de manger tard le soir.",
        priority: "low" as const,
        is_read: false,
        is_bookmarked: false,
        created_at: new Date().toISOString(),
      },
    ];

    const explanation = analysisContext.summary;

    return {
      recommendations,
      explanation,
      confidence: 0.75,
      generationTime: 800,
    };
  };

  /**
   * Génère du texte explicatif pour une analyse de repas
   */
  const generateMealExplanation = async (
    meal: MealData,
    analysis?: any
  ): Promise<string> => {
    if (
      !config.public.googleAiEnabled ||
      config.public.googleAiEnabled === "false"
    ) {
      return generateSimulatedExplanation(meal, analysis);
    }

    try {
      const response = await $fetch<{
        success: boolean;
        explanation: string;
        error?: string;
      }>("/api/ai/explain-meal", {
        method: "POST",
        body: {
          meal,
          analysis,
        },
      });

      if (!response.success) {
        throw new Error(response.error || "Erreur génération explication");
      }

      return response.explanation;
    } catch (error) {
      console.error("Erreur explication IA:", error);
      return generateSimulatedExplanation(meal, analysis);
    }
  };

  /**
   * Génère une explication simulée pour un repas
   */
  const generateSimulatedExplanation = (
    meal: MealData,
    analysis?: any
  ): string => {
    const foodNames = meal.foods.map((f) => f.name).join(", ");
    const mealTypeText = getMealTypeText(meal.type);

    let explanation = `Votre ${mealTypeText} composé de ${foodNames} `;

    if (analysis?.healthScore) {
      const score = Math.round(analysis.healthScore);
      explanation += `présente un score santé de ${score}/10. `;
    }

    if (meal.foods.length >= 3) {
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
  };

  /**
   * Crée un contexte d'analyse pour l'IA
   */
  const createAnalysisContext = (meals: MealData[], currentMeal?: MealData) => {
    const recentMeals = meals.slice(0, 7);

    // Analyse des types de repas
    const mealTypes = recentMeals.map((m) => m.type);
    const typeFrequency = mealTypes.reduce((acc: any, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Analyse des catégories d'aliments
    const allFoods = recentMeals.flatMap((m) => m.foods);
    const categories = allFoods.map((f) => f.category || "autres");
    const categoryFrequency = categories.reduce((acc: any, cat) => {
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
      `Satisfaction moyenne: ${
        avgSatisfaction ? avgSatisfaction.toFixed(1) + "/5" : "non renseignée"
      }. ` +
      `Principales catégories: ${Object.keys(categoryFrequency)
        .slice(0, 3)
        .join(", ")}.`;

    return {
      mealTypes: typeFrequency,
      categories: categoryFrequency,
      avgSatisfaction,
      summary,
      currentMeal,
    };
  };

  /**
   * Utilitaire pour obtenir le texte du type de repas
   */
  const getMealTypeText = (type: string): string => {
    const types: Record<string, string> = {
      "petit-dejeuner": "petit-déjeuner",
      dejeuner: "déjeuner",
      diner: "dîner",
      collation: "collation",
    };
    return types[type] || type;
  };

  /**
   * Réinitialise l'état du composable
   */
  const reset = () => {
    isGenerating.value = false;
    generationProgress.value = 0;
    lastResponse.value = null;
    generationError.value = null;
  };

  return {
    // État réactif
    isGenerating: readonly(isGenerating),
    generationProgress: readonly(generationProgress),
    lastResponse: readonly(lastResponse),
    generationError: readonly(generationError),

    // Méthodes
    generateRecommendations,
    generateMealExplanation,
    reset,
  };
};
