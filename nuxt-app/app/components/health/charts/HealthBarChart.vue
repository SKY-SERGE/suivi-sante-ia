<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <Icon name="lucide:bar-chart-3" class="h-5 w-5 mr-2" />
        {{ title }}
      </CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="relative h-64 w-full">
        <svg class="w-full h-full" viewBox="0 0 400 200">
          <!-- Grille de fond -->
          <defs>
            <pattern
              id="barGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#f0f0f0"
                stroke-width="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#barGrid)" />

          <!-- Barres -->
          <g v-for="(bar, index) in bars" :key="index">
            <rect
              :x="bar.x"
              :y="bar.y"
              :width="bar.width"
              :height="bar.height"
              :fill="getBarColor(bar.value, index)"
              :class="barClass"
              @mouseenter="hoveredBar = index"
              @mouseleave="hoveredBar = null"
            >
              <title>{{ bar.label }}: {{ formatValue(bar.value) }}</title>
            </rect>

            <!-- Labels des barres -->
            <text
              :x="bar.x + bar.width / 2"
              :y="190"
              text-anchor="middle"
              class="text-xs fill-gray-600"
            >
              {{ bar.shortLabel }}
            </text>

            <!-- Valeurs au-dessus des barres -->
            <text
              v-if="showValues"
              :x="bar.x + bar.width / 2"
              :y="bar.y - 5"
              text-anchor="middle"
              class="text-xs fill-gray-700 font-medium"
            >
              {{ formatValue(bar.value) }}
            </text>
          </g>

          <!-- Ligne de référence (moyenne) -->
          <line
            v-if="showAverageLine && averageY"
            x1="30"
            :x2="370"
            :y1="averageY"
            :y2="averageY"
            stroke="#ff6b6b"
            stroke-width="2"
            stroke-dasharray="5,5"
          />

          <!-- Label de la moyenne -->
          <text
            v-if="showAverageLine && averageY"
            x="375"
            :y="averageY + 4"
            class="text-xs fill-red-500"
          >
            Moy: {{ formatValue(average) }}
          </text>

          <!-- Labels d'axe Y -->
          <text x="5" y="15" class="text-xs fill-gray-500">
            {{ formatValue(maxValue) }}
          </text>
          <text x="5" y="105" class="text-xs fill-gray-500">
            {{ formatValue((maxValue + minValue) / 2) }}
          </text>
          <text x="5" y="175" class="text-xs fill-gray-500">
            {{ formatValue(minValue) }}
          </text>
        </svg>
      </div>

      <!-- Légende -->
      <div v-if="showLegend" class="mt-4 flex flex-wrap gap-4 text-sm">
        <div
          v-for="(item, index) in legendItems"
          :key="index"
          class="flex items-center"
        >
          <div
            class="w-3 h-3 rounded mr-2"
            :style="{ backgroundColor: item.color }"
          />
          <span>{{ item.label }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
interface DataPoint {
  label: string;
  value: number;
  date?: string;
  metadata?: Record<string, any>;
}

interface Props {
  data: DataPoint[];
  title: string;
  description?: string;
  unit?: string;
  showValues?: boolean;
  showAverageLine?: boolean;
  showLegend?: boolean;
  colorScheme?: "blue" | "green" | "purple" | "gradient" | "health";
  barClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showValues: true,
  showAverageLine: false,
  showLegend: false,
  colorScheme: "blue",
  barClass: "transition-all duration-200 hover:opacity-80",
});

const hoveredBar = ref<number | null>(null);

const values = computed(() => props.data.map((item) => item.value));
const maxValue = computed(() => Math.max(...values.value, 0));
const minValue = computed(() => Math.min(...values.value, 0));
const average = computed(() => {
  if (values.value.length === 0) return 0;
  return values.value.reduce((sum, val) => sum + val, 0) / values.value.length;
});

const bars = computed(() => {
  const margin = 30;
  const chartWidth = 400 - margin * 2;
  const chartHeight = 170;
  const barWidth = Math.max(20, (chartWidth - 10) / props.data.length - 5);

  return props.data.map((item, index) => {
    const barHeight =
      (chartHeight * (item.value - minValue.value)) /
      (maxValue.value - minValue.value);
    const x = margin + index * (barWidth + 5);
    const y = 170 - barHeight;

    return {
      x,
      y,
      width: barWidth,
      height: Math.max(2, barHeight),
      value: item.value,
      label: item.label,
      shortLabel:
        item.label.length > 8 ? item.label.substring(0, 6) + ".." : item.label,
    };
  });
});

const averageY = computed(() => {
  if (!props.showAverageLine) return null;
  const chartHeight = 170;
  return (
    170 -
    (chartHeight * (average.value - minValue.value)) /
      (maxValue.value - minValue.value)
  );
});

const formatValue = (value: number) => {
  const unit = props.unit || "";
  return `${value.toFixed(1)} ${unit}`.trim();
};

const getBarColor = (value: number, index: number) => {
  const isHovered = hoveredBar.value === index;
  const opacity = isHovered ? 0.8 : 1;

  switch (props.colorScheme) {
    case "green":
      return `rgba(34, 197, 94, ${opacity})`;
    case "purple":
      return `rgba(147, 51, 234, ${opacity})`;
    case "gradient":
      const ratio =
        (value - minValue.value) / (maxValue.value - minValue.value);
      const r = Math.round(255 * (1 - ratio) + 34 * ratio);
      const g = Math.round(197 * ratio + 100 * (1 - ratio));
      const b = Math.round(94 * ratio + 255 * (1 - ratio));
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    case "health":
      // Couleur basée sur la valeur de santé
      if (value < average.value * 0.7) return `rgba(239, 68, 68, ${opacity})`; // Rouge
      if (value > average.value * 1.3) return `rgba(34, 197, 94, ${opacity})`; // Vert
      return `rgba(251, 191, 36, ${opacity})`; // Jaune
    default:
      return `rgba(59, 130, 246, ${opacity})`;
  }
};

const legendItems = computed(() => {
  if (!props.showLegend || props.colorScheme !== "health") return [];

  return [
    { label: "Bas", color: "rgba(239, 68, 68, 1)" },
    { label: "Normal", color: "rgba(251, 191, 36, 1)" },
    { label: "Élevé", color: "rgba(34, 197, 94, 1)" },
  ];
});
</script>
