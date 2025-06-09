import type { MealData, FoodItem, MealRecommendation } from "./useMeals";

// Types pour le moteur de recommandations
export interface NutritionalRule {
  id: string;
  name: string;
  category: "nutrition" | "variety" | "portion" | "timing";
  priority: "low" | "medium" | "high";
  check: (meals: MealData[], currentMeal?: MealData) => boolean;
  generateRecommendation: (
    meals: MealData[],
    currentMeal?: MealData
  ) => {
    title: string;
    description: string;
  };
}

export interface UserPreferences {
  dietaryRestrictions?: string[]; // vegetarian, vegan, gluten-free, etc.
  allergies?: string[];
  goals?: string[]; // weight-loss, muscle-gain, maintenance, etc.
  dislikedFoods?: string[];
  preferredMealTimes?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
}

export const useRecommendationEngine = () => {
  const { user } = useSupabaseUser();
  const supabase = useSupabase();

  // Règles nutritionnelles de base
  const nutritionalRules = ref<NutritionalRule[]>([
    // Règle de variété alimentaire
    {
      id: "food-variety",
      name: "Variété alimentaire",
      category: "variety",
      priority: "medium",
      check: (meals: MealData[]) => {
        const recentMeals = meals.slice(0, 3); // 3 derniers repas
        const allFoods = recentMeals.flatMap((meal) =>
          meal.foods.map((f) => f.name.toLowerCase())
        );
        const uniqueFoods = new Set(allFoods);
        return uniqueFoods.size >= allFoods.length * 0.7; // Au moins 70% de variété
      },
      generateRecommendation: (meals: MealData[]) => ({
        title: "Diversifiez vos repas",
        description:
          "Essayez d'inclure plus de variété dans vos repas récents. Une alimentation diversifiée assure un meilleur apport en nutriments.",
      }),
    },

    // Règle d'équilibre des macronutriments
    {
      id: "macro-balance",
      name: "Équilibre macronutriments",
      category: "nutrition",
      priority: "high",
      check: (meals: MealData[], currentMeal?: MealData) => {
        const meal = currentMeal || meals[0];
        if (!meal) return true;

        const categories = meal.foods.map((f) => f.category || "autres");
        const hasProteins = categories.includes("proteines");
        const hasCarbs =
          categories.includes("cereales") ||
          categories.includes("legumineuses");
        const hasVeggies =
          categories.includes("legumes") || categories.includes("fruits");

        return hasProteins && hasCarbs && hasVeggies;
      },
      generateRecommendation: (meals: MealData[], currentMeal?: MealData) => ({
        title: "Équilibrez vos macronutriments",
        description:
          "Votre repas pourrait bénéficier d'un meilleur équilibre entre protéines, glucides et légumes pour une nutrition optimale.",
      }),
    },

    // Règle de fréquence des repas
    {
      id: "meal-frequency",
      name: "Fréquence des repas",
      category: "timing",
      priority: "medium",
      check: (meals: MealData[]) => {
        const today = new Date().toDateString();
        const todayMeals = meals.filter(
          (meal) => new Date(meal.datetime).toDateString() === today
        );
        return todayMeals.length >= 2 && todayMeals.length <= 5;
      },
      generateRecommendation: (meals: MealData[]) => {
        const today = new Date().toDateString();
        const todayMeals = meals.filter(
          (meal) => new Date(meal.datetime).toDateString() === today
        );

        if (todayMeals.length < 2) {
          return {
            title: "Augmentez la fréquence de vos repas",
            description:
              "Essayez de prendre au moins 2-3 repas par jour pour maintenir votre énergie et votre métabolisme.",
          };
        } else {
          return {
            title: "Attention à la fréquence des repas",
            description:
              "Vous avez pris beaucoup de repas aujourd'hui. Assurez-vous que les portions sont adaptées.",
          };
        }
      },
    },

    // Règle de portion
    {
      id: "portion-size",
      name: "Taille des portions",
      category: "portion",
      priority: "medium",
      check: (meals: MealData[], currentMeal?: MealData) => {
        const meal = currentMeal || meals[0];
        if (!meal) return true;

        // Vérifier si la satisfaction est dans une plage normale (2-4)
        return (
          !meal.satisfaction ||
          (meal.satisfaction >= 2 && meal.satisfaction <= 4)
        );
      },
      generateRecommendation: (meals: MealData[], currentMeal?: MealData) => {
        const meal = currentMeal || meals[0];
        const satisfaction = meal?.satisfaction || 3;

        if (satisfaction < 2) {
          return {
            title: "Augmentez vos portions",
            description:
              "Vous semblez encore avoir faim après ce repas. Considérez d'augmenter légèrement les portions ou d'ajouter une collation saine.",
          };
        } else {
          return {
            title: "Surveillez vos portions",
            description:
              "Vous semblez très rassasié après ce repas. Des portions plus petites pourraient être plus confortables.",
          };
        }
      },
    },

    // Règle de consommation de légumes
    {
      id: "vegetable-intake",
      name: "Consommation de légumes",
      category: "nutrition",
      priority: "high",
      check: (meals: MealData[]) => {
        const recentMeals = meals.slice(0, 3);
        const vegetableCount = recentMeals.reduce((count, meal) => {
          return (
            count +
            meal.foods.filter(
              (f) => f.category === "legumes" || f.category === "fruits"
            ).length
          );
        }, 0);
        return vegetableCount >= recentMeals.length; // Au moins 1 légume/fruit par repas
      },
      generateRecommendation: (meals: MealData[]) => ({
        title: "Augmentez votre consommation de légumes",
        description:
          "Essayez d'inclure plus de légumes et de fruits dans vos repas. Ils apportent des vitamines, minéraux et fibres essentiels.",
      }),
    },

    // Règle d'hydratation (basée sur les notes ou boissons)
    {
      id: "hydration",
      name: "Hydratation",
      category: "nutrition",
      priority: "low",
      check: (meals: MealData[]) => {
        const recentMeals = meals.slice(0, 5);
        const hydrationMentions = recentMeals.filter(
          (meal) =>
            meal.notes?.toLowerCase().includes("eau") ||
            meal.notes?.toLowerCase().includes("boisson") ||
            meal.foods.some((f) => f.category === "boissons")
        );
        return hydrationMentions.length >= 2;
      },
      generateRecommendation: (meals: MealData[]) => ({
        title: "Pensez à vous hydrater",
        description:
          "N'oubliez pas de boire suffisamment d'eau tout au long de la journée, idéalement 1,5 à 2 litres par jour.",
      }),
    },
  ]);

  // Analyser les repas et générer des recommandations
  const analyzeAndGenerateRecommendations = async (
    meals: MealData[],
    currentMeal?: MealData,
    userPreferences?: UserPreferences
  ): Promise<MealRecommendation[]> => {
    if (!user.value) return [];

    const recommendations: MealRecommendation[] = [];

    // Appliquer chaque règle
    for (const rule of nutritionalRules.value) {
      try {
        const isRuleSatisfied = rule.check(meals, currentMeal);

        if (!isRuleSatisfied) {
          const { title, description } = rule.generateRecommendation(
            meals,
            currentMeal
          );

          recommendations.push({
            user_id: user.value.id,
            meal_id: currentMeal?.id,
            category: rule.category,
            title,
            description,
            priority: rule.priority,
            is_read: false,
            is_bookmarked: false,
            created_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.warn(
          `Erreur lors de l'application de la règle ${rule.id}:`,
          error
        );
      }
    }

    // Filtrer les doublons et limiter le nombre
    const uniqueRecommendations = recommendations.filter(
      (rec, index, self) =>
        index ===
        self.findIndex(
          (r) => r.title === rec.title && r.category === rec.category
        )
    );

    // Trier par priorité et limiter à 5 recommandations max
    return uniqueRecommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);
  };

  // Sauvegarder les recommandations en base
  const saveRecommendations = async (recommendations: MealRecommendation[]) => {
    if (!user.value || recommendations.length === 0)
      return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from("meal_recommendations")
        .insert(
          recommendations.map((rec) => ({
            user_id: rec.user_id,
            meal_id: rec.meal_id,
            category: rec.category,
            title: rec.title,
            description: rec.description,
            priority: rec.priority,
            is_read: false,
            is_bookmarked: false,
          }))
        )
        .select();

      return { data: data || [], error };
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde des recommandations:", error);
      return { data: [], error };
    }
  };

  // Analyse complète : générer et sauvegarder
  const generateRecommendationsForMeal = async (
    meals: MealData[],
    currentMeal?: MealData
  ) => {
    try {
      // Générer les recommandations
      const recommendations = await analyzeAndGenerateRecommendations(
        meals,
        currentMeal
      );

      if (recommendations.length > 0) {
        // Sauvegarder en base
        const { data, error } = await saveRecommendations(recommendations);

        if (error) {
          console.error("Erreur sauvegarde recommandations:", error);
          return { recommendations, saved: false, error };
        }

        return {
          recommendations: data || recommendations,
          saved: true,
          error: null,
        };
      }

      return { recommendations: [], saved: true, error: null };
    } catch (error: any) {
      console.error("Erreur génération recommandations:", error);
      return { recommendations: [], saved: false, error };
    }
  };

  // Obtenir des conseils personnalisés basés sur l'historique
  const getPersonalizedTips = (meals: MealData[]): string[] => {
    const tips: string[] = [];

    // Analyser les patterns alimentaires
    const mealTypes = meals.map((m) => m.type);
    const satisfactionLevels = meals
      .filter((m) => m.satisfaction)
      .map((m) => m.satisfaction!);
    const commonFoods = meals.flatMap((m) =>
      m.foods.map((f) => f.name.toLowerCase())
    );

    // Conseils basés sur les types de repas
    const breakfastCount = mealTypes.filter(
      (t) => t === "petit-dejeuner"
    ).length;
    if (breakfastCount < meals.length * 0.3) {
      tips.push(
        "Essayez de prendre un petit-déjeuner plus régulièrement pour bien commencer la journée."
      );
    }

    // Conseils basés sur la satisfaction
    const avgSatisfaction =
      satisfactionLevels.length > 0
        ? satisfactionLevels.reduce((a, b) => a + b, 0) /
          satisfactionLevels.length
        : 3;

    if (avgSatisfaction < 2.5) {
      tips.push(
        "Vos repas semblent vous laisser sur votre faim. Considérez d'augmenter les portions ou d'ajouter des collations."
      );
    } else if (avgSatisfaction > 4) {
      tips.push(
        "Vous semblez très rassasié après vos repas. Des portions plus petites pourraient être plus confortables."
      );
    }

    // Conseils basés sur la variété
    const uniqueFoods = new Set(commonFoods);
    if (uniqueFoods.size < commonFoods.length * 0.5) {
      tips.push(
        "Essayez de diversifier davantage votre alimentation pour bénéficier d'un plus large éventail de nutriments."
      );
    }

    return tips.slice(0, 3); // Limiter à 3 conseils
  };

  return {
    // État
    nutritionalRules: readonly(nutritionalRules),

    // Méthodes principales
    analyzeAndGenerateRecommendations,
    generateRecommendationsForMeal,
    saveRecommendations,
    getPersonalizedTips,
  };
};
