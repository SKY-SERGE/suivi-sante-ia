<template>
  <div class="space-y-4">
    <!-- Graphique de progression vers l'objectif -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center">
          <Icon name="lucide:target" class="h-5 w-5 mr-2" />
          Progression - {{ goal.title }}
        </CardTitle>
        <CardDescription>
          {{ formatDate(goal.start_date) }} →
          {{
            goal.target_date
              ? formatDate(goal.target_date)
              : "Pas de date limite"
          }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Barre de progression principale -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium">Progression</span>
            <span class="text-sm text-gray-600"
              >{{ Math.round(progressPercentage) }}%</span
            >
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="h-3 rounded-full transition-all duration-500"
              :class="getProgressBarClass()"
              :style="{ width: `${Math.min(progressPercentage, 100)}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>{{ formatValue(goal.current_value) }} {{ goal.unit }}</span>
            <span>{{ formatValue(goal.target_value) }} {{ goal.unit }}</span>
          </div>
        </div>

        <!-- Graphique temporel si des données historiques existent -->
        <div v-if="historicalData.length > 1" class="mt-6">
          <h4 class="text-sm font-medium mb-3">Évolution dans le temps</h4>
          <div class="relative h-48 w-full">
            <svg class="w-full h-full" viewBox="0 0 400 160">
              <!-- Grille de fond -->
              <defs>
                <pattern
                  id="goal-grid"
                  width="40"
                  height="16"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 16"
                    fill="none"
                    stroke="#f0f0f0"
                    stroke-width="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#goal-grid)" />

              <!-- Ligne objectif -->
              <line
                :y1="getTargetY()"
                :y2="getTargetY()"
                x1="0"
                x2="400"
                stroke="#ef4444"
                stroke-width="2"
                stroke-dasharray="5,5"
              />
              <text :y="getTargetY() - 5" x="5" fill="#ef4444" class="text-xs">
                Objectif: {{ formatValue(goal.target_value) }} {{ goal.unit }}
              </text>

              <!-- Ligne de progression -->
              <polyline
                :points="getProgressPoints()"
                fill="none"
                stroke="#3b82f6"
                stroke-width="2"
              />

              <!-- Points de données -->
              <circle
                v-for="(point, index) in getProgressCoordinates()"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                r="3"
                :fill="point.y <= getTargetY() ? '#10b981' : '#3b82f6'"
                class="cursor-pointer hover:r-5 transition-all"
              >
                <title>{{ point.tooltip }}</title>
              </circle>
            </svg>
          </div>
        </div>

        <!-- Métriques de performance -->
        <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="bg-blue-50 p-3 rounded-lg">
            <div class="flex items-center">
              <Icon name="lucide:calendar" class="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <p class="text-xs text-blue-600">Temps écoulé</p>
                <p class="text-sm font-semibold">{{ daysElapsed }} jours</p>
              </div>
            </div>
          </div>

          <div class="bg-green-50 p-3 rounded-lg" v-if="goal.target_date">
            <div class="flex items-center">
              <Icon name="lucide:clock" class="h-4 w-4 text-green-600 mr-2" />
              <div>
                <p class="text-xs text-green-600">Temps restant</p>
                <p class="text-sm font-semibold">{{ daysRemaining }} jours</p>
              </div>
            </div>
          </div>

          <div class="bg-purple-50 p-3 rounded-lg">
            <div class="flex items-center">
              <Icon
                name="lucide:trending-up"
                class="h-4 w-4 text-purple-600 mr-2"
              />
              <div>
                <p class="text-xs text-purple-600">Progression moyenne</p>
                <p class="text-sm font-semibold">
                  {{ formatValue(averageProgress) }}/jour
                </p>
              </div>
            </div>
          </div>

          <div class="bg-orange-50 p-3 rounded-lg">
            <div class="flex items-center">
              <Icon
                :name="
                  isOnTrack ? 'lucide:check-circle' : 'lucide:alert-circle'
                "
                :class="isOnTrack ? 'text-green-600' : 'text-orange-600'"
                class="h-4 w-4 mr-2"
              />
              <div>
                <p
                  class="text-xs"
                  :class="isOnTrack ? 'text-green-600' : 'text-orange-600'"
                >
                  Statut
                </p>
                <p class="text-sm font-semibold">
                  {{ isOnTrack ? "Sur la voie" : "En retard" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Message motivationnel -->
        <div class="mt-4 p-3 rounded-lg" :class="getMotivationMessageClass()">
          <p class="text-sm">{{ getMotivationMessage() }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  goal: {
    id: string;
    title: string;
    target_value: number;
    current_value: number;
    unit: string;
    start_date: string;
    target_date?: string;
    status: string;
  };
  historicalData?: Array<{
    value: number;
    recorded_at: string;
  }>;
}

const props = withDefaults(defineProps<Props>(), {
  historicalData: () => [],
});

// Computeds
const progressPercentage = computed(() => {
  if (!props.goal.target_value) return 0;
  return (props.goal.current_value / props.goal.target_value) * 100;
});

const daysElapsed = computed(() => {
  const start = new Date(props.goal.start_date);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
});

const daysRemaining = computed(() => {
  if (!props.goal.target_date) return 0;
  const target = new Date(props.goal.target_date);
  const now = new Date();
  const remaining = Math.floor(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, remaining);
});

const averageProgress = computed(() => {
  if (daysElapsed.value === 0) return 0;
  return props.goal.current_value / daysElapsed.value;
});

const isOnTrack = computed(() => {
  if (!props.goal.target_date) return true;
  const totalDays = daysElapsed.value + daysRemaining.value;
  const expectedProgress =
    (daysElapsed.value / totalDays) * props.goal.target_value;
  return props.goal.current_value >= expectedProgress * 0.8; // 80% de tolérance
});

// Méthodes de visualisation
const getProgressBarClass = () => {
  if (props.goal.status === "completed") return "bg-green-500";
  if (progressPercentage.value >= 100) return "bg-green-500";
  if (isOnTrack.value) return "bg-blue-500";
  return "bg-orange-500";
};

const getTargetY = () => {
  return 20; // Position fixe pour la ligne objectif
};

const getProgressPoints = () => {
  if (props.historicalData.length < 2) return "";

  const maxValue = Math.max(
    props.goal.target_value,
    Math.max(...props.historicalData.map((d) => d.value))
  );
  const minValue = Math.min(
    0,
    Math.min(...props.historicalData.map((d) => d.value))
  );
  const valueRange = maxValue - minValue;

  return props.historicalData
    .map((data, index) => {
      const x = (index / (props.historicalData.length - 1)) * 380 + 10;
      const y = 140 - ((data.value - minValue) / valueRange) * 120;
      return `${x},${y}`;
    })
    .join(" ");
};

const getProgressCoordinates = () => {
  if (props.historicalData.length < 2) return [];

  const maxValue = Math.max(
    props.goal.target_value,
    Math.max(...props.historicalData.map((d) => d.value))
  );
  const minValue = Math.min(
    0,
    Math.min(...props.historicalData.map((d) => d.value))
  );
  const valueRange = maxValue - minValue;

  return props.historicalData.map((data, index) => ({
    x: (index / (props.historicalData.length - 1)) * 380 + 10,
    y: 140 - ((data.value - minValue) / valueRange) * 120,
    tooltip: `${formatValue(data.value)} ${props.goal.unit} - ${formatDate(
      data.recorded_at
    )}`,
  }));
};

const getMotivationMessageClass = () => {
  if (props.goal.status === "completed") return "bg-green-50 text-green-800";
  if (progressPercentage.value >= 100) return "bg-green-50 text-green-800";
  if (isOnTrack.value) return "bg-blue-50 text-blue-800";
  return "bg-orange-50 text-orange-800";
};

const getMotivationMessage = () => {
  if (props.goal.status === "completed") {
    return "🎉 Félicitations ! Vous avez atteint votre objectif !";
  }

  if (progressPercentage.value >= 100) {
    return "🎯 Excellent ! Vous avez dépassé votre objectif !";
  }

  if (progressPercentage.value >= 80) {
    return "🚀 Vous y êtes presque ! Plus qu'un petit effort !";
  }

  if (isOnTrack.value) {
    return "💪 Vous êtes sur la bonne voie ! Continuez ainsi !";
  }

  return "⚡ Un petit coup d'accélérateur vous aiderait à rattraper le retard !";
};

// Utilitaires
const formatValue = (value: number) => {
  return Math.round(value * 10) / 10;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
</script>
