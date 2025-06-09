<template>
  <div class="space-y-8">
    <!-- Sélecteur de type de données -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center">
          <Icon name="lucide:bar-chart-4" class="h-5 w-5 mr-2" />
          Visualisation des données de santé
        </CardTitle>
        <CardDescription>
          Analysez vos données de santé avec des graphiques interactifs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium">Type de données:</label>
            <select
              v-model="selectedDataType"
              class="px-3 py-2 border border-gray-300 rounded-md"
              @change="updateCharts"
            >
              <option value="mood">Humeur</option>
              <option value="sleep">Sommeil</option>
              <option value="activity">Activité</option>
              <option value="weight">Poids</option>
              <option value="heart_rate">Fréquence cardiaque</option>
              <option value="blood_pressure">Tension artérielle</option>
              <option value="temperature">Température</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium">Période d'analyse:</label>
            <select
              v-model="analysisMode"
              class="px-3 py-2 border border-gray-300 rounded-md"
              @change="updateCharts"
            >
              <option value="day">Par jour</option>
              <option value="week">Par semaine</option>
              <option value="month">Par mois</option>
            </select>
          </div>

          <button
            @click="refreshData"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Icon
              :name="loading ? 'lucide:loader-2' : 'lucide:refresh-cw'"
              :class="['h-4 w-4 mr-2', loading && 'animate-spin']"
            />
            Actualiser
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Message si pas de données -->
    <Card v-if="!loading && chartData.length === 0">
      <CardContent class="text-center py-12">
        <Icon
          name="lucide:bar-chart-3"
          class="h-16 w-16 mx-auto text-gray-400 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Aucune donnée disponible
        </h3>
        <p class="text-gray-500 mb-4">
          Commencez par enregistrer des données de
          {{ getDataTypeName(selectedDataType) }} pour voir les graphiques.
        </p>
        <NuxtLink
          to="/patient/health-data"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
          Ajouter des données
        </NuxtLink>
      </CardContent>
    </Card>

    <!-- Graphiques de visualisation -->
    <div v-else-if="!loading" class="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <!-- Graphique linéaire avancé -->
      <div class="xl:col-span-2">
        <HealthAdvancedChart
          :data="chartData"
          :title="`Évolution de ${getDataTypeName(selectedDataType)}`"
          :description="`Tendance détaillée sur ${chartData.length} points de données`"
          :unit="getDataUnit(selectedDataType)"
          :line-color="getDataTypeColor(selectedDataType)"
          :show-trend-line="true"
          :annotations="chartAnnotations"
        />
      </div>

      <!-- Graphique en barres par période -->
      <HealthBarChart
        :data="barChartData"
        :title="`${getDataTypeName(selectedDataType)} par ${
          analysisMode === 'day'
            ? 'jour'
            : analysisMode === 'week'
            ? 'semaine'
            : 'mois'
        }`"
        :description="`Moyenne ${
          analysisMode === 'day'
            ? 'quotidienne'
            : analysisMode === 'week'
            ? 'hebdomadaire'
            : 'mensuelle'
        }`"
        :unit="getDataUnit(selectedDataType)"
        :color-scheme="getBarChartColorScheme(selectedDataType)"
        :show-values="true"
        :show-average-line="true"
      />

      <!-- Graphique circulaire de distribution -->
      <HealthPieChart
        v-if="pieChartData.length > 0"
        :data="pieChartData"
        :title="`Distribution de ${getDataTypeName(selectedDataType)}`"
        :description="'Répartition par catégories'"
        :color-scheme="getPieChartColorScheme(selectedDataType)"
        :donut-style="true"
        :show-stats="true"
        :center-text="{
          label: 'Total',
          value: pieChartData
            .reduce((sum, item) => sum + item.value, 0)
            .toString(),
        }"
      />
    </div>

    <!-- Insights et recommandations -->
    <Card v-if="!loading && insights.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center">
          <Icon name="lucide:lightbulb" class="h-5 w-5 mr-2" />
          Analyses et recommandations
        </CardTitle>
        <CardDescription>
          Conseils basés sur vos données de
          {{ getDataTypeName(selectedDataType) }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div
            v-for="(insight, index) in insights"
            :key="index"
            class="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <Icon
              name="lucide:info"
              class="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
            />
            <p class="text-blue-800">{{ insight }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Statistiques détaillées -->
    <Card v-if="!loading && chartData.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center">
          <Icon name="lucide:calculator" class="h-5 w-5 mr-2" />
          Statistiques détaillées
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-gray-900">
              {{ stats.min?.toFixed(1) || "0.0" }}
            </div>
            <div class="text-sm text-gray-600">Minimum</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-gray-900">
              {{ stats.max?.toFixed(1) || "0.0" }}
            </div>
            <div class="text-sm text-gray-600">Maximum</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">
              {{ stats.average.toFixed(1) }}
            </div>
            <div class="text-sm text-gray-600">Moyenne</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">
              {{ stats.median.toFixed(1) }}
            </div>
            <div class="text-sm text-gray-600">Médiane</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div
              class="text-2xl font-bold"
              :class="getTrendColorClass(stats.trend)"
            >
              {{ getTrendText(stats.trend) }}
            </div>
            <div class="text-sm text-gray-600">Tendance</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- État de chargement -->
    <Card v-if="loading">
      <CardContent class="text-center py-12">
        <Icon
          name="lucide:loader-2"
          class="h-8 w-8 mx-auto animate-spin text-blue-600 mb-4"
        />
        <p class="text-gray-600">Chargement des données de visualisation...</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type {
  ChartDataPoint,
  BarChartDataPoint,
  PieChartDataPoint,
} from "@/composables/useHealthCharts";

// Importation des composants de graphiques
import HealthAdvancedChart from "@/components/health/charts/HealthAdvancedChart.vue";
import HealthBarChart from "@/components/health/charts/HealthBarChart.vue";
import HealthPieChart from "@/components/health/charts/HealthPieChart.vue";

const {
  transformHealthDataForChart,
  analyzeDataByPeriod,
  analyzeDataDistribution,
  calculateStats,
  generateHealthInsights,
  getHealthRanges,
  getDataTypeColor,
} = useHealthCharts();

// État local
const selectedDataType = ref("mood");
const analysisMode = ref<"day" | "week" | "month">("week");
const loading = ref(false);

// Données réactives
const rawHealthData = ref<
  Array<{
    id: string;
    data_type: string;
    value?: number;
    unit?: string;
    recorded_at: string;
    metadata?: Record<string, any>;
  }>
>([]);

const chartData = computed<ChartDataPoint[]>(() => {
  return transformHealthDataForChart(
    rawHealthData.value,
    selectedDataType.value
  );
});

const barChartData = computed<BarChartDataPoint[]>(() => {
  return analyzeDataByPeriod(chartData.value, analysisMode.value);
});

const pieChartData = computed<PieChartDataPoint[]>(() => {
  const ranges = getHealthRanges(selectedDataType.value);
  if (ranges.length === 0) return [];
  return analyzeDataDistribution(chartData.value, ranges);
});

const stats = computed(() => {
  return calculateStats(chartData.value);
});

const insights = computed(() => {
  return generateHealthInsights(
    selectedDataType.value,
    stats.value,
    chartData.value
  );
});

const chartAnnotations = computed(() => {
  // Ajouter des annotations pour les événements importants
  // Par exemple, dates de consultation, changements de traitement, etc.
  return [];
});

// Méthodes utilitaires
const getDataTypeName = (dataType: string): string => {
  const names: Record<string, string> = {
    mood: "l'humeur",
    sleep: "le sommeil",
    activity: "l'activité",
    weight: "le poids",
    heart_rate: "la fréquence cardiaque",
    blood_pressure: "la tension artérielle",
    temperature: "la température",
  };
  return names[dataType] || dataType;
};

const getDataUnit = (dataType: string): string => {
  const units: Record<string, string> = {
    mood: "/10",
    sleep: "h",
    activity: "min",
    weight: "kg",
    heart_rate: "bpm",
    blood_pressure: "mmHg",
    temperature: "°C",
  };
  return units[dataType] || "";
};

const getBarChartColorScheme = (
  dataType: string
): "blue" | "green" | "purple" | "gradient" | "health" => {
  const schemes: Record<
    string,
    "blue" | "green" | "purple" | "gradient" | "health"
  > = {
    mood: "health",
    sleep: "blue",
    activity: "green",
    weight: "purple",
    heart_rate: "health",
    blood_pressure: "health",
    temperature: "gradient",
  };
  return schemes[dataType] || "blue";
};

const getPieChartColorScheme = (
  dataType: string
): "default" | "health" | "mood" | "rainbow" => {
  const schemes: Record<string, "default" | "health" | "mood" | "rainbow"> = {
    mood: "mood",
    sleep: "default",
    activity: "health",
    weight: "default",
    heart_rate: "health",
    blood_pressure: "health",
    temperature: "rainbow",
  };
  return schemes[dataType] || "default";
};

const getTrendText = (trend: string): string => {
  const texts: Record<string, string> = {
    increasing: "↗ Hausse",
    decreasing: "↘ Baisse",
    stable: "→ Stable",
  };
  return texts[trend] || "N/A";
};

const getTrendColorClass = (trend: string): string => {
  const classes: Record<string, string> = {
    increasing: "text-green-600",
    decreasing: "text-red-600",
    stable: "text-gray-600",
  };
  return classes[trend] || "text-gray-600";
};

// Méthodes de gestion des données
const loadHealthData = async () => {
  loading.value = true;
  try {
    // Simuler le chargement des données (à remplacer par l'API réelle)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Données d'exemple pour la démonstration
    const exampleData = generateExampleData(selectedDataType.value);
    rawHealthData.value = exampleData;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  } finally {
    loading.value = false;
  }
};

const generateExampleData = (dataType: string) => {
  const now = new Date();
  const data = [];

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    let value: number;

    switch (dataType) {
      case "mood":
        value = Math.random() * 4 + 5 + Math.sin(i / 7) * 2; // Varie entre 3 et 9
        break;
      case "sleep":
        value = Math.random() * 2 + 7 + Math.sin(i / 7) * 1; // Varie entre 6 et 10 heures
        break;
      case "weight":
        value = 70 + Math.sin(i / 30) * 5 + (Math.random() - 0.5); // Varie autour de 70kg
        break;
      case "heart_rate":
        value = Math.random() * 20 + 70; // Varie entre 70 et 90 bpm
        break;
      default:
        value = Math.random() * 10;
    }

    if (Math.random() > 0.2) {
      // 80% de chance d'avoir une donnée
      data.push({
        id: `${dataType}-${i}`,
        data_type: dataType,
        value: Math.round(value * 10) / 10,
        unit: getDataUnit(dataType),
        recorded_at: date.toISOString(),
        metadata: {},
      });
    }
  }

  return data;
};

const updateCharts = () => {
  loadHealthData();
};

const refreshData = () => {
  loadHealthData();
};

// Chargement initial
onMounted(() => {
  loadHealthData();
});

// Meta tags
definePageMeta({
  layout: "dashboard",
});
</script>
