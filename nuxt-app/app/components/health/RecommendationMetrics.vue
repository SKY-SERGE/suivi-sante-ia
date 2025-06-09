<template>
  <div class="space-y-6">
    <!-- En-tête avec métriques principales -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">
              Total recommandations
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metrics.totalRecommendations }}
            </p>
          </div>
          <Icon name="lucide:lightbulb" class="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Suivies</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metrics.implementedCount }}
            </p>
          </div>
          <Icon name="lucide:check-circle" class="h-8 w-8 text-green-500" />
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Taux de suivi</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metrics.implementationRate }}%
            </p>
          </div>
          <Icon name="lucide:trending-up" class="h-8 w-8 text-purple-500" />
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Cette semaine</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ currentWeekProgress }}
            </p>
          </div>
          <Icon name="lucide:calendar" class="h-8 w-8 text-orange-500" />
        </div>
      </Card>
    </div>

    <!-- Insights personnalisés -->
    <div v-if="insights.length > 0" class="space-y-3">
      <h4 class="text-lg font-semibold text-gray-900 flex items-center">
        <Icon name="lucide:brain" class="mr-2 h-5 w-5 text-blue-600" />
        Insights personnalisés
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          v-for="insight in insights"
          :key="insight.title"
          :class="['p-4 border-l-4', getInsightBorderColor(insight.type)]"
        >
          <div class="flex items-start space-x-3">
            <div
              :class="getInsightIconColor(insight.type)"
              class="p-2 rounded-lg"
            >
              <Icon :name="insight.icon" class="h-5 w-5" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <h5 class="font-medium text-gray-900">{{ insight.title }}</h5>
                <div v-if="insight.trend" class="flex items-center space-x-1">
                  <Icon
                    :name="getTrendIcon(insight.trend)"
                    :class="getTrendColor(insight.trend)"
                    class="h-4 w-4"
                  />
                  <span
                    v-if="insight.value"
                    class="text-sm font-medium text-gray-700"
                  >
                    {{ insight.value
                    }}{{
                      insight.type === "success" || insight.type === "info"
                        ? "%"
                        : ""
                    }}
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-600">{{ insight.description }}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Graphiques de distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Distribution par catégorie -->
      <Card class="p-6">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">
          Répartition par catégorie
        </h4>
        <div class="space-y-3">
          <div
            v-for="(value, category) in metrics.categoryBreakdown"
            :key="category"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div
                :class="getCategoryColor(category)"
                class="w-4 h-4 rounded-full"
              ></div>
              <span class="text-sm font-medium text-gray-700 capitalize">
                {{ getCategoryName(category) }}
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div
                  :class="getCategoryColor(category)"
                  :style="{ width: `${getCategoryPercentage(value)}%` }"
                  class="h-2 rounded-full transition-all duration-300"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-8">{{
                value
              }}</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Distribution par priorité -->
      <Card class="p-6">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">
          Répartition par priorité
        </h4>
        <div class="space-y-3">
          <div
            v-for="(value, priority) in metrics.priorityBreakdown"
            :key="priority"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div
                :class="getPriorityColor(priority)"
                class="w-4 h-4 rounded-full"
              ></div>
              <span class="text-sm font-medium text-gray-700 capitalize">
                {{ getPriorityName(priority) }}
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div
                  :class="getPriorityColor(priority)"
                  :style="{ width: `${getPriorityPercentage(value)}%` }"
                  class="h-2 rounded-full transition-all duration-300"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-8">{{
                value
              }}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Progression hebdomadaire -->
    <Card class="p-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">
        Progression des 4 dernières semaines
      </h4>
      <div class="grid grid-cols-4 gap-4">
        <div
          v-for="week in metrics.weeklyProgress"
          :key="week.week"
          class="text-center"
        >
          <div class="mb-2">
            <div
              class="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center relative"
            >
              <!-- Cercle de progression -->
              <svg
                class="w-16 h-16 transform -rotate-90 absolute"
                viewBox="0 0 64 64"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                  class="text-gray-300"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                  :stroke-dasharray="175.93"
                  :stroke-dashoffset="
                    175.93 - (175.93 * getWeekProgress(week)) / 100
                  "
                  class="text-blue-500 transition-all duration-300"
                />
              </svg>

              <!-- Pourcentage au centre -->
              <div class="flex flex-col items-center">
                <span class="text-xs font-bold text-gray-900">
                  {{ getWeekProgress(week) }}%
                </span>
              </div>
            </div>
          </div>

          <div class="text-xs text-gray-600">{{ week.week }}</div>
          <div class="text-xs text-gray-500">
            {{ week.implemented }}/{{ week.total }}
          </div>
        </div>
      </div>
    </Card>

    <!-- Actions suggérées -->
    <Card v-if="suggestedActions.length > 0" class="p-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Icon name="lucide:target" class="mr-2 h-5 w-5 text-green-600" />
        Actions suggérées
      </h4>
      <div class="space-y-3">
        <div
          v-for="action in suggestedActions"
          :key="action.title"
          class="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <Icon
            name="lucide:arrow-right"
            class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
          />
          <div>
            <h6 class="text-sm font-medium text-green-900">
              {{ action.title }}
            </h6>
            <p class="text-sm text-green-800">{{ action.description }}</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type {
  RecommendationMetrics,
  RecommendationInsight,
} from "@/composables/useRecommendationMetrics";

interface Props {
  recommendations: any[];
  meals: any[];
}

const props = defineProps<Props>();

// Utilisation du composable pour calculer les métriques
const { calculateMetrics, generateInsights } = useRecommendationMetrics();

// Computed properties pour les métriques calculées dynamiquement
const metrics = computed(() => calculateMetrics(props.recommendations));
const insights = computed(() => generateInsights(metrics.value, props.meals));

// Computed
const currentWeekProgress = computed(() => {
  const currentWeek =
    metrics.value.weeklyProgress[metrics.value.weeklyProgress.length - 1];
  return currentWeek
    ? `${currentWeek.implemented}/${currentWeek.total}`
    : "0/0";
});

const suggestedActions = computed(() => {
  const actions = [];

  if (metrics.value.implementationRate < 50) {
    actions.push({
      title: "Commencez par les priorités hautes",
      description:
        "Concentrez-vous sur les recommandations marquées comme haute priorité pour un impact maximum.",
    });
  }

  if (metrics.value.priorityBreakdown.high > 0) {
    actions.push({
      title: "Planifiez votre semaine",
      description:
        "Choisissez 2-3 recommandations à implémenter cette semaine et planifiez comment les intégrer.",
    });
  }

  const lowActivityCategories = Object.entries(metrics.value.categoryBreakdown)
    .filter(([_, count]) => count === 0)
    .map(([category, _]) => category);

  if (lowActivityCategories.length > 0) {
    actions.push({
      title: "Explorez de nouveaux domaines",
      description: `Vous pourriez bénéficier de recommandations en ${lowActivityCategories.join(
        ", "
      )}.`,
    });
  }

  return actions;
});

// Methods
const getInsightBorderColor = (type: string) => {
  const colors: Record<string, string> = {
    success: "border-l-green-500",
    warning: "border-l-yellow-500",
    info: "border-l-blue-500",
    improvement: "border-l-purple-500",
  };
  return colors[type] || "border-l-gray-500";
};

const getInsightIconColor = (type: string) => {
  const colors: Record<string, string> = {
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    info: "bg-blue-100 text-blue-600",
    improvement: "bg-purple-100 text-purple-600",
  };
  return colors[type] || "bg-gray-100 text-gray-600";
};

const getTrendIcon = (trend: string) => {
  const icons: Record<string, string> = {
    up: "lucide:trending-up",
    down: "lucide:trending-down",
    stable: "lucide:minus",
  };
  return icons[trend] || "lucide:minus";
};

const getTrendColor = (trend: string) => {
  const colors: Record<string, string> = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-gray-500",
  };
  return colors[trend] || "text-gray-500";
};

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    nutrition: "Nutrition",
    variety: "Variété",
    portion: "Portions",
    timing: "Horaires",
  };
  return names[category] || category;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    nutrition: "bg-green-500",
    variety: "bg-pink-500",
    portion: "bg-purple-500",
    timing: "bg-orange-500",
  };
  return colors[category] || "bg-gray-500";
};

const getCategoryPercentage = (value: number) => {
  const total = Object.values(metrics.value.categoryBreakdown).reduce(
    (a: number, b: number) => a + b,
    0
  );
  return total > 0 ? Math.round((value / total) * 100) : 0;
};

const getPriorityName = (priority: string) => {
  const names: Record<string, string> = {
    high: "Haute",
    medium: "Moyenne",
    low: "Faible",
  };
  return names[priority] || priority;
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-gray-500",
  };
  return colors[priority] || "bg-gray-500";
};

const getPriorityPercentage = (value: number) => {
  const total = Object.values(metrics.value.priorityBreakdown).reduce(
    (a: number, b: number) => a + b,
    0
  );
  return total > 0 ? Math.round((value / total) * 100) : 0;
};

const getWeekProgress = (week: any) => {
  return week.total > 0 ? Math.round((week.implemented / week.total) * 100) : 0;
};
</script>
