<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- En-tête -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        Saisie de données de santé
      </h1>
      <p class="mt-2 text-gray-600">
        Enregistrez vos données de santé quotidiennes pour un meilleur suivi
      </p>
    </div>
    <!-- Onglets pour différents types de données -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in healthDataTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            <Icon :name="tab.icon" class="h-4 w-4 mr-2 inline" />
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Section de visualisation -->
    <div v-if="showVisualization" class="mb-6">
      <HealthDataChart :data="filteredHistoricalData" :data-type="activeTab" />
    </div>

    <!-- Formulaires selon l'onglet actif -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Formulaire de saisie -->
      <Card>
        <CardHeader>
          <CardTitle>{{
            activeTabInfo?.title || "Saisie de données"
          }}</CardTitle>
          <CardDescription>{{
            activeTabInfo?.description || "Enregistrez vos données de santé"
          }}</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Champs dynamiques selon le type de données -->
            <component
              :is="getFormComponent()"
              v-model="formData"
              @submit="handleSubmit"
            />

            <!-- Note optionnelle -->
            <div>
              <Label for="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                v-model="formData.notes"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ajoutez des détails ou commentaires..."
              />
            </div>

            <!-- Date et heure -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="date">Date</Label>
                <Input id="date" v-model="formData.date" type="date" required />
              </div>
              <div>
                <Label for="time">Heure</Label>
                <Input id="time" v-model="formData.time" type="time" required />
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="flex space-x-3">
              <Button type="submit" :disabled="isSubmitting" class="flex-1">
                <Icon
                  v-if="isSubmitting"
                  name="lucide:loader-2"
                  class="h-4 w-4 mr-2 animate-spin"
                />
                <Icon v-else name="lucide:save" class="h-4 w-4 mr-2" />
                {{ isSubmitting ? "Enregistrement..." : "Enregistrer" }}
              </Button>
              <Button type="button" variant="outline" @click="resetForm">
                <Icon name="lucide:x" class="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Historique récent -->
      <Card>
        <CardHeader>
          <CardTitle>Historique récent</CardTitle>
          <CardDescription>Vos dernières saisies</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            v-if="recentData.length === 0"
            class="text-center py-8 text-gray-500"
          >
            <Icon
              name="lucide:clipboard-list"
              class="h-12 w-12 mx-auto mb-3 text-gray-300"
            />
            <p>Aucune donnée récente</p>
            <p class="text-sm">Commencez par saisir vos premières données</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="item in recentData"
              :key="item.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center">
                <Icon
                  :name="getTypeIcon(item.data_type)"
                  class="h-5 w-5 mr-3 text-gray-600"
                />
                <div>
                  <div class="font-medium">
                    {{ getTypeName(item.data_type) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDateTime(item.recorded_at) }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium">{{ formatValue(item) }}</div>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="editItem(item)"
                  class="text-xs h-6 px-2"
                >
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
});

// Types
interface HealthDataForm {
  data_type: string;
  value?: number;
  unit?: string;
  notes?: string;
  date: string;
  time: string;
  metadata?: Record<string, any>;
}

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
const activeTab = ref("mood");
const isSubmitting = ref(false);
const recentData = ref<HealthDataItem[]>([]);
const historicalData = ref<HealthDataItem[]>([]);
const showVisualization = ref(false);

// Données du formulaire
const formData = ref<HealthDataForm>({
  data_type: "mood",
  date: new Date().toISOString().split("T")[0] || "",
  time: new Date().toTimeString().split(" ")[0]?.substring(0, 5) || "12:00",
});

// Configuration des onglets
const healthDataTabs = [
  {
    id: "mood",
    label: "Humeur",
    icon: "lucide:smile",
    title: "Évaluation de l'humeur",
    description: "Évaluez votre état d'humeur sur une échelle de 1 à 10",
  },
  {
    id: "sleep",
    label: "Sommeil",
    icon: "lucide:moon",
    title: "Qualité du sommeil",
    description: "Enregistrez vos heures et la qualité de votre sommeil",
  },
  {
    id: "activity",
    label: "Activité",
    icon: "lucide:activity",
    title: "Activité physique",
    description: "Suivez vos activités physiques et exercices",
  },
  {
    id: "symptoms",
    label: "Symptômes",
    icon: "lucide:thermometer",
    title: "Symptômes",
    description: "Enregistrez vos symptômes et leur intensité",
  },
  {
    id: "vitals",
    label: "Signes vitaux",
    icon: "lucide:heart",
    title: "Signes vitaux",
    description: "Tension, poids, température, fréquence cardiaque",
  },
];

// Composables
const { user, userId } = useUser();
const supabaseClient = useSupabaseClient();
const toastStore = useToastStore();
const { validateHealthData, validateDate } = useHealthValidation();

// Computed
const activeTabInfo = computed(() => {
  return (
    healthDataTabs.find((tab) => tab.id === activeTab.value) ??
    healthDataTabs[0]
  );
});

const filteredHistoricalData = computed(() => {
  return historicalData.value.filter(
    (item) => item.data_type === activeTab.value
  );
});

// Watchers
watch(activeTab, (newTab) => {
  formData.value.data_type = newTab;
  resetForm();
});

// Méthodes
const getFormComponent = () => {
  // Ces composants seront créés ensuite
  const components: Record<string, string> = {
    mood: "HealthFormMood",
    sleep: "HealthFormSleep",
    activity: "HealthFormActivity",
    symptoms: "HealthFormSymptoms",
    vitals: "HealthFormVitals",
  };
  return components[activeTab.value] || "HealthFormMood";
};

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

const handleSubmit = async () => {
  if (!user.value) return;

  // Validation des données
  const dateValidation = validateDate(formData.value.date);
  if (!dateValidation.isValid) {
    toastStore.error(
      dateValidation.message || "Date invalide",
      "Erreur de validation"
    );
    return;
  }

  const dataValidation = validateHealthData(
    formData.value.data_type,
    formData.value.value,
    formData.value.metadata
  );

  if (!dataValidation.isValid) {
    toastStore.error(
      dataValidation.message || "Données invalides",
      "Erreur de validation"
    );
    return;
  }

  // Afficher les avertissements s'il y en a
  if (dataValidation.warnings && dataValidation.warnings.length > 0) {
    dataValidation.warnings.forEach((warning) => {
      toastStore.warning(warning, "Attention");
    });
  }

  isSubmitting.value = true;

  try {
    const recordedAt = new Date(
      `${formData.value.date}T${formData.value.time}:00`
    );
    const { error } = await supabaseClient.from("health_data").insert({
      user_id: userId.value,
      data_type: formData.value.data_type,
      value: formData.value.value,
      unit: formData.value.unit,
      notes: formData.value.notes,
      recorded_at: recordedAt.toISOString(),
      metadata: formData.value.metadata || {},
    });

    if (error) throw error;
    toastStore.success(
      "Vos données de santé ont été enregistrées avec succès",
      "Données sauvegardées"
    );
    await loadRecentData();
    await loadHistoricalData();
    resetForm();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    toastStore.error(
      "Impossible d'enregistrer vos données. Veuillez réessayer.",
      "Erreur de sauvegarde"
    );
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0]?.substring(0, 5) || "12:00";

  formData.value = {
    data_type: activeTab.value,
    date: dateStr || "",
    time: timeStr,
  };
};

const editItem = (item: HealthDataItem) => {
  // TODO: Implémenter la modification
  console.log("Modifier:", item);
};

const loadRecentData = async () => {
  if (!user.value) return;

  try {
    const { data, error } = await supabaseClient
      .from("health_data")
      .select("*")
      .eq("user_id", userId.value)
      .order("recorded_at", { ascending: false })
      .limit(5);

    if (error) throw error;
    recentData.value = data || [];
  } catch (error) {
    console.error("Erreur lors du chargement des données récentes:", error);
  }
};

const loadHistoricalData = async () => {
  if (!user.value) return;

  try {
    const { data, error } = await supabaseClient
      .from("health_data")
      .select("*")
      .eq("user_id", userId.value)
      .order("recorded_at", { ascending: false })
      .limit(100); // Derniers 100 points

    if (error) throw error;
    historicalData.value = data || [];

    // Activer la visualisation s'il y a des données
    showVisualization.value = (data?.length || 0) > 0;
  } catch (error) {
    console.error("Erreur lors du chargement des données historiques:", error);
  }
};

// Lifecycle
onMounted(() => {
  loadRecentData();
  loadHistoricalData();
});
</script>
