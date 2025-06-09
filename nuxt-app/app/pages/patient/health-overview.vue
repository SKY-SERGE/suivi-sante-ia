<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- En-tête -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Tableau de bord santé</h1>
      <p class="mt-2 text-gray-600">
        Vue d'ensemble de vos données de santé et tendances
      </p>
    </div>

    <!-- Indicateurs de santé rapides -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="lucide:smile" class="h-8 w-8 text-blue-500" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Humeur actuelle
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ currentMood }}/10
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="lucide:moon" class="h-8 w-8 text-purple-500" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Sommeil moyen
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ averageSleep.toFixed(1) }}h
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="lucide:heart" class="h-8 w-8 text-red-500" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Tension récente
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ latestBloodPressure }}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="lucide:scale" class="h-8 w-8 text-green-500" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Poids actuel
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ currentWeight }} kg
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Actions rapides -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card class="border-blue-200 bg-blue-50">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-blue-900">
                Saisir des données
              </h3>
              <p class="text-sm text-blue-700">
                Enregistrer de nouvelles mesures
              </p>
            </div>
            <NuxtLink to="/patient/health-data">
              <Button class="bg-blue-600 hover:bg-blue-700">
                <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </NuxtLink>
          </div>
        </CardContent>
      </Card>

      <Card class="border-green-200 bg-green-50">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-green-900">Objectifs</h3>
              <p class="text-sm text-green-700">Suivre vos objectifs santé</p>
            </div>
            <Button
              variant="outline"
              class="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              <Icon name="lucide:target" class="h-4 w-4 mr-2" />
              Voir
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card class="border-purple-200 bg-purple-50">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-purple-900">Rapports</h3>
              <p class="text-sm text-purple-700">Analyser vos données</p>
            </div>
            <Button
              variant="outline"
              class="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            >
              <Icon name="lucide:file-text" class="h-4 w-4 mr-2" />
              Générer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Graphiques de tendances -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Humeur et sommeil -->
      <Card>
        <CardHeader>
          <CardTitle>Humeur et bien-être</CardTitle>
          <CardDescription
            >Évolution de votre humeur ces derniers jours</CardDescription
          >
        </CardHeader>
        <CardContent>
          <HealthDataChart
            v-if="moodData.length > 0"
            :data="moodData"
            data-type="mood"
          />
          <div v-else class="text-center py-8 text-gray-500">
            <Icon
              name="lucide:smile"
              class="h-12 w-12 mx-auto mb-3 text-gray-300"
            />
            <p>Aucune donnée d'humeur</p>
            <p class="text-sm">Commencez par enregistrer votre humeur</p>
          </div>
        </CardContent>
      </Card>

      <!-- Signes vitaux -->
      <Card>
        <CardHeader>
          <CardTitle>Signes vitaux</CardTitle>
          <CardDescription>Tendances de vos signes vitaux</CardDescription>
        </CardHeader>
        <CardContent>
          <HealthDataChart
            v-if="vitalsData.length > 0"
            :data="vitalsData"
            data-type="weight"
          />
          <div v-else class="text-center py-8 text-gray-500">
            <Icon
              name="lucide:heart"
              class="h-12 w-12 mx-auto mb-3 text-gray-300"
            />
            <p>Aucune donnée vitale</p>
            <p class="text-sm">Enregistrez votre poids, tension, etc.</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Activité récente -->
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>Vos dernières saisies de données</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          v-if="recentActivity.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <Icon
            name="lucide:clipboard-list"
            class="h-12 w-12 mx-auto mb-3 text-gray-300"
          />
          <p>Aucune activité récente</p>
          <p class="text-sm">Vos données apparaîtront ici une fois saisies</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="item in recentActivity"
            :key="item.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center">
              <Icon
                :name="getTypeIcon(item.data_type)"
                class="h-6 w-6 mr-4 text-gray-600"
              />
              <div>
                <div class="font-medium">{{ getTypeName(item.data_type) }}</div>
                <div class="text-sm text-gray-500">
                  {{ formatDateTime(item.recorded_at) }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium">{{ formatValue(item) }}</div>
              <div
                v-if="item.notes"
                class="text-xs text-gray-500 max-w-xs truncate"
              >
                {{ item.notes }}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
});

interface HealthDataItem {
  id: string;
  data_type: string;
  value?: number;
  unit?: string;
  notes?: string;
  recorded_at: string;
  metadata?: Record<string, any>;
}

// État réactif
const healthData = ref<HealthDataItem[]>([]);

// Composables
const { user } = useSupabaseUser();
const supabase = useSupabase();

// Computed pour les différents types de données
const moodData = computed(
  () =>
    healthData.value
      .filter((item) => item.data_type === "mood")
      .sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      )
      .slice(-14) // Derniers 14 jours
);

const sleepData = computed(() =>
  healthData.value
    .filter((item) => item.data_type === "sleep")
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    .slice(-14)
);

const vitalsData = computed(() =>
  healthData.value
    .filter((item) =>
      ["weight", "blood_pressure", "heart_rate", "temperature"].includes(
        item.data_type
      )
    )
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    .slice(-30)
);

const recentActivity = computed(() =>
  healthData.value
    .sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    )
    .slice(0, 10)
);

// Indicateurs
const currentMood = computed(() => {
  const latest = moodData.value[moodData.value.length - 1];
  return latest?.value || "-";
});

const averageSleep = computed(() => {
  if (sleepData.value.length === 0) return 0;
  const total = sleepData.value.reduce(
    (sum, item) => sum + (item.value || 0),
    0
  );
  return total / sleepData.value.length;
});

const latestBloodPressure = computed(() => {
  const bpData = healthData.value
    .filter((item) => item.data_type === "blood_pressure")
    .sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );

  if (bpData.length === 0) return "-";

  const latest = bpData[0];
  const systolic = latest.metadata?.systolic;
  const diastolic = latest.metadata?.diastolic;

  return systolic && diastolic ? `${systolic}/${diastolic}` : "-";
});

const currentWeight = computed(() => {
  const weightData = healthData.value
    .filter((item) => item.data_type === "weight")
    .sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );

  return weightData[0]?.value || "-";
});

// Méthodes utilitaires
const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    mood: "lucide:smile",
    sleep: "lucide:moon",
    activity: "lucide:activity",
    symptoms: "lucide:thermometer",
    weight: "lucide:scale",
    blood_pressure: "lucide:heart",
    heart_rate: "lucide:activity",
    temperature: "lucide:thermometer",
  };
  return icons[type] || "lucide:plus-circle";
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

const formatValue = (item: HealthDataItem) => {
  if (
    item.data_type === "blood_pressure" &&
    item.metadata?.systolic &&
    item.metadata?.diastolic
  ) {
    return `${item.metadata.systolic}/${item.metadata.diastolic} mmHg`;
  }

  if (item.value !== undefined && item.unit) {
    return `${item.value} ${item.unit}`;
  }

  if (item.value !== undefined) {
    return item.value.toString();
  }

  return "-";
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Chargement des données
const loadHealthData = async () => {
  if (!user.value) return;

  try {
    const { data, error } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", user.value.id)
      .order("recorded_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    healthData.value = data || [];
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  }
};

// Lifecycle
onMounted(() => {
  loadHealthData();
});
</script>
