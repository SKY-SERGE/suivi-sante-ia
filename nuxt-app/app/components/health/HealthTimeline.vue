<template>
  <div class="space-y-6">
    <!-- Filtres et contrôles -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg"
    >
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:calendar" class="h-4 w-4 text-gray-500" />
          <select
            v-model="selectedPeriod"
            class="text-sm border rounded px-2 py-1"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="365">1 an</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="lucide:filter" class="h-4 w-4 text-gray-500" />
          <select
            v-model="selectedMetric"
            class="text-sm border rounded px-2 py-1"
          >
            <option value="all">Toutes les métriques</option>
            <option value="mood">Humeur</option>
            <option value="sleep">Sommeil</option>
            <option value="activity">Activité</option>
            <option value="symptoms">Symptômes</option>
            <option value="vitals">Signes vitaux</option>
          </select>
        </div>
      </div>
      <Button
        @click="refreshData"
        variant="outline"
        size="sm"
        class="flex items-center gap-2"
        :disabled="loading"
      >
        <Icon
          name="lucide:refresh-cw"
          class="h-4 w-4"
          :class="{ 'animate-spin': loading }"
        />
        Actualiser
      </Button>
    </div>

    <!-- Timeline -->
    <div v-if="loading" class="flex justify-center p-8">
      <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-blue-500" />
    </div>

    <div
      v-else-if="filteredEntries.length === 0"
      class="text-center p-8 text-gray-500"
    >
      <Icon
        name="lucide:calendar-x"
        class="h-12 w-12 mx-auto mb-4 text-gray-300"
      />
      <p>Aucune donnée trouvée pour la période sélectionnée</p>
    </div>

    <div v-else class="relative">
      <!-- Ligne de temps verticale -->
      <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <!-- Entrées de la timeline -->
      <div class="space-y-6">
        <div
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="relative flex items-start gap-4"
        >
          <!-- Point sur la timeline -->
          <div class="flex-shrink-0 relative">
            <div
              class="w-4 h-4 rounded-full border-2 bg-white z-10 relative"
              :class="getMetricColor(entry.metric_type)"
            ></div>
          </div>

          <!-- Contenu de l'entrée -->
          <div
            class="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Icon
                    :name="getMetricIcon(entry.metric_type)"
                    class="h-4 w-4"
                    :class="getMetricIconColor(entry.metric_type)"
                  />
                  <h3 class="font-semibold text-gray-900">
                    {{ getMetricTitle(entry.metric_type) }}
                  </h3>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="getMetricBadgeClass(entry.metric_type)"
                  >
                    {{ entry.metric_type }}
                  </span>
                </div>

                <div class="space-y-2">
                  <div
                    v-if="entry.metric_type === 'mood'"
                    class="flex items-center gap-2"
                  >
                    <span class="text-sm text-gray-600">Humeur:</span>
                    <div class="flex items-center gap-1">
                      <span class="font-medium"
                        >{{ entry.mood_rating }}/10</span
                      >
                      <span class="text-sm text-gray-500">{{
                        getMoodEmoji(entry.mood_rating || 0)
                      }}</span>
                    </div>
                  </div>

                  <div
                    v-if="entry.metric_type === 'sleep'"
                    class="grid grid-cols-2 gap-4 text-sm"
                  >
                    <div class="flex justify-between">
                      <span class="text-gray-600">Durée:</span>
                      <span class="font-medium">{{ entry.sleep_hours }}h</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Qualité:</span>
                      <span class="font-medium"
                        >{{ entry.sleep_quality }}/10</span
                      >
                    </div>
                  </div>

                  <div
                    v-if="entry.metric_type === 'activity'"
                    class="grid grid-cols-2 gap-4 text-sm"
                  >
                    <div class="flex justify-between">
                      <span class="text-gray-600">Pas:</span>
                      <span class="font-medium">{{
                        entry.steps?.toLocaleString() || "N/A"
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Calories:</span>
                      <span class="font-medium">{{
                        entry.calories_burned || "N/A"
                      }}</span>
                    </div>
                  </div>

                  <div
                    v-if="entry.metric_type === 'vitals'"
                    class="grid grid-cols-2 gap-4 text-sm"
                  >
                    <div v-if="entry.heart_rate" class="flex justify-between">
                      <span class="text-gray-600">Rythme cardiaque:</span>
                      <span class="font-medium"
                        >{{ entry.heart_rate }} bpm</span
                      >
                    </div>
                    <div
                      v-if="entry.blood_pressure_systolic"
                      class="flex justify-between"
                    >
                      <span class="text-gray-600">Tension:</span>
                      <span class="font-medium"
                        >{{ entry.blood_pressure_systolic }}/{{
                          entry.blood_pressure_diastolic
                        }}</span
                      >
                    </div>
                  </div>

                  <div
                    v-if="entry.notes"
                    class="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700"
                  >
                    <Icon
                      name="lucide:message-circle"
                      class="h-3 w-3 inline mr-1"
                    />
                    {{ entry.notes }}
                  </div>
                </div>
              </div>

              <div class="flex-shrink-0 text-right">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatDate(entry.recorded_at) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatTime(entry.recorded_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="filteredEntries.length > 0 && hasMore"
      class="flex justify-center pt-6"
    >
      <Button
        @click="loadMore"
        variant="outline"
        :disabled="loadingMore"
        class="flex items-center gap-2"
      >
        <Icon
          name="lucide:loader-2"
          v-if="loadingMore"
          class="h-4 w-4 animate-spin"
        />
        <Icon name="lucide:chevron-down" v-else class="h-4 w-4" />
        {{ loadingMore ? "Chargement..." : "Charger plus" }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HealthEntry {
  id: string;
  metric_type: string;
  recorded_at: string;
  mood_rating?: number;
  sleep_hours?: number;
  sleep_quality?: number;
  steps?: number;
  calories_burned?: number;
  heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  notes?: string;
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
const toast = useToastStore();

// État réactif
const loading = ref(false);
const loadingMore = ref(false);
const selectedPeriod = ref("30");
const selectedMetric = ref("all");
const entries = ref<HealthEntry[]>([]);
const hasMore = ref(true);
const currentPage = ref(0);
const pageSize = 20;

// Données calculées
const filteredEntries = computed(() => {
  let filtered = entries.value;

  // Filtrer par métrique si nécessaire
  if (selectedMetric.value !== "all") {
    filtered = filtered.filter(
      (entry) => entry.metric_type === selectedMetric.value
    );
  }

  // Trier par date décroissante
  return filtered.sort(
    (a, b) =>
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );
});

// Méthodes utilitaires
const getMetricColor = (metricType: string) => {
  const colors = {
    mood: "border-yellow-400",
    sleep: "border-blue-400",
    activity: "border-green-400",
    symptoms: "border-red-400",
    vitals: "border-purple-400",
  };
  return colors[metricType as keyof typeof colors] || "border-gray-400";
};

const getMetricIcon = (metricType: string) => {
  const icons = {
    mood: "lucide:smile",
    sleep: "lucide:moon",
    activity: "lucide:activity",
    symptoms: "lucide:alert-circle",
    vitals: "lucide:heart-pulse",
  };
  return icons[metricType as keyof typeof icons] || "lucide:circle";
};

const getMetricIconColor = (metricType: string) => {
  const colors = {
    mood: "text-yellow-500",
    sleep: "text-blue-500",
    activity: "text-green-500",
    symptoms: "text-red-500",
    vitals: "text-purple-500",
  };
  return colors[metricType as keyof typeof colors] || "text-gray-500";
};

const getMetricBadgeClass = (metricType: string) => {
  const classes = {
    mood: "bg-yellow-100 text-yellow-800",
    sleep: "bg-blue-100 text-blue-800",
    activity: "bg-green-100 text-green-800",
    symptoms: "bg-red-100 text-red-800",
    vitals: "bg-purple-100 text-purple-800",
  };
  return (
    classes[metricType as keyof typeof classes] || "bg-gray-100 text-gray-800"
  );
};

const getMetricTitle = (metricType: string) => {
  const titles = {
    mood: "Suivi de l'humeur",
    sleep: "Données de sommeil",
    activity: "Activité physique",
    symptoms: "Symptômes",
    vitals: "Signes vitaux",
  };
  return titles[metricType as keyof typeof titles] || "Donnée de santé";
};

const getMoodEmoji = (rating: number) => {
  if (rating >= 9) return "😄";
  if (rating >= 7) return "😊";
  if (rating >= 5) return "😐";
  if (rating >= 3) return "😔";
  return "😢";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  } else {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Méthodes de données
const loadHealthData = async (reset = false) => {
  if (reset) {
    loading.value = true;
    entries.value = [];
    currentPage.value = 0;
    hasMore.value = true;
  } else {
    loadingMore.value = true;
  }

  try {
    const user = await $supabase.auth.getUser();
    if (!user.data.user) return;

    const targetUserId = props.userId || user.data.user.id;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(selectedPeriod.value));

    // Construction de la requête
    let query = $supabase
      .from("health_data")
      .select("*")
      .eq("user_id", targetUserId)
      .gte("recorded_at", fromDate.toISOString())
      .order("recorded_at", { ascending: false })
      .range(
        currentPage.value * pageSize,
        (currentPage.value + 1) * pageSize - 1
      );

    const { data, error } = await query;

    if (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur lors du chargement des données de santé");
      return;
    }

    if (data) {
      if (reset) {
        entries.value = data;
      } else {
        entries.value.push(...data);
      }

      hasMore.value = data.length === pageSize;
      currentPage.value++;
    }
  } catch (error) {
    console.error("Erreur:", error);
    toast.error("Une erreur inattendue s'est produite");
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const refreshData = () => {
  loadHealthData(true);
};

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    loadHealthData(false);
  }
};

// Watchers
watch([selectedPeriod, selectedMetric], () => {
  refreshData();
});

// Lifecycle
onMounted(() => {
  loadHealthData(true);
});
</script>
