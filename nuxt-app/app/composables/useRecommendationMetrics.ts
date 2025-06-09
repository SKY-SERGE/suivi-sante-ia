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
}

export const useRecommendationMetrics = () => {
  // Calculer les métriques des recommandations
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

  // Générer des insights basés sur les métriques
  const generateInsights = (
    metrics: RecommendationMetrics,
    meals: any[]
  ): RecommendationInsight[] => {
    const insights: RecommendationInsight[] = [];

    // Insight sur le taux d'implémentation
    if (metrics.implementationRate >= 80) {
      insights.push({
        type: "success",
        title: "Excellent suivi !",
        description: `Vous suivez ${metrics.implementationRate}% de vos recommandations. Continuez !`,
        icon: "lucide:trophy",
        value: metrics.implementationRate,
        trend: "up",
      });
    } else if (metrics.implementationRate >= 50) {
      insights.push({
        type: "info",
        title: "Bon progrès",
        description: `Vous suivez ${metrics.implementationRate}% des recommandations. Essayez d'en implémenter quelques-unes de plus.`,
        icon: "lucide:target",
        value: metrics.implementationRate,
        trend: "stable",
      });
    } else if (metrics.implementationRate > 0) {
      insights.push({
        type: "warning",
        title: "Potentiel d'amélioration",
        description: `Seulement ${metrics.implementationRate}% des recommandations sont suivies. Concentrez-vous sur les priorités hautes.`,
        icon: "lucide:alert-circle",
        value: metrics.implementationRate,
        trend: "down",
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
        });
      } else if (daysWithMeals >= 4) {
        insights.push({
          type: "info",
          title: "Bonne régularité",
          description: `${daysWithMeals}/7 jours avec des repas enregistrés. Essayez d'être plus régulier.`,
          icon: "lucide:calendar",
          value: daysWithMeals,
          trend: "stable",
        });
      } else {
        insights.push({
          type: "improvement",
          title: "Améliorer la régularité",
          description: `Seulement ${daysWithMeals}/7 jours avec des repas. Une saisie plus régulière améliorerait les recommandations.`,
          icon: "lucide:calendar-x",
          value: daysWithMeals,
          trend: "down",
        });
      }
    }

    return insights;
  };

  return {
    calculateMetrics,
    generateInsights,
  };
};
