<template>
  <div class="space-y-6">
    <!-- Indicateur de chargement -->
    <div v-if="isLoading" class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <span class="ml-3 text-gray-600">Chargement des métriques...</span>
    </div>

    <!-- Affichage des erreurs -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <Icon name="lucide:alert-circle" class="h-5 w-5 text-red-600 mr-2" />
        <span class="text-red-800">{{ error }}</span>
      </div>
      <Button variant="outline" size="sm" class="mt-3" @click="loadMetrics">
        <Icon name="lucide:refresh-cw" class="h-4 w-4 mr-2" />
        Réessayer
      </Button>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="metricsData" class="space-y-6">
      <!-- Sélecteur de période -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-gray-900">Métriques de suivi</h3>
        <div class="flex space-x-2">
          <Button v-for="period in availablePeriods" :key="period.value"
            :variant="selectedPeriod === period.value ? 'default' : 'outline'" size="sm"
            @click="changePeriod(period.value)">
            {{ period.label }}
          </Button>
        </div>
      </div>

      <!-- En-tête avec métriques principales -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">
                Total recommandations
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ metricsData.metrics.totalRecommendations }}
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
                {{ metricsData.metrics.implementedCount }}
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
                {{ metricsData.metrics.implementationRate }}%
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

      <!-- Insights IA personnalisés -->
      <div v-if="aiInsights?.insights?.length" class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-semibold text-gray-900 flex items-center">
            <Icon name="lucide:brain" class="mr-2 h-5 w-5 text-blue-600" />
            Insights IA personnalisés
          </h4>
          <Button :disabled="isGeneratingInsights" variant="outline" size="sm" @click="refreshAIInsights">
            <Icon :name="isGeneratingInsights ? 'lucide:loader-2' : 'lucide:refresh-cw'"
              :class="['h-4 w-4 mr-2', { 'animate-spin': isGeneratingInsights }]" />
            {{ isGeneratingInsights ? 'Génération...' : 'Actualiser' }}
          </Button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card v-for="insight in aiInsights.insights" :key="insight.title"
            :class="['p-4 border-l-4', getInsightBorderColor(insight.type)]">
            <div class="flex items-start space-x-3">
              <div :class="getInsightIconColor(insight.type)" class="p-2 rounded-lg">
                <Icon :name="insight.icon" class="h-5 w-5" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <h5 class="font-medium text-gray-900">{{ insight.title }}</h5>
                  <div v-if="insight.trend" class="flex items-center space-x-1">
                    <Icon :name="getTrendIcon(insight.trend)" :class="getTrendColor(insight.trend)" class="h-4 w-4" />
                    <span v-if="insight.value" class="text-sm font-medium text-gray-700">
                      {{ insight.value }}%
                    </span>
                  </div>
                </div>
                <p class="text-sm text-gray-600">{{ insight.description }}</p>
                <div v-if="insight.priority" class="mt-2">
                  <span :class="getPriorityBadgeColor(insight.priority)"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                    {{ getPriorityLabel(insight.priority) }}
                  </span>
                </div>
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
            <div v-for="(value, category) in metricsData.metrics.categoryBreakdown" :key="category"
              class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div :class="getCategoryColor(category)" class="w-4 h-4 rounded-full" />
                <span class="text-sm font-medium text-gray-700 capitalize">
                  {{ getCategoryName(category) }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 rounded-full h-2">
                  <div :class="getCategoryColor(category)" :style="{ width: `${getCategoryPercentage(value)}%` }"
                    class="h-2 rounded-full transition-all duration-300" />
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
            <div v-for="(value, priority) in metricsData.metrics.priorityBreakdown" :key="priority"
              class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div :class="getPriorityColor(priority)" class="w-4 h-4 rounded-full" />
                <span class="text-sm font-medium text-gray-700 capitalize">
                  {{ getPriorityName(priority) }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 rounded-full h-2">
                  <div :class="getPriorityColor(priority)" :style="{ width: `${getPriorityPercentage(value)}%` }"
                    class="h-2 rounded-full transition-all duration-300" />
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
          <div v-for="week in metricsData.metrics.weeklyProgress" :key="week.week" class="text-center">
            <div class="mb-2">
              <div class="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center relative">
                <!-- Cercle de progression -->
                <svg class="w-16 h-16 transform -rotate-90 absolute" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="none"
                    class="text-gray-300" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="none"
                    :stroke-dasharray="175.93" :stroke-dashoffset="175.93 - (175.93 * getWeekProgress(week)) / 100
                      " class="text-blue-500 transition-all duration-300" />
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

      <!-- Actions suggérées par l'IA -->
      <Card v-if="aiInsights?.suggestedActions?.length" class="p-6">
        <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Icon name="lucide:target" class="mr-2 h-5 w-5 text-green-600" />
          Actions suggérées par l'IA
        </h4>
        <div class="space-y-3">
          <div v-for="action in aiInsights.suggestedActions" :key="action.title"
            class="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Icon name="lucide:arrow-right" class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <h6 class="text-sm font-medium text-green-900">
                  {{ action.title }}
                </h6>
                <div class="flex items-center space-x-2">
                  <span :class="getDifficultyColor(action.difficulty)" class="px-2 py-1 rounded-full text-xs">
                    {{ getDifficultyLabel(action.difficulty) }}
                  </span>
                  <span :class="getImpactColor(action.estimatedImpact)" class="px-2 py-1 rounded-full text-xs">
                    {{ getImpactLabel(action.estimatedImpact) }}
                  </span>
                </div>
              </div>
              <p class="text-sm text-green-800">{{ action.description }}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealData, MealRecommendation } from "@/types/models";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Props (optionnelles pour backward compatibility)
interface Props {
  recommendations?: MealRecommendation[];
  meals?: MealData[];
  userProfile?: any;
}

const props = withDefaults(defineProps<Props>(), {
  recommendations: () => [],
  meals: () => [],
  userProfile: () => ({}),
});

// Utilisation du nouveau composable avec APIs
const {
  isLoading,
  error,
  metricsData,
  aiInsights,
  fetchMetrics,
  generateAIInsights,
  calculateMetrics,
  generateInsights,
} = useRecommendationMetrics();

// État local
const selectedPeriod = ref('30d');
const isGeneratingInsights = ref(false);

// Périodes disponibles
const availablePeriods = [
  { label: '7j', value: '7d' },
  { label: '30j', value: '30d' },
  { label: '90j', value: '90d' },
  { label: '1an', value: '1y' },
];

// Computed properties
const currentWeekProgress = computed(() => {
  if (!metricsData.value) return "0/0";
  const currentWeek = metricsData.value.metrics.weeklyProgress[metricsData.value.metrics.weeklyProgress.length - 1];
  return currentWeek
    ? `${currentWeek.implemented}/${currentWeek.total}`
    : "0/0";
});

// Méthodes
const loadMetrics = async () => {
  try {
    await fetchMetrics(selectedPeriod.value);
    // Charger les insights IA après les métriques
    await refreshAIInsights();
  } catch (err) {
    console.error('Erreur chargement métriques:', err);
  }
};

const changePeriod = async (period: string) => {
  selectedPeriod.value = period;
  await loadMetrics();
};

const refreshAIInsights = async () => {
  if (!metricsData.value) return;

  isGeneratingInsights.value = true;
  try {
    await generateAIInsights(props.userProfile);
  } catch (err) {
    console.error('Erreur génération insights:', err);
    // Utiliser les insights basiques en fallback
    // Utiliser les insights basiques en fallback
    const basicInsights = generateInsights(
      JSON.parse(JSON.stringify(metricsData.value.metrics)),
      JSON.parse(JSON.stringify(metricsData.value.meals))
    );
    // Appliquer manuellement les insights basiques
    // Note: Cette partie pourrait être améliorée avec un state management plus sophistiqué
  } finally {
    isGeneratingInsights.value = false;
  }
};

// Methods pour le style (reprises de la version précédente)
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
  if (!metricsData.value) return 0;
  const total = Object.values(metricsData.value.metrics.categoryBreakdown).reduce(
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
  if (!metricsData.value) return 0;
  const total = Object.values(metricsData.value.metrics.priorityBreakdown).reduce(
    (a: number, b: number) => a + b,
    0
  );
  return total > 0 ? Math.round((value / total) * 100) : 0;
};

const getWeekProgress = (week: any) => {
  return week.total > 0 ? Math.round((week.implemented / week.total) * 100) : 0;
};

const getPriorityBadgeColor = (priority: string) => {
  const colors: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-gray-100 text-gray-800",
  };
  return colors[priority] || "bg-gray-100 text-gray-800";
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    high: "Priorité haute",
    medium: "Priorité moyenne",
    low: "Priorité faible",
  };
  return labels[priority] || priority;
};

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };
  return colors[difficulty] || "bg-gray-100 text-gray-800";
};

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",
  };
  return labels[difficulty] || difficulty;
};

const getImpactColor = (impact: string) => {
  const colors: Record<string, string> = {
    high: "bg-purple-100 text-purple-800",
    medium: "bg-blue-100 text-blue-800",
    low: "bg-gray-100 text-gray-800",
  };
  return colors[impact] || "bg-gray-100 text-gray-800";
};

const getImpactLabel = (impact: string) => {
  const labels: Record<string, string> = {
    high: "Impact élevé",
    medium: "Impact moyen",
    low: "Impact faible",
  };
  return labels[impact] || impact;
};

// Chargement initial
onMounted(() => {
  loadMetrics();
});

// Watcher pour les props (backward compatibility)
watch(
  () => [props.recommendations, props.meals],
  () => {
    // Si des props sont fournies, utiliser le mode client-side
    if (props.recommendations.length > 0 && !metricsData.value) {
      const calculatedMetrics = calculateMetrics(props.recommendations);
      const basicInsights = generateInsights(calculatedMetrics, props.meals);
      // Note: Pour une véritable compatibilité, nous devrions exposer ces données
      // via un state management ou adapter la structure des données
    }
  },
  { immediate: true }
);
</script>
