<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <Icon name="lucide:activity" class="h-5 w-5 mr-2" />
        {{ title }}
      </CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Contrôles du graphique -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium">Période:</label>
          <select
            v-model="selectedPeriod"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm"
            @change="updateChart"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">1 an</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium">Type:</label>
          <select
            v-model="chartType"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="line">Ligne</option>
            <option value="area">Zone</option>
            <option value="points">Points</option>
          </select>
        </div>

        <button
          v-if="showTrendLine"
          @click="toggleTrendLine"
          :class="[
            'px-3 py-1 text-sm rounded-md transition-colors',
            trendLineVisible
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300',
          ]"
        >
          Ligne de tendance
        </button>
      </div>

      <!-- Graphique principal -->
      <div class="relative h-80 w-full">
        <svg class="w-full h-full" viewBox="0 0 500 300">
          <!-- Grille de fond -->
          <defs>
            <pattern
              id="lineGrid"
              width="25"
              height="25"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 25 0 L 0 0 0 25"
                fill="none"
                stroke="#f3f4f6"
                stroke-width="1"
              />
            </pattern>

            <!-- Gradient pour zone -->
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                :style="`stop-color:${lineColor};stop-opacity:0.3`"
              />
              <stop
                offset="100%"
                :style="`stop-color:${lineColor};stop-opacity:0.05`"
              />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#lineGrid)" />

          <!-- Zone remplie (si type area) -->
          <path
            v-if="chartType === 'area' && areaPath"
            :d="areaPath"
            fill="url(#areaGradient)"
          />

          <!-- Ligne principale -->
          <polyline
            v-if="(chartType === 'line' || chartType === 'area') && chartPoints"
            :points="chartPoints"
            fill="none"
            :stroke="lineColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Ligne de tendance -->
          <line
            v-if="trendLineVisible && trendLine"
            :x1="trendLine.x1"
            :y1="trendLine.y1"
            :x2="trendLine.x2"
            :y2="trendLine.y2"
            stroke="#f59e0b"
            stroke-width="2"
            stroke-dasharray="5,5"
          />

          <!-- Points de données -->
          <g v-for="(point, index) in dataPoints" :key="index">
            <circle
              :cx="point.x"
              :cy="point.y"
              :r="point.radius"
              :fill="point.color"
              :stroke="point.strokeColor"
              :stroke-width="point.strokeWidth"
              :class="pointClass"
              @mouseenter="showTooltip(point, index, $event)"
              @mouseleave="hideTooltip"
            />

            <!-- Indicateurs spéciaux -->
            <circle
              v-if="point.isHighlight"
              :cx="point.x"
              :cy="point.y"
              r="8"
              fill="none"
              stroke="#ef4444"
              stroke-width="2"
              opacity="0.7"
            />
          </g>

          <!-- Annotations -->
          <g
            v-for="(annotation, index) in annotations"
            :key="`annotation-${index}`"
          >
            <line
              :x1="annotation.x"
              :y1="20"
              :x2="annotation.x"
              :y2="260"
              stroke="#6b7280"
              stroke-width="1"
              stroke-dasharray="3,3"
              opacity="0.5"
            />
            <text
              :x="annotation.x"
              y="15"
              text-anchor="middle"
              class="text-xs fill-gray-500"
            >
              {{ annotation.label }}
            </text>
          </g>

          <!-- Axes et labels -->
          <!-- Axe Y -->
          <line
            x1="40"
            y1="20"
            x2="40"
            y2="260"
            stroke="#d1d5db"
            stroke-width="2"
          />
          <!-- Axe X -->
          <line
            x1="40"
            y1="260"
            x2="480"
            y2="260"
            stroke="#d1d5db"
            stroke-width="2"
          />

          <!-- Labels Y -->
          <g v-for="(label, index) in yLabels" :key="`y-${index}`">
            <text
              x="35"
              :y="label.y + 4"
              text-anchor="end"
              class="text-xs fill-gray-600"
            >
              {{ label.text }}
            </text>
            <line
              x1="35"
              :y1="label.y"
              x2="40"
              :y2="label.y"
              stroke="#d1d5db"
              stroke-width="1"
            />
          </g>

          <!-- Labels X -->
          <g v-for="(label, index) in xLabels" :key="`x-${index}`">
            <text
              :x="label.x"
              y="275"
              text-anchor="middle"
              class="text-xs fill-gray-600"
            >
              {{ label.text }}
            </text>
            <line
              :x1="label.x"
              y1="260"
              :x2="label.x"
              y2="265"
              stroke="#d1d5db"
              stroke-width="1"
            />
          </g>
        </svg>

        <!-- Tooltip -->
        <div
          v-if="tooltip.visible"
          :style="{
            position: 'absolute',
            left: tooltip.x + 'px',
            top: tooltip.y + 'px',
            transform: 'translate(-50%, -100%)',
          }"
          class="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10"
        >
          <div class="font-medium">{{ tooltip.title }}</div>
          <div>{{ tooltip.value }}</div>
          <div v-if="tooltip.date" class="text-gray-300">
            {{ tooltip.date }}
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-3 bg-blue-50 rounded-lg">
          <div class="text-lg font-bold text-blue-600">
            {{ formatValue(currentValue) }}
          </div>
          <div class="text-sm text-blue-700">Actuel</div>
        </div>
        <div class="text-center p-3 bg-green-50 rounded-lg">
          <div class="text-lg font-bold text-green-600">
            {{ formatValue(maxValue) }}
          </div>
          <div class="text-sm text-green-700">Maximum</div>
        </div>
        <div class="text-center p-3 bg-yellow-50 rounded-lg">
          <div class="text-lg font-bold text-yellow-600">
            {{ formatValue(averageValue) }}
          </div>
          <div class="text-sm text-yellow-700">Moyenne</div>
        </div>
        <div class="text-center p-3 bg-purple-50 rounded-lg">
          <div class="text-lg font-bold" :class="trendColorClass">
            {{ trendText }}
          </div>
          <div class="text-sm text-purple-700">Tendance</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
interface DataPoint {
  value: number;
  date: string;
  label?: string;
  metadata?: Record<string, any>;
  isHighlight?: boolean;
}

interface Props {
  data: DataPoint[];
  title: string;
  description?: string;
  unit?: string;
  showTrendLine?: boolean;
  lineColor?: string;
  pointClass?: string;
  annotations?: Array<{
    date: string;
    label: string;
  }>;
}

const props = withDefaults(defineProps<Props>(), {
  showTrendLine: true,
  lineColor: "#3b82f6",
  pointClass: "transition-all duration-200 cursor-pointer hover:r-6",
});

const selectedPeriod = ref(30);
const chartType = ref<"line" | "area" | "points">("line");
const trendLineVisible = ref(false);
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  title: "",
  value: "",
  date: "",
});

// Données filtrées par période
const filteredData = computed(() => {
  const now = new Date();
  const periodStart = new Date(
    now.getTime() - selectedPeriod.value * 24 * 60 * 60 * 1000
  );

  return props.data
    .filter((item) => new Date(item.date) >= periodStart)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

// Valeurs calculées
const values = computed(() => filteredData.value.map((item) => item.value));
const maxValue = computed(() => Math.max(...values.value, 0));
const minValue = computed(() => Math.min(...values.value, 0));
const averageValue = computed(() => {
  if (values.value.length === 0) return 0;
  return values.value.reduce((sum, val) => sum + val, 0) / values.value.length;
});
const currentValue = computed(() => {
  return filteredData.value.length > 0
    ? filteredData.value[filteredData.value.length - 1]?.value || 0
    : 0;
});

// Dimensions du graphique
const chartWidth = 440; // 480 - 40 (marge gauche)
const chartHeight = 240; // 260 - 20 (marge haut)
const chartLeft = 40;
const chartTop = 20;

// Points de données pour le graphique
const dataPoints = computed(() => {
  if (filteredData.value.length === 0) return [];

  return filteredData.value.map((item, index) => {
    const x =
      chartLeft + (index / (filteredData.value.length - 1)) * chartWidth;
    const y =
      chartTop +
      (1 - (item.value - minValue.value) / (maxValue.value - minValue.value)) *
        chartHeight;

    return {
      x,
      y,
      radius: item.isHighlight ? 6 : 4,
      color: item.isHighlight ? "#ef4444" : props.lineColor,
      strokeColor: "white",
      strokeWidth: 2,
      value: item.value,
      date: item.date,
      label: item.label || formatDate(item.date),
      isHighlight: item.isHighlight || false,
    };
  });
});

// Points pour la ligne
const chartPoints = computed(() => {
  return dataPoints.value.map((point) => `${point.x},${point.y}`).join(" ");
});

// Chemin pour la zone remplie
const areaPath = computed(() => {
  if (dataPoints.value.length === 0) return "";

  const points = dataPoints.value
    .map((point) => `${point.x},${point.y}`)
    .join(" L");
  const firstPoint = dataPoints.value[0];
  const lastPoint = dataPoints.value[dataPoints.value.length - 1];

  if (!firstPoint || !lastPoint) return "";

  return `M${firstPoint.x},260 L${points} L${lastPoint.x},260 Z`;
});

// Ligne de tendance
const trendLine = computed(() => {
  if (!trendLineVisible.value || filteredData.value.length < 2) return null;

  // Calcul de la régression linéaire simple
  const n = filteredData.value.length;
  const sumX = filteredData.value.reduce((sum, _, index) => sum + index, 0);
  const sumY = values.value.reduce((sum, val) => sum + val, 0);
  const sumXY = filteredData.value.reduce(
    (sum, item, index) => sum + index * item.value,
    0
  );
  const sumXX = filteredData.value.reduce(
    (sum, _, index) => sum + index * index,
    0
  );

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const startY = intercept;
  const endY = slope * (n - 1) + intercept;

  // Conversion en coordonnées SVG
  const y1 =
    chartTop +
    (1 - (startY - minValue.value) / (maxValue.value - minValue.value)) *
      chartHeight;
  const y2 =
    chartTop +
    (1 - (endY - minValue.value) / (maxValue.value - minValue.value)) *
      chartHeight;

  return {
    x1: chartLeft,
    y1,
    x2: chartLeft + chartWidth,
    y2,
  };
});

// Labels des axes
const yLabels = computed(() => {
  const labels = [];
  const steps = 5;

  for (let i = 0; i <= steps; i++) {
    const value =
      minValue.value + (maxValue.value - minValue.value) * (1 - i / steps);
    const y = chartTop + (i / steps) * chartHeight;

    labels.push({
      y,
      text: formatValue(value),
    });
  }

  return labels;
});

const xLabels = computed(() => {
  if (filteredData.value.length === 0) return [];

  const labels = [];
  const maxLabels = 6;
  const step = Math.max(1, Math.floor(filteredData.value.length / maxLabels));
  for (let i = 0; i < filteredData.value.length; i += step) {
    const item = filteredData.value[i];
    if (item) {
      const x = chartLeft + (i / (filteredData.value.length - 1)) * chartWidth;
      labels.push({
        x,
        text: formatDate(item.date),
      });
    }
  }

  return labels;
});

// Annotations
const annotations = computed(() => {
  if (!props.annotations || filteredData.value.length === 0) return [];

  const firstItem = filteredData.value[0];
  const lastItem = filteredData.value[filteredData.value.length - 1];

  if (!firstItem || !lastItem) return [];

  return props.annotations
    .filter((annotation) => {
      const annotationDate = new Date(annotation.date);
      const firstDate = new Date(firstItem.date);
      const lastDate = new Date(lastItem.date);
      return annotationDate >= firstDate && annotationDate <= lastDate;
    })
    .map((annotation) => {
      const annotationTime = new Date(annotation.date).getTime();
      const firstTime = new Date(firstItem.date).getTime();
      const lastTime = new Date(lastItem.date).getTime();

      const ratio = (annotationTime - firstTime) / (lastTime - firstTime);
      const x = chartLeft + ratio * chartWidth;

      return {
        x,
        label: annotation.label,
      };
    });
});

// Calcul de la tendance
const trendText = computed(() => {
  if (filteredData.value.length < 2) return "N/A";

  const recent = filteredData.value.slice(
    -Math.min(7, filteredData.value.length)
  );
  const recentAvg =
    recent.reduce((sum, item) => sum + item.value, 0) / recent.length;

  const older = filteredData.value.slice(
    0,
    Math.min(7, filteredData.value.length)
  );
  const olderAvg =
    older.reduce((sum, item) => sum + item.value, 0) / older.length;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (Math.abs(change) < 2) return "Stable";
  return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
});

const trendColorClass = computed(() => {
  if (trendText.value === "Stable") return "text-gray-600";
  if (trendText.value.startsWith("+")) return "text-green-600";
  return "text-red-600";
});

// Méthodes
const formatValue = (value: number) => {
  const unit = props.unit || "";
  return `${value.toFixed(1)} ${unit}`.trim();
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
};

const toggleTrendLine = () => {
  trendLineVisible.value = !trendLineVisible.value;
};

const updateChart = () => {
  // La réactivité se charge de la mise à jour
};

const showTooltip = (point: any, index: number, event?: MouseEvent) => {
  if (!event?.target) return;

  const rect = (event.target as Element).getBoundingClientRect();
  const container = (event.target as Element).closest(".relative");
  const containerRect = container?.getBoundingClientRect();

  tooltip.value = {
    visible: true,
    x: rect.left - (containerRect?.left || 0) + rect.width / 2,
    y: rect.top - (containerRect?.top || 0),
    title: point.label,
    value: formatValue(point.value),
    date: formatDate(point.date),
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};
</script>
