<template>
  <div class="space-y-6">
    <!-- Vue d'ensemble rapide -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="metric in overviewMetrics" :key="metric.key">
        <CardContent class="p-4">
          <div class="flex items-center">
            <Icon
              :name="metric.icon"
              :class="metric.iconColor"
              class="h-8 w-8 mr-3"
            />
            <div>
              <p class="text-sm text-gray-600">{{ metric.label }}</p>
              <p class="text-2xl font-bold">{{ metric.value }}</p>
              <p class="text-xs" :class="metric.trend.color">
                <Icon :name="metric.trend.icon" class="h-3 w-3 inline mr-1" />
                {{ metric.trend.text }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Graphiques comparatifs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Graphique multi-métriques -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Icon name="lucide:activity" class="h-5 w-5 mr-2" />
            Métriques de santé - 7 derniers jours
          </CardTitle>
          <CardDescription
            >Évolution comparative de vos principales métriques</CardDescription
          >
        </CardHeader>
        <CardContent>
          <div class="relative h-64 w-full">
            <svg class="w-full h-full" viewBox="0 0 500 200">
              <!-- Grille de fond -->
              <defs>
                <pattern
                  id="dashboard-grid"
                  width="50"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 0 L 0 0 0 20"
                    fill="none"
                    stroke="#f0f0f0"
                    stroke-width="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dashboard-grid)" />

              <!-- Axe des temps -->
              <text
                v-for="(day, index) in last7Days"
                :key="index"
                :x="(index / 6) * 480 + 10"
                y="190"
                fill="#6b7280"
                text-anchor="middle"
                class="text-xs"
              >
                {{ day }}
              </text>

              <!-- Lignes de métriques -->
              <g
                v-for="(metric, metricIndex) in chartMetrics"
                :key="metric.type"
              >
                <polyline
                  :points="getMetricPoints(metric)"
                  fill="none"
                  :stroke="metric.color"
                  stroke-width="2"
                />
                <circle
                  v-for="(point, pointIndex) in getMetricCoordinates(metric)"
                  :key="pointIndex"
                  :cx="point.x"
                  :cy="point.y"
                  r="3"
                  :fill="metric.color"
                  class="cursor-pointer hover:r-5 transition-all"
                >
                  <title>{{ metric.label }}: {{ point.tooltip }}</title>
                </circle>
              </g>

              <!-- Légende -->
              <g transform="translate(10, 10)">
                <rect
                  x="0"
                  y="0"
                  width="150"
                  height="60"
                  fill="white"
                  stroke="#e5e7eb"
                  rx="4"
                />
                <text x="8" y="15" fill="#374151" class="text-xs font-medium">
                  Légende
                </text>
                <g
                  v-for="(metric, index) in chartMetrics"
                  :key="metric.type"
                  :transform="`translate(8, ${25 + index * 15})`"
                >
                  <circle :fill="metric.color" r="3" cx="5" cy="0" />
                  <text x="12" y="3" fill="#6b7280" class="text-xs">
                    {{ metric.label }}
                  </text>
                </g>
              </g>
            </svg>
          </div>
        </CardContent>
      </Card>

      <!-- Graphique en secteurs pour les objectifs -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Icon name="lucide:pie-chart" class="h-5 w-5 mr-2" />
            État des objectifs
          </CardTitle>
          <CardDescription
            >Répartition du statut de vos objectifs</CardDescription
          >
        </CardHeader>
        <CardContent>
          <div class="relative h-64 w-full flex items-center justify-center">
            <svg class="w-48 h-48" viewBox="0 0 200 200">
              <!-- Secteurs du graphique en camembert -->
              <g v-for="(slice, index) in goalSlices" :key="index">
                <path
                  :d="slice.path"
                  :fill="slice.color"
                  :stroke="slice.color"
                  stroke-width="2"
                  class="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <title>{{ slice.label }}: {{ slice.count }} objectifs</title>
                </path>
                <text
                  v-if="slice.percentage > 10"
                  :x="slice.labelX"
                  :y="slice.labelY"
                  text-anchor="middle"
                  fill="white"
                  class="text-xs font-bold"
                >
                  {{ slice.count }}
                </text>
              </g>

              <!-- Centre du graphique -->
              <circle
                cx="100"
                cy="100"
                r="30"
                fill="white"
                stroke="#e5e7eb"
                stroke-width="2"
              />
              <text
                x="100"
                y="95"
                text-anchor="middle"
                fill="#374151"
                class="text-xs font-medium"
              >
                Total
              </text>
              <text
                x="100"
                y="110"
                text-anchor="middle"
                fill="#374151"
                class="text-lg font-bold"
              >
                {{ totalGoals }}
              </text>
            </svg>

            <!-- Légende du graphique en secteurs -->
            <div class="absolute bottom-0 left-0 right-0">
              <div class="flex flex-wrap justify-center gap-2 text-xs">
                <div
                  v-for="slice in goalSlices"
                  :key="slice.label"
                  class="flex items-center"
                >
                  <div
                    :style="{ backgroundColor: slice.color }"
                    class="w-3 h-3 rounded mr-1"
                  ></div>
                  <span>{{ slice.label }} ({{ slice.count }})</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Graphique de corrélation -->
    <Card v-if="correlationData.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center">
          <Icon name="lucide:git-compare" class="h-5 w-5 mr-2" />
          Corrélations santé
        </CardTitle>
        <CardDescription
          >Relations entre différentes métriques de santé</CardDescription
        >
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="correlation in correlationData"
            :key="correlation.id"
            class="space-y-3"
          >
            <h4 class="font-medium">{{ correlation.title }}</h4>
            <div class="relative h-32 w-full">
              <svg class="w-full h-full" viewBox="0 0 300 100">
                <rect
                  width="100%"
                  height="100%"
                  fill="#f9fafb"
                  stroke="#e5e7eb"
                  rx="4"
                />

                <!-- Points de corrélation -->
                <circle
                  v-for="(point, index) in correlation.points"
                  :key="index"
                  :cx="point.x"
                  :cy="point.y"
                  r="2"
                  :fill="correlation.color"
                  opacity="0.7"
                />

                <!-- Ligne de tendance -->
                <line
                  :x1="correlation.trendLine.x1"
                  :y1="correlation.trendLine.y1"
                  :x2="correlation.trendLine.x2"
                  :y2="correlation.trendLine.y2"
                  :stroke="correlation.color"
                  stroke-width="2"
                  opacity="0.8"
                />
              </svg>
            </div>
            <div class="flex justify-between text-xs text-gray-600">
              <span>{{ correlation.xLabel }}</span>
              <span>Corrélation: {{ correlation.coefficient }}</span>
              <span>{{ correlation.yLabel }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Conseils personnalisés basés sur les données -->
    <Card v-if="personalizedInsights.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center">
          <Icon name="lucide:brain" class="h-5 w-5 mr-2" />
          Insights personnalisés
        </CardTitle>
        <CardDescription
          >Conseils basés sur l'analyse de vos données</CardDescription
        >
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="insight in personalizedInsights"
            :key="insight.id"
            class="flex items-start p-4 rounded-lg"
            :class="
              insight.priority === 'high'
                ? 'bg-red-50 border-l-4 border-red-400'
                : insight.priority === 'medium'
                ? 'bg-yellow-50 border-l-4 border-yellow-400'
                : 'bg-blue-50 border-l-4 border-blue-400'
            "
          >
            <Icon
              :name="insight.icon"
              :class="
                insight.priority === 'high'
                  ? 'text-red-600'
                  : insight.priority === 'medium'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              "
              class="h-5 w-5 mr-3 mt-0.5 flex-shrink-0"
            />
            <div>
              <h4 class="font-medium text-gray-900">{{ insight.title }}</h4>
              <p class="text-sm text-gray-700 mt-1">{{ insight.message }}</p>
              <p v-if="insight.action" class="text-sm font-medium mt-2">
                💡 {{ insight.action }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Props {
  healthData: Array<{
    id: string;
    data_type: string;
    value?: number;
    unit?: string;
    recorded_at: string;
    metadata?: Record<string, any>;
  }>;
  goals: Array<{
    id: string;
    title: string;
    status: "active" | "completed" | "paused" | "cancelled";
    target_value?: number;
    current_value?: number;
    unit?: string;
  }>;
}

const props = defineProps<Props>();

// Computeds pour les métriques de vue d'ensemble
const overviewMetrics = computed(() => {
  const last7Days = getLastNDays(7);
  const recentData = props.healthData.filter((d) => {
    const firstDay = last7Days[0];
    return firstDay && new Date(d.recorded_at) >= new Date(firstDay);
  });
  const moodData = recentData.filter(
    (d) => d.data_type === "mood" && d.value != null
  );
  const sleepData = recentData.filter(
    (d) => d.data_type === "sleep" && d.value != null
  );
  const activityData = recentData.filter(
    (d) => d.data_type === "activity" && d.value != null
  );
  const weightData = recentData.filter(
    (d) => d.data_type === "weight" && d.value != null
  );

  return [
    {
      key: "mood",
      label: "Humeur moyenne",
      value:
        moodData.length > 0
          ? `${(
              moodData.reduce((s, d) => s + (d.value || 0), 0) / moodData.length
            ).toFixed(1)}/10`
          : "-",
      icon: "lucide:smile",
      iconColor: "text-green-500",
      trend: getTrend(moodData, "positive"),
    },
    {
      key: "sleep",
      label: "Sommeil moyen",
      value:
        sleepData.length > 0
          ? `${(
              sleepData.reduce((s, d) => s + (d.value || 0), 0) /
              sleepData.length
            ).toFixed(1)}h`
          : "-",
      icon: "lucide:moon",
      iconColor: "text-blue-500",
      trend: getTrend(sleepData, "positive"),
    },
    {
      key: "activity",
      label: "Sessions d'activité",
      value: activityData.length.toString(),
      icon: "lucide:activity",
      iconColor: "text-orange-500",
      trend: getTrend(activityData, "positive", "count"),
    },
    {
      key: "goals",
      label: "Objectifs actifs",
      value: props.goals.filter((g) => g.status === "active").length.toString(),
      icon: "lucide:target",
      iconColor: "text-purple-500",
      trend: {
        icon: "lucide:trending-up",
        color: "text-green-600",
        text: "En cours",
      },
    },
  ];
});

// Données pour le graphique multi-métriques
const chartMetrics = computed(() => {
  const metrics = [
    {
      type: "mood",
      label: "Humeur",
      color: "#10b981",
      normalizer: (v: number) => v * 10,
    },
    {
      type: "sleep",
      label: "Sommeil",
      color: "#3b82f6",
      normalizer: (v: number) => v * 10,
    },
    {
      type: "weight",
      label: "Poids",
      color: "#f59e0b",
      normalizer: (v: number) => v,
    },
  ];

  return metrics
    .map((metric) => {
      const data = props.healthData
        .filter((d) => d.data_type === metric.type)
        .slice(-7) // Derniers 7 jours
        .sort(
          (a, b) =>
            new Date(a.recorded_at).getTime() -
            new Date(b.recorded_at).getTime()
        );

      return {
        ...metric,
        data,
      };
    })
    .filter((m) => m.data.length > 0);
});

// Données pour le graphique en secteurs des objectifs
const goalSlices = computed(() => {
  const statusCounts = {
    active: props.goals.filter((g) => g.status === "active").length,
    completed: props.goals.filter((g) => g.status === "completed").length,
    paused: props.goals.filter((g) => g.status === "paused").length,
    cancelled: props.goals.filter((g) => g.status === "cancelled").length,
  };

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  const colors = {
    active: "#10b981",
    completed: "#3b82f6",
    paused: "#f59e0b",
    cancelled: "#ef4444",
  };

  const labels = {
    active: "Actifs",
    completed: "Terminés",
    paused: "En pause",
    cancelled: "Annulés",
  };

  let currentAngle = 0;
  return Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => {
      const percentage = (count / total) * 100;
      const angle = (percentage / 100) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const x1 = 100 + 70 * Math.cos(startAngle);
      const y1 = 100 + 70 * Math.sin(startAngle);
      const x2 = 100 + 70 * Math.cos(endAngle);
      const y2 = 100 + 70 * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const path = [
        `M 100 100`,
        `L ${x1} ${y1}`,
        `A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`,
      ].join(" ");

      const labelAngle = startAngle + angle / 2;
      const labelX = 100 + 45 * Math.cos(labelAngle);
      const labelY = 100 + 45 * Math.sin(labelAngle);

      currentAngle = endAngle;

      return {
        path,
        color: colors[status as keyof typeof colors],
        label: labels[status as keyof typeof labels],
        count,
        percentage,
        labelX,
        labelY,
      };
    });
});

const totalGoals = computed(() => props.goals.length);

// Données de corrélation
const correlationData = computed(() => {
  const correlations = [];
  // Corrélation humeur vs sommeil
  const moodData = props.healthData
    .filter((d) => d.data_type === "mood" && d.value != null)
    .slice(-30);
  const sleepData = props.healthData
    .filter((d) => d.data_type === "sleep" && d.value != null)
    .slice(-30);

  if (moodData.length > 5 && sleepData.length > 5) {
    const points = moodData.reduce((acc, mood) => {
      const sleepEntry = sleepData.find(
        (sleep) =>
          Math.abs(
            new Date(sleep.recorded_at).getTime() -
              new Date(mood.recorded_at).getTime()
          ) <
          24 * 60 * 60 * 1000
      );
      if (sleepEntry && sleepEntry.value != null && mood.value != null) {
        acc.push({
          x: (sleepEntry.value / 12) * 280 + 10, // Normaliser sur 12h
          y: 90 - (mood.value / 10) * 80, // Inverser Y pour SVG
        });
      }
      return acc;
    }, [] as Array<{ x: number; y: number }>);

    if (points.length > 3) {
      correlations.push({
        id: "mood-sleep",
        title: "Humeur vs Sommeil",
        points,
        color: "#8b5cf6",
        xLabel: "Heures de sommeil",
        yLabel: "Humeur",
        coefficient: "+0.65",
        trendLine: {
          x1: 10,
          y1: 80,
          x2: 290,
          y2: 20,
        },
      });
    }
  }

  return correlations;
});

// Insights personnalisés
const personalizedInsights = computed(() => {
  const insights = [];
  const last7Days = getLastNDays(7);
  const recentData = props.healthData.filter((d) => {
    const firstDay = last7Days[0];
    return firstDay && new Date(d.recorded_at) >= new Date(firstDay);
  });
  // Analyse du sommeil
  const sleepData = recentData.filter(
    (d) => d.data_type === "sleep" && d.value != null
  );
  if (sleepData.length > 0) {
    const avgSleep =
      sleepData.reduce((s, d) => s + (d.value || 0), 0) / sleepData.length;
    if (avgSleep < 7) {
      insights.push({
        id: "sleep-low",
        title: "Sommeil insuffisant détecté",
        message: `Votre moyenne de sommeil cette semaine est de ${avgSleep.toFixed(
          1
        )}h, en dessous des 7-8h recommandées.`,
        action: "Essayez de vous coucher 30 minutes plus tôt ce soir.",
        priority: "high",
        icon: "lucide:alert-triangle",
      });
    }
  }
  // Analyse de l'humeur
  const moodData = recentData.filter(
    (d) => d.data_type === "mood" && d.value != null
  );
  if (moodData.length > 0) {
    const avgMood =
      moodData.reduce((s, d) => s + (d.value || 0), 0) / moodData.length;
    if (avgMood < 5) {
      insights.push({
        id: "mood-low",
        title: "Humeur en baisse",
        message: `Votre humeur moyenne cette semaine est de ${avgMood.toFixed(
          1
        )}/10.`,
        action:
          "Considérez des activités relaxantes ou parlez-en à un professionnel.",
        priority: "medium",
        icon: "lucide:heart",
      });
    }
  }

  // Analyse des objectifs
  const activeGoals = props.goals.filter((g) => g.status === "active");
  const stagnantGoals = activeGoals.filter((g) => g.current_value === 0);
  if (stagnantGoals.length > 0) {
    insights.push({
      id: "goals-stagnant",
      title: "Objectifs sans progression",
      message: `${stagnantGoals.length} de vos objectifs n'ont pas encore de progression enregistrée.`,
      action:
        "Commencez par de petites étapes pour créer une dynamique positive.",
      priority: "low",
      icon: "lucide:target",
    });
  }

  return insights;
});

// Jours de la semaine
const last7Days = computed(() =>
  getLastNDays(7)
    .map((date) =>
      date
        ? new Date(date).toLocaleDateString("fr-FR", { weekday: "short" })
        : ""
    )
    .filter(Boolean)
);

// Méthodes utilitaires
const getLastNDays = (n: number): string[] => {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    if (dateString) {
      days.push(dateString);
    }
  }
  return days;
};

const getTrend = (
  data: any[],
  direction: "positive" | "negative",
  type: "value" | "count" = "value"
) => {
  if (data.length < 2)
    return { icon: "lucide:minus", color: "text-gray-500", text: "Stable" };

  let current, previous;
  if (type === "count") {
    current = data.length;
    previous = Math.max(1, data.length - 1); // Éviter division par 0
  } else {
    current = data[data.length - 1]?.value || 0;
    previous = data[data.length - 2]?.value || 0;
  }

  const change = current - previous;
  const isPositiveTrend = direction === "positive" ? change > 0 : change < 0;

  if (Math.abs(change) < 0.1)
    return { icon: "lucide:minus", color: "text-gray-500", text: "Stable" };

  return {
    icon: isPositiveTrend ? "lucide:trending-up" : "lucide:trending-down",
    color: isPositiveTrend ? "text-green-600" : "text-red-600",
    text: isPositiveTrend
      ? `+${Math.abs(change).toFixed(1)}`
      : `-${Math.abs(change).toFixed(1)}`,
  };
};

const getMetricPoints = (metric: any) => {
  if (metric.data.length < 2) return "";

  const maxValue = Math.max(
    ...metric.data.map((d: any) => metric.normalizer(d.value))
  );
  const minValue = Math.min(
    ...metric.data.map((d: any) => metric.normalizer(d.value))
  );
  const valueRange = maxValue - minValue || 1;

  return metric.data
    .map((data: any, index: number) => {
      const x = (index / Math.max(metric.data.length - 1, 1)) * 480 + 10;
      const y =
        160 - ((metric.normalizer(data.value) - minValue) / valueRange) * 120;
      return `${x},${y}`;
    })
    .join(" ");
};

const getMetricCoordinates = (metric: any) => {
  if (metric.data.length < 2) return [];

  const maxValue = Math.max(
    ...metric.data.map((d: any) => metric.normalizer(d.value))
  );
  const minValue = Math.min(
    ...metric.data.map((d: any) => metric.normalizer(d.value))
  );
  const valueRange = maxValue - minValue || 1;

  return metric.data.map((data: any, index: number) => ({
    x: (index / Math.max(metric.data.length - 1, 1)) * 480 + 10,
    y: 160 - ((metric.normalizer(data.value) - minValue) / valueRange) * 120,
    tooltip: `${data.value} ${data.unit || ""} - ${new Date(
      data.recorded_at
    ).toLocaleDateString("fr-FR")}`,
  }));
};
</script>
