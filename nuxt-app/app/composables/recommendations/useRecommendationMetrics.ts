export interface RecommendationMetrics {
  totalRecommendations: number;
  implementedCount: number;
  implementationRate: number;
  categoryBreakdown: {
    nutrition: number;
    variety: number;
    portion: number;
    timing: number;
  };
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  weeklyProgress: {
    week: string;
    implemented: number;
    total: number;
  }[];
}

export interface RecommendationInsight {
  type: "success" | "warning" | "info" | "improvement";
  title: string;
  description: string;
  icon: string;
  value?: number;
  trend?: "up" | "down" | "stable";
  priority?: "high" | "medium" | "low";
  actionable?: boolean;
}

export interface SuggestedAction {
  title: string;
  description: string;
  category: "nutrition" | "variety" | "portion" | "timing";
  difficulty: "easy" | "medium" | "hard";
  estimatedImpact: "high" | "medium" | "low";
}

export interface MetricsData {
  metrics: RecommendationMetrics;
  mealInsights?: {
    daysWithMeals: number;
    totalDays: number;
    regularityScore: number;
  };
  recommendations: any[];
  meals: any[];
  period: string;
}

export interface AIInsights {
  insights: RecommendationInsight[];
  suggestedActions: SuggestedAction[];
}

export const useRecommendationMetrics = () => {
  const user = useSupabaseUser();

  // Utiliser useMeals pour les données
  const {
    loadRecommendations,
    loadMeals,
    recommendations,
    meals,
    isLoading: mealsLoading,
    error: mealsError,
  } = useMeals();

  // État réactif local
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const metricsData = ref<MetricsData | null>(null);
  const aiInsights = ref<AIInsights | null>(null);

  // Récupérer les métriques en utilisant useMeals
  const fetchMetrics = async (period: string = "30d"): Promise<MetricsData> => {
    if (!user.value?.id) {
      throw new Error("Utilisateur non connecté");
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Charger les recommandations et repas via useMeals
      const [recResult, mealsResult] = await Promise.all([
        loadRecommendations(),
        loadMeals(100), // Limiter à 100 repas récents
      ]);

      if (recResult.error) {
        throw new Error(
          recResult.error.message || "Erreur chargement recommandations"
        );
      }

      if (mealsResult.error) {
        throw new Error(mealsResult.error.message || "Erreur chargement repas");
      }

      // Filtrer par période
      const filteredData = filterDataByPeriod(
        recResult.data,
        mealsResult.data,
        period
      );

      // Calculer les métriques côté client
      const metrics = calculateMetrics(filteredData.recommendations);

      // Calculer les insights repas
      const mealInsights = calculateMealInsights(filteredData.meals);

      const data: MetricsData = {
        metrics,
        mealInsights,
        recommendations: filteredData.recommendations,
        meals: filteredData.meals,
        period,
      };

      metricsData.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message || "Erreur lors du chargement des métriques";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Calculer les insights repas
  const calculateMealInsights = (meals: any[]) => {
    if (!meals || meals.length < 7) return undefined;

    const last7Days = meals.slice(0, 7);
    const daysWithMeals = new Set(
      last7Days.map((m: any) => new Date(m.datetime).toDateString())
    ).size;

    return {
      daysWithMeals,
      totalDays: 7,
      regularityScore: Math.round((daysWithMeals / 7) * 100),
    };
  };

  // Filtrer les données par période
  const filterDataByPeriod = (
    recommendations: any[],
    meals: any[],
    period: string
  ) => {
    const getPeriodDate = (period: string) => {
      const now = new Date();
      switch (period) {
        case "7d":
          now.setDate(now.getDate() - 7);
          break;
        case "30d":
          now.setDate(now.getDate() - 30);
          break;
        case "90d":
          now.setDate(now.getDate() - 90);
          break;
        case "1y":
          now.setFullYear(now.getFullYear() - 1);
          break;
        default:
          now.setDate(now.getDate() - 30);
      }
      return now;
    };

    const startDate = getPeriodDate(period);

    const filteredRecommendations = recommendations.filter((r) => {
      const createdAt = new Date(r.created_at);
      return createdAt >= startDate;
    });

    const filteredMeals = meals.filter((m) => {
      const createdAt = new Date(m.created_at);
      return createdAt >= startDate;
    });

    return {
      recommendations: filteredRecommendations,
      meals: filteredMeals,
    };
  };

  // Générer des insights IA avancés
  const generateAIInsights = async (userProfile?: any): Promise<AIInsights> => {
    if (!metricsData.value) {
      throw new Error("Métriques non disponibles");
    }

    try {
      const insights = (await $fetch("/api/ai/recommendations-insights", {
        method: "POST",
        body: {
          metrics: metricsData.value.metrics,
          recommendations: metricsData.value.recommendations,
          meals: metricsData.value.meals,
          userProfile,
          period: metricsData.value.period,
        },
      })) as {
        success: boolean;
        insights: RecommendationInsight[];
        suggestedActions: SuggestedAction[];
        error?: string;
        fallback?: boolean;
      };

      const result = {
        insights: insights.insights || [],
        suggestedActions: insights.suggestedActions || [],
      };

      aiInsights.value = result;
      return result;
    } catch (err: any) {
      console.error("Erreur génération insights IA:", err);
      // Fallback avec insights basiques
      const fallbackResult = generateBasicInsights(
        metricsData.value.metrics,
        metricsData.value.meals
      );

      aiInsights.value = fallbackResult;
      return fallbackResult;
    }
  };

  // Générer des insights basiques (fallback)
  const generateBasicInsights = (
    metrics: RecommendationMetrics,
    meals: any[]
  ): AIInsights => {
    const insights: RecommendationInsight[] = [];
    const suggestedActions: SuggestedAction[] = [];

    // Insight sur le taux d'implémentation
    if (metrics.implementationRate >= 80) {
      insights.push({
        type: "success",
        title: "Excellent suivi !",
        description: `Vous suivez ${metrics.implementationRate}% de vos recommandations. Continuez !`,
        icon: "lucide:trophy",
        value: metrics.implementationRate,
        trend: "up",
        priority: "high",
        actionable: false,
      });
    } else if (metrics.implementationRate >= 50) {
      insights.push({
        type: "info",
        title: "Bon progrès",
        description: `Vous suivez ${metrics.implementationRate}% des recommandations. Essayez d'en implémenter quelques-unes de plus.`,
        icon: "lucide:target",
        value: metrics.implementationRate,
        trend: "stable",
        priority: "medium",
        actionable: true,
      });
    } else if (metrics.implementationRate > 0) {
      insights.push({
        type: "warning",
        title: "Potentiel d'amélioration",
        description: `Seulement ${metrics.implementationRate}% des recommandations sont suivies. Concentrez-vous sur les priorités hautes.`,
        icon: "lucide:alert-circle",
        value: metrics.implementationRate,
        trend: "down",
        priority: "high",
        actionable: true,
      });
    }

    // Insight sur les catégories les plus travaillées
    const maxCategory = Object.entries(metrics.categoryBreakdown).reduce(
      (a, b) => (a[1] > b[1] ? a : b)
    );

    if (maxCategory[1] > 0) {
      const categoryNames = {
        nutrition: "nutrition",
        variety: "variété alimentaire",
        portion: "gestion des portions",
        timing: "horaires des repas",
      };

      insights.push({
        type: "info",
        title: "Zone de focus principale",
        description: `La ${
          categoryNames[maxCategory[0] as keyof typeof categoryNames]
        } représente votre principal axe d'amélioration.`,
        icon: "lucide:focus",
        value: maxCategory[1],
        priority: "medium",
        actionable: false,
      });
    }

    // Insight sur la régularité des repas (basé sur les données de repas)
    if (meals.length >= 7) {
      const last7Days = meals.slice(0, 7);
      const daysWithMeals = new Set(
        last7Days.map((m) => new Date(m.datetime).toDateString())
      ).size;

      if (daysWithMeals >= 6) {
        insights.push({
          type: "success",
          title: "Excellente régularité",
          description: `Vous avez enregistré des repas sur ${daysWithMeals}/7 jours cette semaine.`,
          icon: "lucide:calendar-check",
          value: daysWithMeals,
          trend: "up",
          priority: "low",
          actionable: false,
        });
      } else if (daysWithMeals >= 4) {
        insights.push({
          type: "info",
          title: "Bonne régularité",
          description: `${daysWithMeals}/7 jours avec des repas enregistrés. Essayez d'être plus régulier.`,
          icon: "lucide:calendar",
          value: daysWithMeals,
          trend: "stable",
          priority: "medium",
          actionable: true,
        });
      } else {
        insights.push({
          type: "improvement",
          title: "Améliorer la régularité",
          description: `Seulement ${daysWithMeals}/7 jours avec des repas. Une saisie plus régulière améliorerait les recommandations.`,
          icon: "lucide:calendar-x",
          value: daysWithMeals,
          trend: "down",
          priority: "high",
          actionable: true,
        });
      }
    }

    // Actions suggérées basiques
    if (metrics.implementationRate < 50) {
      suggestedActions.push({
        title: "Commencez par les priorités hautes",
        description:
          "Concentrez-vous sur les recommandations marquées comme haute priorité pour un impact maximum.",
        category: "nutrition",
        difficulty: "easy",
        estimatedImpact: "high",
      });
    }

    if (metrics.priorityBreakdown.high > 0) {
      suggestedActions.push({
        title: "Planifiez votre semaine",
        description:
          "Choisissez 2-3 recommandations à implémenter cette semaine et planifiez comment les intégrer.",
        category: "nutrition",
        difficulty: "medium",
        estimatedImpact: "high",
      });
    }

    return { insights, suggestedActions };
  };

  // Méthodes pour calculer les métriques côté client (backward compatibility)
  const calculateMetrics = (recommendations: any[]): RecommendationMetrics => {
    const total = recommendations.length;
    const implemented = recommendations.filter(
      (r) => r.feedback === "helpful" || r.feedback === "very_helpful"
    ).length;

    const categoryBreakdown = {
      nutrition: recommendations.filter((r) => r.category === "nutrition")
        .length,
      variety: recommendations.filter((r) => r.category === "variety").length,
      portion: recommendations.filter((r) => r.category === "portion").length,
      timing: recommendations.filter((r) => r.category === "timing").length,
    };

    const priorityBreakdown = {
      high: recommendations.filter((r) => r.priority === "high").length,
      medium: recommendations.filter((r) => r.priority === "medium").length,
      low: recommendations.filter((r) => r.priority === "low").length,
    };

    // Calculer les progrès hebdomadaires (4 dernières semaines)
    const weeklyProgress = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekRecommendations = recommendations.filter((r) => {
        const createdAt = new Date(r.created_at);
        return createdAt >= weekStart && createdAt <= weekEnd;
      });

      const weekImplemented = weekRecommendations.filter(
        (r) => r.feedback === "helpful" || r.feedback === "very_helpful"
      ).length;

      weeklyProgress.push({
        week: `S${i === 0 ? "actuelle" : i === 1 ? "dernière" : `${i + 1}`}`,
        implemented: weekImplemented,
        total: weekRecommendations.length,
      });
    }

    return {
      totalRecommendations: total,
      implementedCount: implemented,
      implementationRate:
        total > 0 ? Math.round((implemented / total) * 100) : 0,
      categoryBreakdown,
      priorityBreakdown,
      weeklyProgress,
    };
  };

  return {
    // État réactif - combiner les états de useMeals et local
    isLoading: computed(() => isLoading.value || mealsLoading.value),
    error: computed(() => error.value || mealsError.value),
    metricsData: readonly(metricsData),
    aiInsights: readonly(aiInsights),

    // Données directes depuis useMeals pour la compatibilité
    recommendations: readonly(recommendations),
    meals: readonly(meals),

    // Méthodes
    fetchMetrics,
    generateAIInsights,

    // Méthodes héritées (backward compatibility)
    calculateMetrics,
    generateInsights: generateBasicInsights,
  };
};
