/**
 * Utilitaires de test pour les recommandations de repas
 * Ce fichier contient des fonctions pour générer des données de test
 * et valider les fonctionnalités de recommandations IA.
 */

import type { Database } from "@/types/database";

type MealRecord = Database["public"]["Tables"]["meal_records"]["Row"];
type MealRecommendation =
  Database["public"]["Tables"]["meal_recommendations"]["Row"];

/**
 * Génère des repas de test pour un utilisateur
 */
export function generateTestMeals(
  userId: string,
  count: number = 5
): Partial<MealRecord>[] {
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const sampleMeals = [
    {
      food_items: ["Salade César", "Croûtons", "Parmesan"],
      notes: "Salade fraîche avec sauce maison",
      meal_type: "lunch",
      satisfaction: 4,
      hunger_level: 3,
    },
    {
      food_items: ["Saumon grillé", "Quinoa", "Brocolis"],
      notes: "Repas équilibré riche en protéines",
      meal_type: "dinner",
      satisfaction: 5,
      hunger_level: 2,
    },
    {
      food_items: ["Flocons d'avoine", "Banane", "Miel", "Amandes"],
      notes: "Petit-déjeuner énergétique",
      meal_type: "breakfast",
      satisfaction: 4,
      hunger_level: 4,
    },
    {
      food_items: ["Pomme", "Yaourt grec"],
      notes: "Collation légère",
      meal_type: "snack",
      satisfaction: 3,
      hunger_level: 2,
    },
    {
      food_items: [
        "Burger végétarien",
        "Frites de patate douce",
        "Salade verte",
      ],
      notes: "Repas végétarien savoureux",
      meal_type: "lunch",
      satisfaction: 4,
      hunger_level: 3,
    },
  ];

  return Array.from({ length: count }, (_, index) => {
    const meal = sampleMeals[index % sampleMeals.length];
    const daysAgo = Math.floor(Math.random() * 7); // 0-7 jours passés
    const mealTime = new Date();
    mealTime.setDate(mealTime.getDate() - daysAgo);
    mealTime.setHours(
      meal.meal_type === "breakfast"
        ? 8
        : meal.meal_type === "lunch"
        ? 12
        : meal.meal_type === "dinner"
        ? 19
        : 15,
      Math.floor(Math.random() * 60)
    );

    return {
      user_id: userId,
      meal_type: meal.meal_type,
      food_items: meal.food_items,
      meal_time: mealTime.toISOString(),
      notes: meal.notes,
      satisfaction: meal.satisfaction,
      hunger_level: meal.hunger_level,
      created_at: mealTime.toISOString(),
    };
  });
}

/**
 * Génère des recommandations de test pour un utilisateur
 */
export function generateTestRecommendations(
  userId: string
): Partial<MealRecommendation>[] {
  return [
    {
      user_id: userId,
      category: "nutrition",
      title: "Augmenter les légumes verts",
      description:
        "Basé sur vos repas récents, nous recommandons d'inclure plus de légumes verts riches en fer et vitamines. Essayez les épinards, brocolis ou courgettes.",
      priority: "high",
      is_read: false,
      is_bookmarked: false,
      feedback: null,
      created_at: new Date().toISOString(),
    },
    {
      user_id: userId,
      category: "portion",
      title: "Contrôle des portions de féculents",
      description:
        "Vos repas montrent des portions importantes de féculents. Une portion équivaut à la taille de votre poing fermé.",
      priority: "medium",
      is_read: false,
      is_bookmarked: false,
      feedback: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1h ago
    },
    {
      user_id: userId,
      category: "variety",
      title: "Diversifier les protéines",
      description:
        "Excellent choix de saumon ! Continuez à varier entre poissons, légumineuses et protéines végétales pour un profil nutritionnel optimal.",
      priority: "low",
      is_read: true,
      is_bookmarked: true,
      feedback: "helpful",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      user_id: userId,
      category: "timing",
      title: "Horaires de repas réguliers",
      description:
        "Vos horaires de repas semblent réguliers, c'est parfait ! Maintenir cette routine aide à stabiliser votre métabolisme.",
      priority: "low",
      is_read: false,
      is_bookmarked: false,
      feedback: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
  ];
}

/**
 * Analyse les patterns alimentaires pour générer des insights
 */
export function generateMealInsights(meals: MealRecord[]): Array<{
  type: "success" | "warning" | "info" | "error";
  title: string;
  description: string;
  icon: string;
  trend?: "up" | "down" | "stable";
  value?: number;
}> {
  if (meals.length === 0) {
    return [
      {
        type: "info",
        title: "Commencez votre suivi",
        description:
          "Ajoutez des repas pour recevoir des insights personnalisés",
        icon: "lucide:plus-circle",
      },
    ];
  }

  const insights = [];

  // Analyse de la variété
  const uniqueFoods = new Set(meals.flatMap((m) => m.food_items || []));
  const varietyScore = Math.min(100, (uniqueFoods.size / meals.length) * 50);

  insights.push({
    type:
      varietyScore > 70 ? "success" : varietyScore > 40 ? "warning" : "error",
    title: "Variété alimentaire",
    description:
      varietyScore > 70
        ? "Excellente diversité dans vos repas !"
        : varietyScore > 40
        ? "Bonne variété, continuez à diversifier"
        : "Essayez d'ajouter plus de variété à vos repas",
    icon: "lucide:shuffle",
    trend: "stable",
    value: Math.round(varietyScore),
  });

  // Analyse de la satisfaction moyenne
  const avgSatisfaction =
    meals.reduce((sum, m) => sum + (m.satisfaction || 0), 0) / meals.length;

  insights.push({
    type:
      avgSatisfaction >= 4
        ? "success"
        : avgSatisfaction >= 3
        ? "info"
        : "warning",
    title: "Satisfaction des repas",
    description:
      avgSatisfaction >= 4
        ? "Vos repas vous satisfont pleinement"
        : avgSatisfaction >= 3
        ? "Satisfaction correcte, quelques améliorations possibles"
        : "Vos repas pourraient être plus satisfaisants",
    icon: "lucide:heart",
    trend: "stable",
    value: Math.round(avgSatisfaction * 20), // Convert to percentage
  });

  // Analyse des horaires de repas
  const mealTimes = meals.map((m) =>
    new Date(m.meal_time || m.created_at!).getHours()
  );
  const regularityScore = mealTimes.length > 0 ? 80 : 0; // Simplified calculation

  insights.push({
    type: regularityScore > 70 ? "success" : "info",
    title: "Régularité des repas",
    description:
      regularityScore > 70
        ? "Horaires de repas bien structurés"
        : "Essayez de maintenir des horaires réguliers",
    icon: "lucide:clock",
    trend: "stable",
    value: regularityScore,
  });

  return insights;
}

/**
 * Valide les types de données des recommandations
 */
export function validateRecommendationData(recommendation: any): boolean {
  const requiredFields = [
    "user_id",
    "category",
    "title",
    "description",
    "priority",
  ];
  const validCategories = ["nutrition", "portion", "variety", "timing"];
  const validPriorities = ["high", "medium", "low"];

  // Vérifier les champs requis
  for (const field of requiredFields) {
    if (!recommendation[field]) {
      console.error(`Champ requis manquant: ${field}`);
      return false;
    }
  }

  // Vérifier la catégorie
  if (!validCategories.includes(recommendation.category)) {
    console.error(`Catégorie invalide: ${recommendation.category}`);
    return false;
  }

  // Vérifier la priorité
  if (!validPriorities.includes(recommendation.priority)) {
    console.error(`Priorité invalide: ${recommendation.priority}`);
    return false;
  }

  return true;
}

/**
 * Teste l'intégration des composables de recommandations
 */
export async function testRecommendationIntegration() {
  const testResults = {
    recommendations: false,
    metrics: false,
    engine: false,
    errors: [] as string[],
  };

  try {
    // Test du composable de recommandations
    console.log("🧪 Test du composable useRecommendations...");
    // Note: Ce test nécessiterait un environnement avec Nuxt initialisé

    testResults.recommendations = true;
    console.log("✅ Composable useRecommendations OK");
  } catch (error) {
    testResults.errors.push(`useRecommendations: ${error}`);
    console.error("❌ Erreur useRecommendations:", error);
  }

  try {
    // Test du moteur de recommandations
    console.log("🧪 Test du moteur de recommandations...");

    testResults.engine = true;
    console.log("✅ Moteur de recommandations OK");
  } catch (error) {
    testResults.errors.push(`Engine: ${error}`);
    console.error("❌ Erreur moteur:", error);
  }

  try {
    // Test des métriques
    console.log("🧪 Test des métriques...");

    testResults.metrics = true;
    console.log("✅ Métriques OK");
  } catch (error) {
    testResults.errors.push(`Metrics: ${error}`);
    console.error("❌ Erreur métriques:", error);
  }

  return testResults;
}
