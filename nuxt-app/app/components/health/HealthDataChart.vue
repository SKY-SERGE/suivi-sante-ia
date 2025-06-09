<template>
  <div class="space-y-6">
    <!-- Graphique de tendance simple -->
    <Card v-if="chartData.length > 1">
      <CardHeader>
        <CardTitle class="flex items-center">
          <Icon name="lucide:trending-up" class="h-5 w-5 mr-2" />
          Tendance - {{ getTypeName(dataType) }}
        </CardTitle>
        <CardDescription>Évolution sur les derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="relative h-64 w-full">
          <!-- Graphique linéaire simple -->
          <svg class="w-full h-full" viewBox="0 0 400 200">
            <!-- Grille de fond -->
            <defs>
              <pattern
                id="grid"
                width="40"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 20"
                  fill="none"
                  stroke="#f0f0f0"
                  stroke-width="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <!-- Ligne de tendance -->
            <polyline
              :points="getChartPoints()"
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
            />

            <!-- Points de données -->
            <circle
              v-for="(point, index) in getChartCoordinates()"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              r="4"
              fill="#3b82f6"
              class="cursor-pointer hover:r-6 transition-all"
            >
              <title>{{ formatPointTooltip(chartData[index]) }}</title>
            </circle>

            <!-- Labels d'axe Y -->
            <text x="10" y="15" class="text-xs fill-gray-500">
              {{ maxValue.toFixed(1) }}
            </text>
            <text x="10" y="105" class="text-xs fill-gray-500">
              {{ ((maxValue + minValue) / 2).toFixed(1) }}
            </text>
            <text x="10" y="195" class="text-xs fill-gray-500">
              {{ minValue.toFixed(1) }}
            </text>
          </svg>

          <!-- Labels d'axe X -->
          <div class="flex justify-between mt-2 text-xs text-gray-500">
            <span>{{ formatDate(chartData[0]?.recorded_at) }}</span>
            <span>{{
              formatDate(chartData[chartData.length - 1]?.recorded_at)
            }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Statistiques récapitulatives -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <Icon
              name="lucide:trending-up"
              class="h-8 w-8 text-green-500 mr-3"
            />
            <div>
              <p class="text-sm text-gray-600">Valeur maximale</p>
              <p class="text-xl font-semibold">{{ formatValue(maxValue) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <Icon name="lucide:activity" class="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p class="text-sm text-gray-600">Moyenne</p>
              <p class="text-xl font-semibold">
                {{ formatValue(averageValue) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <Icon
              name="lucide:trending-down"
              class="h-8 w-8 text-orange-500 mr-3"
            />
            <div>
              <p class="text-sm text-gray-600">Valeur minimale</p>
              <p class="text-xl font-semibold">{{ formatValue(minValue) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Conseils basés sur les données -->
    <Card v-if="getHealthTip()">
      <CardHeader>
        <CardTitle class="flex items-center">
          <Icon name="lucide:lightbulb" class="h-5 w-5 mr-2" />
          Conseil santé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-gray-700">{{ getHealthTip() }}</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: Array<{
    id: string;
    value?: number;
    unit?: string;
    recorded_at: string;
    metadata?: Record<string, any>;
  }>;
  dataType: string;
}

const props = defineProps<Props>();

// Computed pour les données du graphique
const chartData = computed(() => {
  return props.data
    .filter((item) => item.value !== undefined && item.value !== null)
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    .slice(-30); // Derniers 30 points maximum
});

const values = computed(() =>
  chartData.value.map((item) => item.value as number)
);

const maxValue = computed(() => Math.max(...values.value, 0));
const minValue = computed(() => Math.min(...values.value, 0));
const averageValue = computed(() => {
  if (values.value.length === 0) return 0;
  return values.value.reduce((sum, val) => sum + val, 0) / values.value.length;
});

// Méthodes pour le graphique
const getChartCoordinates = () => {
  const margin = 40;
  const width = 400 - margin * 2;
  const height = 200 - margin;

  if (chartData.value.length === 0) return [];

  return chartData.value.map((item, index) => {
    const x = margin + (index / (chartData.value.length - 1)) * width;
    const y =
      margin +
      (1 - (item.value! - minValue.value) / (maxValue.value - minValue.value)) *
        (height - margin);
    return { x, y };
  });
};

const getChartPoints = () => {
  return getChartCoordinates()
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
};

const formatPointTooltip = (item: (typeof chartData.value)[0]) => {
  const date = formatDate(item.recorded_at);
  const value = formatValue(item.value!);
  return `${date}: ${value}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
};

const formatValue = (value: number) => {
  const unit = props.data[0]?.unit || "";
  return `${value.toFixed(1)} ${unit}`.trim();
};

const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    mood: "Humeur",
    sleep: "Sommeil",
    activity: "Activité",
    symptoms: "Symptômes",
    weight: "Poids",
    blood_pressure: "Tension artérielle",
    heart_rate: "Fréquence cardiaque",
    temperature: "Température",
  };
  return names[type] || type;
};

const getHealthTip = () => {
  if (chartData.value.length < 3) return null;

  const trend = getTrendDirection();
  const currentValue = chartData.value[chartData.value.length - 1]?.value || 0;

  switch (props.dataType) {
    case "mood":
      if (trend === "declining" && currentValue <= 5) {
        return "Votre humeur semble en baisse. Pensez à faire des activités qui vous plaisent, à vous reposer suffisamment et n'hésitez pas à en parler à un proche ou un professionnel.";
      }
      if (trend === "improving" && currentValue >= 7) {
        return "Excellent ! Votre humeur s'améliore. Continuez vos bonnes habitudes !";
      }
      break;

    case "weight":
      if (trend === "declining") {
        return "Votre poids diminue. Assurez-vous que cela correspond à vos objectifs et consultez un professionnel si nécessaire.";
      }
      if (trend === "increasing") {
        return "Votre poids augmente. Si ce n'est pas votre objectif, pensez à ajuster votre alimentation et votre activité physique.";
      }
      break;

    case "sleep":
      if (currentValue < 7) {
        return "Vous ne dormez pas assez. Essayez de vous coucher plus tôt et de créer une routine de sommeil relaxante.";
      }
      if (currentValue > 9) {
        return "Vous dormez beaucoup. Assurez-vous que la qualité de votre sommeil est bonne.";
      }
      break;
  }

  return "Continuez à suivre régulièrement vos données pour mieux comprendre votre santé.";
};

const getTrendDirection = () => {
  if (chartData.value.length < 3) return "stable";

  const recent = chartData.value.slice(-3);
  const values = recent.map((item) => item.value as number);

  const increasing = values.every((val, i) => i === 0 || val >= values[i - 1]);
  const decreasing = values.every((val, i) => i === 0 || val <= values[i - 1]);

  if (increasing && values[2] > values[0]) return "improving";
  if (decreasing && values[2] < values[0]) return "declining";

  return "stable";
};
</script>
