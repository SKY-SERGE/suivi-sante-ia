import { streamText, type CoreMessage } from "ai";
import { useAiSdk } from "~/composables/useAiSdk";

export default defineLazyEventHandler(async () => {
  const { googleAi } = useAiSdk();

  return defineEventHandler(async (event: any) => {
    const {
      metrics,
      recommendations,
      meals,
      userProfile,
      period,
    }: {
      metrics: any;
      recommendations: Array<any>;
      meals: Array<any>;
      userProfile?: any;
      period?: string;
    } = await readBody(event);

    // Prompt système pour la génération d'insights personnalisés
    const systemPrompt = `Tu es un expert en nutrition et analyse comportementale qui génère des insights personnalisés sur les habitudes alimentaires.

RÔLE :
- Analyser les métriques de recommandations
- Identifier les patterns comportementaux
- Générer des insights actionnables
- Proposer des améliorations concrètes

DONNÉES ANALYSÉES :
- Métriques de suivi des recommandations
- Historique des repas
- Progrès hebdomadaire
- Catégories d'amélioration

CRITÈRES D'ANALYSE :
- Taux d'implémentation des recommandations
- Régularité dans le suivi
- Répartition par catégories (nutrition, variété, portions, timing)
- Évolution temporelle
- Identification des points forts et axes d'amélioration

TYPES D'INSIGHTS :
- success: Réussites et points forts à célébrer
- warning: Points d'attention nécessitant une action
- info: Informations utiles sur les habitudes
- improvement: Axes d'amélioration identifiés

STRUCTURE DE RÉPONSE :
Génère exactement 3-4 insights et 2-3 actions suggérées au format JSON :
{
  "insights": [
    {
      "type": "success|warning|info|improvement",
      "title": "Titre concis et impactant",
      "description": "Description claire et actionnable (max 120 caractères)",
      "icon": "lucide:nom-icone",
      "value": nombre_optionnel,
      "trend": "up|down|stable",
      "priority": "high|medium|low",
      "actionable": true/false
    }
  ],
  "suggestedActions": [
    {
      "title": "Action concrète à réaliser",
      "description": "Description détaillée avec bénéfices attendus",
      "category": "nutrition|variety|portion|timing",
      "difficulty": "easy|medium|hard",
      "estimatedImpact": "high|medium|low"
    }
  ]
}

CONSIGNES :
- Sois spécifique et évite les généralités
- Utilise les données réelles pour personnaliser
- Reste encourageant et constructif
- Priorise selon l'impact potentiel
- Utilise des icônes Lucide appropriées
- Réponds uniquement en JSON valide
- Utilise le français`;

    try {
      // Préparer le contexte d'analyse
      const context = {
        totalRecommendations: metrics.totalRecommendations,
        implementationRate: metrics.implementationRate,
        implementedCount: metrics.implementedCount,
        categoryBreakdown: metrics.categoryBreakdown,
        priorityBreakdown: metrics.priorityBreakdown,
        weeklyProgress: metrics.weeklyProgress,
        mealsCount: meals?.length || 0,
        recentMeals: meals?.slice(0, 10) || [],
        period: period || "30d",
        userGoals: userProfile?.health_goals || [],
        dietaryRestrictions: userProfile?.dietary_restrictions || [],
      };

      // Calculer des métriques supplémentaires
      const daysWithMeals =
        meals?.length >= 7
          ? new Set(
              meals
                .slice(0, 7)
                .map((m: any) => new Date(m.datetime).toDateString())
            ).size
          : 0;

      const messages: CoreMessage[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyse ces données de suivi nutritionnel pour générer des insights personnalisés :

MÉTRIQUES DE RECOMMANDATIONS :
- Total de recommandations: ${context.totalRecommendations}
- Taux d'implémentation: ${context.implementationRate}%
- Recommandations suivies: ${context.implementedCount}

RÉPARTITION PAR CATÉGORIE :
${JSON.stringify(context.categoryBreakdown, null, 2)}

RÉPARTITION PAR PRIORITÉ :
${JSON.stringify(context.priorityBreakdown, null, 2)}

PROGRÈS HEBDOMADAIRE :
${JSON.stringify(context.weeklyProgress, null, 2)}

DONNÉES REPAS :
- Nombre de repas enregistrés: ${context.mealsCount}
- Jours avec repas (7 derniers): ${daysWithMeals}/7
- Période d'analyse: ${context.period}

${
  context.userGoals.length > 0
    ? `OBJECTIFS SANTÉ : ${JSON.stringify(context.userGoals)}`
    : ""
}
${
  context.dietaryRestrictions.length > 0
    ? `RESTRICTIONS ALIMENTAIRES : ${JSON.stringify(
        context.dietaryRestrictions
      )}`
    : ""
}

Génère des insights personnalisés et actionnables basés sur ces données.`,
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
          !parsedResponse.insights ||
          !Array.isArray(parsedResponse.insights)
        ) {
          throw new Error("Structure d'insights invalide");
        }

        return {
          success: true,
          insights: parsedResponse.insights,
          suggestedActions: parsedResponse.suggestedActions || [],
          generationTime: Date.now(),
          analysisContext: context,
        };
      } catch (parseError) {
        console.error("Erreur de parsing JSON insights:", parseError);

        // Fallback : insights par défaut
        const fallbackInsights = generateFallbackInsights(
          context,
          daysWithMeals
        );

        return {
          success: true,
          ...fallbackInsights,
          generationTime: Date.now(),
          fallback: true,
        };
      }
    } catch (error) {
      console.error("Recommendations insights error:", error);

      // Fallback en cas d'erreur complète
      const fallbackInsights = generateFallbackInsights(
        {
          totalRecommendations: metrics.totalRecommendations,
          implementationRate: metrics.implementationRate,
          implementedCount: metrics.implementedCount,
          categoryBreakdown: metrics.categoryBreakdown,
          priorityBreakdown: metrics.priorityBreakdown,
          weeklyProgress: metrics.weeklyProgress,
          mealsCount: meals?.length || 0,
        },
        0
      );

      return {
        success: false,
        error: "Erreur lors de la génération des insights",
        ...fallbackInsights,
        generationTime: Date.now(),
        fallback: true,
      };
    }
  });
});

// Fonction de fallback pour générer des insights de base
function generateFallbackInsights(context: any, daysWithMeals: number) {
  const insights = [];
  const suggestedActions = [];

  // Insight sur le taux d'implémentation
  if (context.implementationRate >= 80) {
    insights.push({
      type: "success",
      title: "Excellent suivi !",
      description: `Vous suivez ${context.implementationRate}% de vos recommandations. Continuez !`,
      icon: "lucide:trophy",
      value: context.implementationRate,
      trend: "up",
      priority: "high",
      actionable: false,
    });
  } else if (context.implementationRate >= 50) {
    insights.push({
      type: "info",
      title: "Bon progrès",
      description: `Vous suivez ${context.implementationRate}% des recommandations. Essayez d'en implémenter plus.`,
      icon: "lucide:target",
      value: context.implementationRate,
      trend: "stable",
      priority: "medium",
      actionable: true,
    });
  } else if (context.implementationRate > 0) {
    insights.push({
      type: "warning",
      title: "Potentiel d'amélioration",
      description: `Seulement ${context.implementationRate}% des recommandations suivies. Concentrez-vous sur les priorités.`,
      icon: "lucide:alert-circle",
      value: context.implementationRate,
      trend: "down",
      priority: "high",
      actionable: true,
    });
  } else {
    insights.push({
      type: "improvement",
      title: "Commencez votre parcours",
      description:
        "Aucune recommandation n'a encore été suivie. Commencez par les priorités hautes !",
      icon: "lucide:play-circle",
      value: 0,
      trend: "stable",
      priority: "high",
      actionable: true,
    });
  }

  // Insight sur la régularité des repas
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
  } else if (daysWithMeals > 0) {
    insights.push({
      type: "improvement",
      title: "Améliorer la régularité",
      description: `Seulement ${daysWithMeals}/7 jours avec des repas. Plus de régularité améliore les recommandations.`,
      icon: "lucide:calendar-x",
      value: daysWithMeals,
      trend: "down",
      priority: "high",
      actionable: true,
    });
  }

  // Insight sur les catégories
  if (context.categoryBreakdown) {
    const entries = Object.entries(context.categoryBreakdown) as [
      string,
      number
    ][];
    const maxCategory = entries.reduce((a, b) => (a[1] > b[1] ? a : b));

    if (maxCategory[1] > 0) {
      const categoryNames: Record<string, string> = {
        nutrition: "nutrition",
        variety: "variété alimentaire",
        portion: "gestion des portions",
        timing: "horaires des repas",
      };

      insights.push({
        type: "info",
        title: "Zone de focus principale",
        description: `La ${
          categoryNames[maxCategory[0]]
        } représente votre principal axe d'amélioration.`,
        icon: "lucide:focus",
        value: maxCategory[1],
        priority: "medium",
        actionable: false,
      });
    }
  }

  // Actions suggérées basiques
  if (context.implementationRate < 50) {
    suggestedActions.push({
      title: "Commencez par les priorités hautes",
      description:
        "Concentrez-vous sur les recommandations marquées comme haute priorité pour un impact maximum.",
      category: "nutrition",
      difficulty: "easy",
      estimatedImpact: "high",
    });
  }

  if (context.priorityBreakdown?.high > 0) {
    suggestedActions.push({
      title: "Planifiez votre semaine",
      description:
        "Choisissez 2-3 recommandations à implémenter cette semaine et planifiez comment les intégrer.",
      category: "nutrition",
      difficulty: "medium",
      estimatedImpact: "high",
    });
  }

  if (daysWithMeals < 5) {
    suggestedActions.push({
      title: "Améliorez la régularité",
      description:
        "Enregistrez vos repas plus régulièrement pour obtenir des recommandations plus précises.",
      category: "timing",
      difficulty: "easy",
      estimatedImpact: "medium",
    });
  }

  return { insights, suggestedActions };
}
