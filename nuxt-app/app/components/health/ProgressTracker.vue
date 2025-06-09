<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Suivi des progrès</h2>
        <p class="text-gray-600">
          Analyse de vos progrès par rapport à vos objectifs de santé
        </p>
      </div>
      <div class="flex gap-2">
        <Button
          @click="refreshData"
          variant="outline"
          size="sm"
          :disabled="loading"
          class="flex items-center gap-2"
        >
          <Icon
            name="lucide:refresh-cw"
            class="h-4 w-4"
            :class="{ 'animate-spin': loading }"
          />
          Actualiser
        </Button>
        <NuxtLink to="/patient/goals">
          <Button size="sm" class="flex items-center gap-2">
            <Icon name="lucide:plus" class="h-4 w-4" />
            Nouveaux objectifs
          </Button>
        </NuxtLink>
      </div>
    </div>

    <!-- Filtres de période -->
    <Card class="p-4">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:calendar" class="h-4 w-4 text-gray-500" />
          <span class="text-sm font-medium">Période d'analyse:</span>
        </div>
        <select
          v-model="selectedPeriod"
          class="text-sm border rounded px-3 py-1"
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">3 derniers mois</option>
        </select>
      </div>
    </Card>

    <!-- Chargement -->
    <div v-if="loading" class="flex justify-center p-8">
      <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-blue-500" />
    </div>

    <!-- Contenu principal -->
    <div v-else class="space-y-6">
      <!-- Résumé des objectifs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card class="p-4 bg-green-50 border-green-200">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="lucide:check-circle" class="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-green-700">Objectifs atteints</p>
              <p class="text-2xl font-bold text-green-800">
                {{ achievedGoalsCount }}
              </p>
            </div>
          </div>
        </Card>

        <Card class="p-4 bg-yellow-50 border-yellow-200">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="lucide:clock" class="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm text-yellow-700">En cours</p>
              <p class="text-2xl font-bold text-yellow-800">
                {{ activeGoalsCount }}
              </p>
            </div>
          </div>
        </Card>

        <Card class="p-4 bg-red-50 border-red-200">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="lucide:alert-triangle" class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p class="text-sm text-red-700">Nécessitent attention</p>
              <p class="text-2xl font-bold text-red-800">
                {{ strugglingGoalsCount }}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Analyse des objectifs individuels -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Analyse détaillée des objectifs
        </h3>

        <div
          v-if="goalAnalysis.length === 0"
          class="text-center p-8 text-gray-500"
        >
          <Icon
            name="lucide:target"
            class="h-12 w-12 mx-auto mb-4 text-gray-300"
          />
          <p>Aucun objectif actif trouvé</p>
          <NuxtLink to="/patient/goals">
            <Button class="mt-4">Créer un objectif</Button>
          </NuxtLink>
        </div>

        <div v-else class="space-y-4">
          <Card
            v-for="analysis in goalAnalysis"
            :key="analysis.goal.id"
            class="p-6 hover:shadow-md transition-shadow"
          >
            <div class="space-y-4">
              <!-- En-tête de l'objectif -->
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <Icon
                      :name="getMetricIcon(analysis.goal.metric_type)"
                      class="h-5 w-5"
                      :class="getMetricColor(analysis.goal.metric_type)"
                    />
                    <h4 class="font-semibold text-gray-900">
                      {{ analysis.goal.title }}
                    </h4>
                    <span
                      class="px-2 py-1 text-xs rounded-full"
                      :class="getStatusBadgeClass(analysis.status)"
                    >
                      {{ analysis.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">
                    {{ analysis.goal.description }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">
                    Objectif: {{ analysis.goal.target_value }}
                    {{ analysis.goal.unit }}
                  </div>
                  <div class="text-sm text-gray-500">
                    Échéance: {{ formatDate(analysis.goal.target_date) }}
                  </div>
                </div>
              </div>

              <!-- Barre de progression -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Progrès actuel</span>
                  <span class="font-medium">
                    {{ analysis.currentValue?.toFixed(1) || "N/A" }} /
                    {{ analysis.goal.target_value }} {{ analysis.goal.unit }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getProgressBarColor(analysis.progressPercentage)"
                    :style="{
                      width: `${Math.min(analysis.progressPercentage, 100)}%`,
                    }"
                  ></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span class="font-medium"
                    >{{ analysis.progressPercentage.toFixed(1) }}%</span
                  >
                  <span>100%</span>
                </div>
              </div>

              <!-- Tendance et insights -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <h5 class="text-sm font-medium text-gray-700">
                    Tendance récente
                  </h5>
                  <div class="flex items-center gap-2">
                    <Icon
                      :name="
                        analysis.trend === 'improving'
                          ? 'lucide:trending-up'
                          : analysis.trend === 'declining'
                          ? 'lucide:trending-down'
                          : 'lucide:minus'
                      "
                      class="h-4 w-4"
                      :class="
                        analysis.trend === 'improving'
                          ? 'text-green-500'
                          : analysis.trend === 'declining'
                          ? 'text-red-500'
                          : 'text-gray-500'
                      "
                    />
                    <span class="text-sm text-gray-600">
                      {{ getTrendText(analysis.trend) }}
                    </span>
                  </div>
                </div>

                <div class="space-y-2">
                  <h5 class="text-sm font-medium text-gray-700">
                    Dernière mesure
                  </h5>
                  <div class="text-sm text-gray-600">
                    {{
                      analysis.lastMeasurement
                        ? formatDate(analysis.lastMeasurement.date)
                        : "Aucune donnée"
                    }}
                  </div>
                </div>
              </div>

              <!-- Recommandations -->
              <div
                v-if="analysis.recommendations.length > 0"
                class="bg-blue-50 rounded-lg p-4"
              >
                <h5
                  class="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2"
                >
                  <Icon name="lucide:lightbulb" class="h-4 w-4" />
                  Recommandations
                </h5>
                <ul class="space-y-1">
                  <li
                    v-for="recommendation in analysis.recommendations"
                    :key="recommendation"
                    class="text-sm text-blue-800 flex items-start gap-2"
                  >
                    <Icon
                      name="lucide:chevron-right"
                      class="h-3 w-3 mt-0.5 flex-shrink-0"
                    />
                    {{ recommendation }}
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Goal {
  id: string;
  title: string;
  description: string;
  metric_type: string;
  target_value: number;
  target_date: string;
  unit: string;
  status: string;
}

interface HealthData {
  recorded_at: string;
  metric_type: string;
  mood_rating?: number;
  sleep_hours?: number;
  sleep_quality?: number;
  steps?: number;
  calories_burned?: number;
  heart_rate?: number;
  weight?: number;
}

interface GoalAnalysis {
  goal: Goal;
  currentValue: number | null;
  progressPercentage: number;
  status: "achieved" | "on-track" | "behind" | "struggling";
  trend: "improving" | "stable" | "declining";
  lastMeasurement: { date: string; value: number } | null;
  recommendations: string[];
}

const props = withDefaults(
  defineProps<{
    userId?: string;
  }>(),
  {
    userId: "",
  }
);

const { $supabase } = useNuxtApp();
const toastStore = useToastStore();

// État réactif
const loading = ref(false);
const selectedPeriod = ref("30");
const goalAnalysis = ref<GoalAnalysis[]>([]);

// Statistiques calculées
const achievedGoalsCount = computed(
  () => goalAnalysis.value.filter((a) => a.status === "achieved").length
);
const activeGoalsCount = computed(
  () => goalAnalysis.value.filter((a) => a.status === "on-track").length
);
const strugglingGoalsCount = computed(
  () =>
    goalAnalysis.value.filter(
      (a) => a.status === "behind" || a.status === "struggling"
    ).length
);

// Méthodes utilitaires
const getMetricIcon = (metricType: string) => {
  const icons = {
    mood: "lucide:smile",
    sleep: "lucide:moon",
    activity: "lucide:activity",
    weight: "lucide:scale",
    heart_rate: "lucide:heart-pulse",
  };
  return icons[metricType as keyof typeof icons] || "lucide:target";
};

const getMetricColor = (metricType: string) => {
  const colors = {
    mood: "text-yellow-500",
    sleep: "text-blue-500",
    activity: "text-green-500",
    weight: "text-purple-500",
    heart_rate: "text-red-500",
  };
  return colors[metricType as keyof typeof colors] || "text-gray-500";
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    achieved: "bg-green-100 text-green-800",
    "on-track": "bg-blue-100 text-blue-800",
    behind: "bg-yellow-100 text-yellow-800",
    struggling: "bg-red-100 text-red-800",
  };
  return classes[status as keyof typeof classes] || "bg-gray-100 text-gray-800";
};

const getProgressBarColor = (percentage: number) => {
  if (percentage >= 90) return "bg-green-500";
  if (percentage >= 70) return "bg-blue-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

const getTrendText = (trend: string) => {
  const texts = {
    improving: "En amélioration",
    stable: "Stable",
    declining: "En baisse",
  };
  return texts[trend as keyof typeof texts] || "Indéterminé";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Analyse des objectifs
const analyzeGoalProgress = async () => {
  try {
    const user = await $supabase.auth.getUser();
    if (!user.data.user) return;

    const targetUserId = props.userId || user.data.user.id;

    // Récupérer les objectifs actifs
    const { data: goals, error: goalsError } = await $supabase
      .from("health_goals")
      .select("*")
      .eq("user_id", targetUserId)
      .eq("status", "active");

    if (goalsError) {
      console.error("Erreur lors du chargement des objectifs:", goalsError);
      return;
    }

    if (!goals || goals.length === 0) {
      goalAnalysis.value = [];
      return;
    }

    // Période d'analyse
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(selectedPeriod.value));

    // Récupérer les données de santé pour la période
    const { data: healthData, error: healthError } = await $supabase
      .from("health_data")
      .select("*")
      .eq("user_id", targetUserId)
      .gte("recorded_at", fromDate.toISOString())
      .order("recorded_at", { ascending: true });

    if (healthError) {
      console.error(
        "Erreur lors du chargement des données de santé:",
        healthError
      );
      return;
    }

    // Analyser chaque objectif
    const analyses: GoalAnalysis[] = [];

    for (const goal of goals) {
      const relevantData =
        healthData?.filter((d) => isRelevantDataForGoal(d, goal)) || [];

      const analysis = analyzeIndividualGoal(goal, relevantData);
      analyses.push(analysis);
    }

    goalAnalysis.value = analyses;
  } catch (error) {
    console.error("Erreur lors de l'analyse des objectifs:", error);
    toastStore.error("Erreur lors de l'analyse des objectifs");
  }
};

const isRelevantDataForGoal = (data: HealthData, goal: Goal): boolean => {
  // Mapper les types de métriques aux champs de données
  const metricFieldMap = {
    mood: "mood_rating",
    sleep: "sleep_hours",
    activity: "steps",
    weight: "weight",
    heart_rate: "heart_rate",
  };

  const field = metricFieldMap[goal.metric_type as keyof typeof metricFieldMap];
  return (
    data.metric_type === goal.metric_type &&
    !!field &&
    data[field as keyof HealthData] != null
  );
};

const analyzeIndividualGoal = (
  goal: Goal,
  data: HealthData[]
): GoalAnalysis => {
  // Valeur actuelle (dernière mesure)
  const lastData = data[data.length - 1];
  const currentValue = getCurrentValueFromData(lastData, goal.metric_type);

  // Calcul du pourcentage de progression
  const progressPercentage = currentValue
    ? Math.min((currentValue / goal.target_value) * 100, 100)
    : 0;

  // Détermination du statut
  let status: GoalAnalysis["status"] = "struggling";
  if (progressPercentage >= 100) status = "achieved";
  else if (progressPercentage >= 80) status = "on-track";
  else if (progressPercentage >= 50) status = "behind";

  // Analyse de la tendance
  const trend = analyzeTrend(data, goal.metric_type);

  // Dernière mesure
  const lastMeasurement = lastData
    ? {
        date: lastData.recorded_at,
        value: currentValue || 0,
      }
    : null;

  // Recommandations
  const recommendations = generateRecommendations(
    goal,
    status,
    trend,
    progressPercentage
  );

  return {
    goal,
    currentValue,
    progressPercentage,
    status,
    trend,
    lastMeasurement,
    recommendations,
  };
};

const getCurrentValueFromData = (
  data: HealthData | undefined,
  metricType: string
): number | null => {
  if (!data) return null;

  const fieldMap = {
    mood: "mood_rating",
    sleep: "sleep_hours",
    activity: "steps",
    weight: "weight",
    heart_rate: "heart_rate",
  };

  const field = fieldMap[metricType as keyof typeof fieldMap];
  return field ? (data[field as keyof HealthData] as number) : null;
};

const analyzeTrend = (
  data: HealthData[],
  metricType: string
): GoalAnalysis["trend"] => {
  if (data.length < 2) return "stable";

  const values = data
    .map((d) => getCurrentValueFromData(d, metricType))
    .filter((v) => v !== null) as number[];

  if (values.length < 2) return "stable";

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const changePercentage = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (changePercentage > 5) return "improving";
  if (changePercentage < -5) return "declining";
  return "stable";
};

const generateRecommendations = (
  goal: Goal,
  status: GoalAnalysis["status"],
  trend: GoalAnalysis["trend"],
  progress: number
): string[] => {
  const recommendations: string[] = [];

  if (status === "achieved") {
    recommendations.push(
      "Félicitations ! Objectif atteint. Pensez à définir un nouvel objectif."
    );
  } else if (status === "struggling") {
    recommendations.push(
      "Objectif difficile à atteindre. Considérez ajuster la cible ou la stratégie."
    );
    if (trend === "declining") {
      recommendations.push(
        "Tendance en baisse détectée. Revisite votre approche."
      );
    }
  } else if (status === "behind" && trend === "declining") {
    recommendations.push(
      "Attention : vous prenez du retard. Intensifiez vos efforts."
    );
  }

  // Recommandations spécifiques par type de métrique
  if (goal.metric_type === "activity" && progress < 70) {
    recommendations.push(
      "Augmentez progressivement votre activité quotidienne."
    );
  } else if (goal.metric_type === "sleep" && progress < 70) {
    recommendations.push("Établissez une routine de sommeil régulière.");
  } else if (goal.metric_type === "mood" && progress < 70) {
    recommendations.push(
      "Considérez des activités de bien-être pour améliorer votre humeur."
    );
  }

  return recommendations;
};

const refreshData = () => {
  analyzeGoalProgress();
};

// Watchers
watch(selectedPeriod, () => {
  analyzeGoalProgress();
});

// Lifecycle
onMounted(() => {
  loading.value = true;
  analyzeGoalProgress().finally(() => {
    loading.value = false;
  });
});
</script>
