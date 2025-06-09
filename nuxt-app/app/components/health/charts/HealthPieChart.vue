<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <Icon name="lucide:pie-chart" class="h-5 w-5 mr-2" />
        {{ title }}
      </CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-col lg:flex-row items-center gap-6">
        <!-- Graphique circulaire -->
        <div class="relative w-64 h-64">
          <svg class="w-full h-full" viewBox="0 0 200 200">
            <!-- Segments du graphique -->
            <g v-for="(segment, index) in segments" :key="index">
              <path
                :d="segment.path"
                :fill="segment.color"
                :class="pieClass"
                @mouseenter="hoveredSegment = index"
                @mouseleave="hoveredSegment = null"
                :transform="hoveredSegment === index ? 'translate(2, 2)' : ''"
              >
                <title>{{ segment.label }}: {{ segment.percentage }}%</title>
              </path>

              <!-- Labels des segments -->
              <text
                v-if="segment.percentage > 5"
                :x="segment.labelX"
                :y="segment.labelY"
                text-anchor="middle"
                class="text-xs fill-white font-medium"
              >
                {{ segment.percentage }}%
              </text>
            </g>

            <!-- Cercle central pour le style donut -->
            <circle
              v-if="donutStyle"
              cx="100"
              cy="100"
              :r="innerRadius"
              fill="white"
            />

            <!-- Texte central -->
            <g v-if="centerText">
              <text
                x="100"
                y="95"
                text-anchor="middle"
                class="text-sm fill-gray-600"
              >
                {{ centerText.label }}
              </text>
              <text
                x="100"
                y="110"
                text-anchor="middle"
                class="text-xl font-bold fill-gray-900"
              >
                {{ centerText.value }}
              </text>
            </g>
          </svg>
        </div>

        <!-- Légende -->
        <div class="flex-1 space-y-3">
          <div
            v-for="(item, index) in legendItems"
            :key="index"
            :class="[
              'flex items-center justify-between p-3 rounded-lg border transition-all',
              hoveredSegment === index
                ? 'bg-gray-50 border-gray-300'
                : 'border-gray-200',
            ]"
            @mouseenter="hoveredSegment = index"
            @mouseleave="hoveredSegment = null"
          >
            <div class="flex items-center">
              <div
                class="w-4 h-4 rounded-full mr-3"
                :style="{ backgroundColor: item.color }"
              />
              <span class="font-medium">{{ item.label }}</span>
            </div>
            <div class="text-right">
              <div class="font-semibold">{{ formatValue(item.value) }}</div>
              <div class="text-sm text-gray-500">{{ item.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques supplémentaires -->
      <div v-if="showStats" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ data.length }}</div>
          <div class="text-sm text-gray-600">Catégories</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-green-600">
            {{ formatValue(total) }}
          </div>
          <div class="text-sm text-gray-600">Total</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">
            {{ formatValue(average) }}
          </div>
          <div class="text-sm text-gray-600">Moyenne</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
interface DataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

interface Props {
  data: DataPoint[];
  title: string;
  description?: string;
  unit?: string;
  donutStyle?: boolean;
  showStats?: boolean;
  colorScheme?: "default" | "health" | "mood" | "rainbow";
  pieClass?: string;
  centerText?: {
    label: string;
    value: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  donutStyle: true,
  showStats: false,
  colorScheme: "default",
  pieClass: "transition-all duration-200 cursor-pointer hover:opacity-80",
});

const hoveredSegment = ref<number | null>(null);

const radius = 80;
const innerRadius = props.donutStyle ? 40 : 0;

const total = computed(() =>
  props.data.reduce((sum, item) => sum + item.value, 0)
);
const average = computed(() => total.value / props.data.length);

const segments = computed(() => {
  let currentAngle = -90; // Commencer par le haut

  return props.data.map((item, index) => {
    const percentage = (item.value / total.value) * 100;
    const angle = (item.value / total.value) * 360;

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Conversion en radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calcul des points de l'arc
    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);

    // Points internes pour le style donut
    const innerX1 = 100 + innerRadius * Math.cos(startRad);
    const innerY1 = 100 + innerRadius * Math.sin(startRad);
    const innerX2 = 100 + innerRadius * Math.cos(endRad);
    const innerY2 = 100 + innerRadius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    // Chemin SVG pour le segment
    const path = props.donutStyle
      ? `M ${innerX1} ${innerY1} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`
      : `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    // Position du label
    const labelAngle = (startAngle + endAngle) / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelRadius = props.donutStyle
      ? (radius + innerRadius) / 2
      : radius * 0.7;
    const labelX = 100 + labelRadius * Math.cos(labelRad);
    const labelY = 100 + labelRadius * Math.sin(labelRad);

    currentAngle = endAngle;

    return {
      path,
      color: item.color || getColor(index),
      percentage: Math.round(percentage),
      label: item.label,
      value: item.value,
      labelX,
      labelY,
    };
  });
});

const legendItems = computed(() => {
  return props.data.map((item, index) => ({
    label: item.label,
    value: item.value,
    color: item.color || getColor(index),
    percentage: Math.round((item.value / total.value) * 100),
  }));
});

const formatValue = (value: number) => {
  const unit = props.unit || "";
  return `${value.toFixed(1)} ${unit}`.trim();
};

const getColor = (index: number) => {
  const colorSchemes = {
    default: [
      "#3b82f6",
      "#ef4444",
      "#22c55e",
      "#f59e0b",
      "#8b5cf6",
      "#06b6d4",
      "#f97316",
      "#84cc16",
    ],
    health: [
      "#22c55e",
      "#fbbf24",
      "#ef4444",
      "#06b6d4",
      "#8b5cf6",
      "#f97316",
      "#84cc16",
      "#f59e0b",
    ],
    mood: [
      "#22c55e",
      "#84cc16",
      "#fbbf24",
      "#f97316",
      "#ef4444",
      "#dc2626",
      "#991b1b",
      "#7f1d1d",
    ],
    rainbow: [
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#eab308",
      "#84cc16",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#6366f1",
      "#8b5cf6",
      "#d946ef",
      "#ec4899",
    ],
  };

  const colors = colorSchemes[props.colorScheme] || colorSchemes.default;
  return colors[index % colors.length];
};
</script>
