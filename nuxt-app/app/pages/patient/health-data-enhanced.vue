<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- En-tête -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Saisie de données de santé
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Enregistrez vos données de santé quotidiennes pour un meilleur suivi
      </p>
    </div>

    <!-- Indicateur de progression -->
    <div v-if="isSubmitting" class="mb-6">
      <div
        class="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <Icon
          name="lucide:loader-2"
          class="w-5 h-5 animate-spin text-blue-600"
        />
        <span class="text-blue-800 dark:text-blue-200 font-medium"
          >Enregistrement en cours...</span
        >
      </div>
    </div>

    <!-- Onglets pour différents types de données -->
    <div class="mb-6">
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid grid-cols-5 w-full">
          <TabsTrigger
            v-for="tab in healthDataTabs"
            :key="tab.id"
            :value="tab.id"
            class="flex items-center gap-2 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Icon :name="tab.icon" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ tab.label }}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <!-- Section de visualisation -->
    <div v-if="showVisualization" class="mb-6">
      <Card class="border-2 border-dashed border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="lucide:bar-chart-3" class="w-5 h-5" />
            Évolution de vos données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HealthDataChart
            :data="filteredHistoricalData"
            :data-type="activeTab"
          />
        </CardContent>
      </Card>
    </div>

    <!-- Formulaires selon l'onglet actif -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Formulaire de saisie -->
      <Card
        class="shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
      >
        <CardHeader
          class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <CardTitle class="flex items-center gap-2 text-xl">
            <Icon
              :name="activeTabInfo?.icon || 'lucide:activity'"
              class="w-6 h-6 text-blue-600"
            />
            {{ activeTabInfo?.title || "Saisie de données" }}
          </CardTitle>
          <CardDescription class="text-gray-600 dark:text-gray-400">
            {{
              activeTabInfo?.description || "Enregistrez vos données de santé"
            }}
          </CardDescription> </CardHeader
        ><CardContent>
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <!-- Formulaire dynamique selon le type sélectionné -->
            <div v-if="activeTab === 'mood'" class="space-y-4">
              <div class="space-y-2">
                <Label>Niveau d'humeur (1-10)</Label>
                <div class="space-y-3">
                  <Input
                    v-model="formData.value"
                    type="range"
                    min="1"
                    max="10"
                    class="w-full"
                  />
                  <div class="text-center text-2xl font-semibold text-primary">
                    {{ formData.value || 5 }}/10
                  </div>
                  <div
                    class="flex justify-between text-xs text-muted-foreground"
                  >
                    <span>Très mauvais</span>
                    <span>Excellent</span>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground">
                  Évaluez votre humeur actuelle sur une échelle de 1 à 10
                </p>
              </div>
            </div>

            <div v-else-if="activeTab === 'sleep'" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <FormField v-slot="{ componentField }" name="sleep_hours">
                  <FormItem>
                    <FormLabel>Heures de sommeil</FormLabel>
                    <FormControl>
                      <Input
                        v-model="formData.value"
                        v-bind="componentField"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        placeholder="8.5"
                      />
                    </FormControl>
                    <FormDescription>Nombre d'heures dormies</FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="sleep_quality">
                  <FormItem>
                    <FormLabel>Qualité (1-5)</FormLabel>
                    <FormControl>
                      <Select
                        v-model="safeMetadata.quality"
                        v-bind="componentField"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Très mauvaise</SelectItem>
                          <SelectItem value="2">Mauvaise</SelectItem>
                          <SelectItem value="3">Correcte</SelectItem>
                          <SelectItem value="4">Bonne</SelectItem>
                          <SelectItem value="5">Excellente</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>

            <div v-else-if="activeTab === 'activity'" class="space-y-4">
              <FormField v-slot="{ componentField }" name="activity_type">
                <FormItem>
                  <FormLabel>Type d'activité</FormLabel>
                  <FormControl>
                    <Select
                      v-model="safeMetadata.activity_type"
                      v-bind="componentField"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une activité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="musculation">Musculation</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="marche">Marche</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="natation">Natation</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div class="grid grid-cols-2 gap-4">
                <FormField v-slot="{ componentField }" name="duration">
                  <FormItem>
                    <FormLabel>Durée (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        v-model="formData.value"
                        v-bind="componentField"
                        type="number"
                        min="1"
                        placeholder="30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="intensity">
                  <FormItem>
                    <FormLabel>Intensité</FormLabel>
                    <FormControl>
                      <Select
                        v-model="safeMetadata.intensity"
                        v-bind="componentField"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="faible">Faible</SelectItem>
                          <SelectItem value="modéré">Modéré</SelectItem>
                          <SelectItem value="élevé">Élevé</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>

            <div v-else-if="activeTab === 'symptoms'" class="space-y-4">
              <FormField v-slot="{ componentField }" name="symptom_type">
                <FormItem>
                  <FormLabel>Type de symptôme</FormLabel>
                  <FormControl>
                    <Select
                      v-model="safeMetadata.symptom_type"
                      v-bind="componentField"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un symptôme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="douleur">Douleur</SelectItem>
                        <SelectItem value="fatigue">Fatigue</SelectItem>
                        <SelectItem value="nausée">Nausée</SelectItem>
                        <SelectItem value="maux_tete">Maux de tête</SelectItem>
                        <SelectItem value="fievre">Fièvre</SelectItem>
                        <SelectItem value="toux">Toux</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="symptom_severity">
                <FormItem>
                  <FormLabel>Intensité (1-10)</FormLabel>
                  <FormControl>
                    <div class="space-y-3">
                      <Input
                        v-model="formData.value"
                        v-bind="componentField"
                        type="range"
                        min="1"
                        max="10"
                        class="w-full"
                      />
                      <div class="text-center text-lg font-semibold">
                        {{ formData.value || 1 }}/10
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription
                    >1 = Très léger, 10 = Insupportable</FormDescription
                  >
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <div v-else-if="activeTab === 'vitals'" class="space-y-4">
              <FormField v-slot="{ componentField }" name="vital_type">
                <FormItem>
                  <FormLabel>Type de mesure</FormLabel>
                  <FormControl>
                    <Select
                      v-model="safeMetadata.vital_type"
                      v-bind="componentField"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une mesure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood_pressure"
                          >Tension artérielle</SelectItem
                        >
                        <SelectItem value="heart_rate"
                          >Fréquence cardiaque</SelectItem
                        >
                        <SelectItem value="weight">Poids</SelectItem>
                        <SelectItem value="temperature">Température</SelectItem>
                        <SelectItem value="glucose">Glycémie</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div
                v-if="safeMetadata.vital_type === 'blood_pressure'"
                class="grid grid-cols-2 gap-4"
              >
                <FormField v-slot="{ componentField }" name="systolic">
                  <FormItem>
                    <FormLabel>Systolique</FormLabel>
                    <FormControl>
                      <Input
                        v-model="safeMetadata.systolic"
                        v-bind="componentField"
                        type="number"
                        placeholder="120"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="diastolic">
                  <FormItem>
                    <FormLabel>Diastolique</FormLabel>
                    <FormControl>
                      <Input
                        v-model="safeMetadata.diastolic"
                        v-bind="componentField"
                        type="number"
                        placeholder="80"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <div v-else>
                <FormField v-slot="{ componentField }" name="vital_value">
                  <FormItem>
                    <FormLabel>Valeur</FormLabel>
                    <FormControl>
                      <Input
                        v-model="formData.value"
                        v-bind="componentField"
                        type="number"
                        step="0.1"
                        :placeholder="getVitalPlaceholder()"
                      />
                    </FormControl>
                    <FormDescription>{{ getVitalUnit() }}</FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>

            <!-- Note optionnelle -->
            <FormField v-slot="{ componentField }" name="notes">
              <FormItem>
                <FormLabel>Notes (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    v-model="formData.notes"
                    v-bind="componentField"
                    placeholder="Ajoutez des détails ou commentaires..."
                    rows="3"
                  />
                </FormControl>
                <FormDescription>
                  Toute information supplémentaire ou contexte
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Date et heure -->
            <div class="grid grid-cols-2 gap-4">
              <FormField v-slot="{ componentField }" name="date">
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      v-model="formData.date"
                      v-bind="componentField"
                      type="date"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="time">
                <FormItem>
                  <FormLabel>Heure</FormLabel>
                  <FormControl>
                    <Input
                      v-model="formData.time"
                      v-bind="componentField"
                      type="time"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
            <!-- Conseil de santé basé sur les valeurs -->
            <div
              v-if="currentHealthAdvice"
              class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div class="flex items-start gap-3">
                <Icon
                  name="lucide:lightbulb"
                  class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                />
                <div>
                  <h4
                    class="font-medium text-green-800 dark:text-green-200 mb-1"
                  >
                    Conseil de santé
                  </h4>
                  <p class="text-sm text-green-700 dark:text-green-300">
                    {{ currentHealthAdvice }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div
              class="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700"
            >
              <Button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon
                  v-if="isSubmitting"
                  name="lucide:loader-2"
                  class="w-4 h-4 mr-2 animate-spin"
                />
                <Icon v-else name="lucide:save" class="w-4 h-4 mr-2" />
                {{
                  isSubmitting ? "Enregistrement..." : "Enregistrer les données"
                }}
              </Button>
              <Button
                class="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                type="button"
                variant="outline"
                @click="resetForm"
              >
                <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <!-- Historique récent -->
      <Card class="shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader
          class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
        >
          <CardTitle class="flex items-center gap-2 text-xl">
            <Icon name="lucide:history" class="w-6 h-6 text-green-600" />
            Historique récent
          </CardTitle>
          <CardDescription>Vos dernières saisies</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            v-if="recentData.length === 0"
            class="text-center py-12 text-gray-500 dark:text-gray-400"
          >
            <div
              class="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
            >
              <Icon
                name="lucide:clipboard-list"
                class="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
              />
              <h3
                class="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300"
              >
                Aucune donnée récente
              </h3>
              <p class="text-sm mb-4">
                Commencez par saisir vos premières données
              </p>
              <Button variant="outline" class="mx-auto">
                <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
                Commencer maintenant
              </Button>
            </div>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="item in recentData"
              :key="item.id"
              class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm"
                >
                  <Icon
                    :name="getTypeIcon(item.data_type)"
                    class="h-5 w-5 text-blue-600"
                  />
                </div>
                <div>
                  <div class="font-semibold text-gray-900 dark:text-gray-100">
                    {{ getTypeName(item.data_type) }}
                  </div>
                  <div
                    class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"
                  >
                    <Icon name="lucide:clock" class="w-3 h-3" />
                    {{ formatDateTime(item.recorded_at) }}
                  </div>
                </div>
              </div>
              <div class="text-right flex items-center gap-3">
                <div>
                  <div class="font-semibold text-lg text-blue-600">
                    {{ formatValue(item) }}
                  </div>
                  <div
                    v-if="item.notes"
                    class="text-xs text-gray-500 dark:text-gray-400 max-w-20 truncate"
                  >
                    {{ item.notes }}
                  </div>
                </div>
                <Button
                  class="text-xs h-8 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                  size="sm"
                  variant="ghost"
                  @click="editItem(item)"
                >
                  <Icon name="lucide:edit-2" class="w-3 h-3 mr-1" />
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
import { Label } from "@/components/ui/label";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  metadata: {},
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

// Computed pour les métadonnées avec initialisation
const safeMetadata = computed({
  get: () => formData.value.metadata || {},
  set: (value) => {
    if (!formData.value.metadata) {
      formData.value.metadata = {};
    }
    formData.value.metadata = value;
  },
});

// Watchers
watch(activeTab, (newTab) => {
  formData.value.data_type = newTab;
  resetForm();
});

// Méthodes
const getVitalPlaceholder = () => {
  const vitalType = safeMetadata.value?.vital_type;
  switch (vitalType) {
    case "heart_rate":
      return "70";
    case "weight":
      return "70.5";
    case "temperature":
      return "36.5";
    case "glucose":
      return "90";
    default:
      return "0";
  }
};

const getVitalUnit = () => {
  const vitalType = safeMetadata.value?.vital_type;
  switch (vitalType) {
    case "heart_rate":
      return "bpm (battements par minute)";
    case "weight":
      return "kg";
    case "temperature":
      return "°C";
    case "glucose":
      return "mg/dL";
    default:
      return "";
  }
};

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

const getHealthAdvice = (
  dataType: string,
  value?: number,
  metadata?: Record<string, any>
) => {
  if (!value) return null;

  switch (dataType) {
    case "mood":
      if (value <= 3)
        return "Votre humeur semble basse. Considérez des activités relaxantes ou consultez un professionnel.";
      if (value >= 8)
        return "Excellente humeur ! Continuez ce qui vous fait du bien.";
      if (value >= 6)
        return "Bonne humeur générale. Maintenez vos habitudes positives.";
      return "Humeur modérée. Prenez soin de vous et n'hésitez pas à demander de l'aide si nécessaire.";

    case "sleep":
      if (value < 6)
        return "Durée de sommeil insuffisante. Essayez de vous coucher plus tôt.";
      if (value > 9)
        return "Beaucoup de sommeil. Assurez-vous que la qualité est bonne.";
      return "Durée de sommeil dans la normale. Veillez à maintenir une routine.";

    case "vitals":
      if (metadata?.vital_type === "blood_pressure") {
        const systolic = value;
        const diastolic = metadata?.diastolic;
        if (systolic > 140 || diastolic > 90) {
          return "Tension élevée détectée. Consultez votre médecin.";
        }
        if (systolic < 90 || diastolic < 60) {
          return "Tension basse. Surveillez vos symptômes.";
        }
        return "Tension artérielle dans les normes.";
      }
      break;
  }
  return null;
};

// Computed property pour afficher les conseils
const currentHealthAdvice = computed(() => {
  return getHealthAdvice(
    activeTab.value,
    formData.value.value,
    formData.value.metadata
  );
});

// Validation en temps réel
const getValidationStatus = (
  dataType: string,
  value?: number,
  metadata?: Record<string, any>
) => {
  if (!value && value !== 0) return { status: "neutral", message: "" };

  switch (dataType) {
    case "mood":
      if (value < 1 || value > 10)
        return { status: "error", message: "Valeur doit être entre 1 et 10" };
      if (value <= 2)
        return { status: "warning", message: "Humeur très basse" };
      if (value >= 9)
        return { status: "success", message: "Excellente humeur" };
      return { status: "success", message: "Valeur valide" };

    case "sleep":
      if (value < 0 || value > 24)
        return { status: "error", message: "Durée invalide" };
      if (value < 4)
        return { status: "warning", message: "Sommeil très court" };
      if (value > 12)
        return { status: "warning", message: "Sommeil très long" };
      return { status: "success", message: "Durée normale" };

    case "activity":
      if (value < 0) return { status: "error", message: "Durée invalide" };
      if (value > 300)
        return { status: "warning", message: "Activité très longue" };
      return { status: "success", message: "Durée valide" };

    case "symptoms":
      if (value < 1 || value > 10)
        return {
          status: "error",
          message: "Intensité doit être entre 1 et 10",
        };
      if (value >= 8) return { status: "warning", message: "Symptôme intense" };
      return { status: "success", message: "Intensité valide" };

    case "vitals":
      if (metadata?.vital_type === "blood_pressure") {
        const systolic = value;
        const diastolic = metadata?.diastolic;
        if (!systolic || !diastolic) return { status: "neutral", message: "" };
        if (systolic > 180 || diastolic > 110)
          return { status: "error", message: "Tension dangereusement élevée" };
        if (systolic > 140 || diastolic > 90)
          return { status: "warning", message: "Tension élevée" };
        if (systolic < 80 || diastolic < 50)
          return { status: "warning", message: "Tension basse" };
        return { status: "success", message: "Tension normale" };
      }
      break;
  }

  return { status: "success", message: "Valeur valide" };
};

const currentValidation = computed(() => {
  return getValidationStatus(
    activeTab.value,
    formData.value.value,
    formData.value.metadata
  );
});

const handleSubmit = async () => {
  if (!user.value || !userId.value) {
    toastStore.error(
      "Vous devez être connecté pour enregistrer des données",
      "Erreur d'authentification"
    );
    return;
  }

  // Vérifications spécifiques selon le type de données
  if (
    activeTab.value === "vitals" &&
    safeMetadata.value.vital_type === "blood_pressure"
  ) {
    if (!safeMetadata.value.systolic || !safeMetadata.value.diastolic) {
      toastStore.error(
        "Veuillez saisir la tension systolique et diastolique",
        "Données manquantes"
      );
      return;
    }
    // Combiner les valeurs de tension artérielle
    formData.value.value = parseFloat(safeMetadata.value.systolic);
    formData.value.unit = "mmHg";
    formData.value.metadata = {
      ...formData.value.metadata,
      diastolic: parseFloat(safeMetadata.value.diastolic),
      type: "blood_pressure",
    };
  }

  // Assignation de l'unité selon le type de données vital
  if (
    activeTab.value === "vitals" &&
    safeMetadata.value.vital_type &&
    safeMetadata.value.vital_type !== "blood_pressure"
  ) {
    switch (safeMetadata.value.vital_type) {
      case "weight":
        formData.value.unit = "kg";
        break;
      case "temperature":
        formData.value.unit = "°C";
        break;
      case "heart_rate":
        formData.value.unit = "bpm";
        break;
      case "glucose":
        formData.value.unit = "mg/dL";
        break;
    }
  }

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
    } as any);

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
    metadata: {},
  };
};

const editItem = (item: HealthDataItem) => {
  // Remplir le formulaire avec les données de l'élément
  const recordedDate = new Date(item.recorded_at);

  formData.value = {
    data_type: item.data_type,
    value: item.value,
    unit: item.unit,
    notes: item.notes,
    date: recordedDate.toISOString().split("T")[0] || "",
    time: recordedDate.toTimeString().split(" ")[0]?.substring(0, 5) || "12:00",
    metadata: item.metadata || {},
  };

  // Changer l'onglet actif pour correspondre au type de données
  activeTab.value = item.data_type;

  // Notification pour l'utilisateur
  toastStore.info(
    `Données de ${getTypeName(item.data_type)} chargées dans le formulaire`,
    "Modification"
  );

  // Scroll vers le formulaire
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const loadRecentData = async () => {
  if (!user.value || !userId.value) return;

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
