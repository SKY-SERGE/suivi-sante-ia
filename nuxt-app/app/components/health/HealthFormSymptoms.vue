<template>
  <div class="space-y-4">
    <!-- Sélection des symptômes -->
    <div>
      <Label class="text-base font-medium"
        >Quels symptômes ressentez-vous ?</Label
      >
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="symptom in commonSymptoms"
          :key="symptom.id"
          @click="toggleSymptom(symptom)"
          :class="[
            'flex items-center p-3 rounded-lg border-2 transition-all duration-200',
            selectedSymptoms.some((s) => s.id === symptom.id)
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          ]"
          type="button"
        >
          <Icon :name="symptom.icon" class="h-5 w-5 mr-2" />
          <div class="text-left">
            <div class="font-medium text-sm">{{ symptom.name }}</div>
            <div class="text-xs text-gray-500">{{ symptom.category }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Symptôme personnalisé -->
    <div>
      <Label for="custom-symptom">Autre symptôme (optionnel)</Label>
      <div class="mt-1 flex space-x-2">
        <Input
          id="custom-symptom"
          v-model="customSymptom"
          placeholder="Décrivez votre symptôme..."
          class="flex-1"
        />
        <Button
          type="button"
          @click="addCustomSymptom"
          :disabled="!customSymptom.trim()"
          variant="outline"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Liste des symptômes sélectionnés avec intensité -->
    <div v-if="selectedSymptoms.length > 0">
      <Label class="text-base font-medium">Intensité des symptômes</Label>
      <div class="mt-2 space-y-3">
        <div
          v-for="symptom in selectedSymptoms"
          :key="symptom.id"
          class="p-3 border border-gray-200 rounded-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <Icon :name="symptom.icon" class="h-4 w-4 mr-2 text-red-600" />
              <span class="font-medium">{{ symptom.name }}</span>
            </div>
            <Button
              type="button"
              @click="removeSymptom(symptom.id)"
              variant="ghost"
              size="sm"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </Button>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Intensité: {{ symptom.intensity }}/10</span>
              <span :class="getIntensityColor(symptom.intensity)">
                {{ getIntensityLabel(symptom.intensity) }}
              </span>
            </div>

            <input
              v-model="symptom.intensity"
              type="range"
              min="1"
              max="10"
              step="1"
              @input="updateMetadata"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />

            <div class="flex justify-between text-xs text-gray-500">
              <span>1 (Léger)</span>
              <span>5 (Modéré)</span>
              <span>10 (Sévère)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Durée des symptômes -->
    <div v-if="selectedSymptoms.length > 0">
      <Label for="symptom-duration"
        >Depuis quand ressentez-vous ces symptômes ?</Label
      >
      <select
        id="symptom-duration"
        v-model="symptomDuration"
        @change="updateMetadata"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">Sélectionner une durée</option>
        <option value="less_than_hour">Moins d'une heure</option>
        <option value="few_hours">Quelques heures</option>
        <option value="today">Aujourd'hui</option>
        <option value="yesterday">Depuis hier</option>
        <option value="few_days">Quelques jours</option>
        <option value="week">Une semaine</option>
        <option value="few_weeks">Quelques semaines</option>
        <option value="month">Un mois ou plus</option>
      </select>
    </div>

    <!-- Facteurs déclenchants -->
    <div v-if="selectedSymptoms.length > 0">
      <Label class="text-base font-medium"
        >Facteurs déclenchants possibles (optionnel)</Label
      >
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="trigger in symptomTriggers"
          :key="trigger.id"
          @click="toggleTrigger(trigger.id)"
          :class="[
            'flex items-center p-2 rounded-lg border text-sm transition-colors',
            selectedTriggers.includes(trigger.id)
              ? 'border-orange-500 bg-orange-50 text-orange-700'
              : 'border-gray-200 hover:border-gray-300',
          ]"
          type="button"
        >
          <Icon :name="trigger.icon" class="h-4 w-4 mr-2" />
          {{ trigger.label }}
        </button>
      </div>
    </div>

    <!-- Actions prises -->
    <div v-if="selectedSymptoms.length > 0">
      <Label class="text-base font-medium"
        >Actions prises pour soulager (optionnel)</Label
      >
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="action in reliefActions"
          :key="action.id"
          @click="toggleAction(action.id)"
          :class="[
            'flex items-center p-2 rounded-lg border text-sm transition-colors',
            selectedActions.includes(action.id)
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-gray-300',
          ]"
          type="button"
        >
          <Icon :name="action.icon" class="h-4 w-4 mr-2" />
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- Notes supplémentaires -->
    <div>
      <Label for="symptom-notes">Description détaillée (optionnel)</Label>
      <textarea
        id="symptom-notes"
        v-model="modelValue.notes"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Décrivez plus précisément vos symptômes, leur évolution..."
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: {
    value?: number;
    unit?: string;
    notes?: string;
    metadata?: Record<string, any>;
  };
}

interface Emits {
  (e: "update:modelValue", value: Props["modelValue"]): void;
}

interface Symptom {
  id: string;
  name: string;
  category: string;
  icon: string;
  intensity: number;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// État local
const selectedSymptoms = ref<Symptom[]>([]);
const customSymptom = ref("");
const symptomDuration = ref("");
const selectedTriggers = ref<string[]>([]);
const selectedActions = ref<string[]>([]);

// Symptômes communs
const commonSymptoms = [
  {
    id: "headache",
    name: "Mal de tête",
    category: "Neurologique",
    icon: "lucide:brain",
  },
  {
    id: "fatigue",
    name: "Fatigue",
    category: "Général",
    icon: "lucide:battery-low",
  },
  { id: "nausea", name: "Nausée", category: "Digestif", icon: "lucide:frown" },
  {
    id: "fever",
    name: "Fièvre",
    category: "Général",
    icon: "lucide:thermometer",
  },
  { id: "cough", name: "Toux", category: "Respiratoire", icon: "lucide:wind" },
  {
    id: "sore_throat",
    name: "Mal de gorge",
    category: "Respiratoire",
    icon: "lucide:throat",
  },
  {
    id: "back_pain",
    name: "Mal de dos",
    category: "Musculaire",
    icon: "lucide:user-x",
  },
  {
    id: "joint_pain",
    name: "Douleur articulaire",
    category: "Musculaire",
    icon: "lucide:bone",
  },
  {
    id: "stomach_pain",
    name: "Mal de ventre",
    category: "Digestif",
    icon: "lucide:circle-dot",
  },
  {
    id: "dizziness",
    name: "Vertiges",
    category: "Neurologique",
    icon: "lucide:rotate-cw",
  },
  {
    id: "chest_pain",
    name: "Douleur thoracique",
    category: "Cardiaque",
    icon: "lucide:heart",
  },
  {
    id: "shortness_breath",
    name: "Essoufflement",
    category: "Respiratoire",
    icon: "lucide:wind",
  },
];

// Facteurs déclenchants
const symptomTriggers = [
  { id: "stress", label: "Stress", icon: "lucide:zap" },
  { id: "lack_sleep", label: "Manque de sommeil", icon: "lucide:moon" },
  { id: "food", label: "Alimentation", icon: "lucide:utensils" },
  { id: "weather", label: "Météo", icon: "lucide:cloud" },
  {
    id: "physical_activity",
    label: "Activité physique",
    icon: "lucide:activity",
  },
  { id: "medication", label: "Médicament", icon: "lucide:pill" },
  { id: "hormones", label: "Hormones", icon: "lucide:trending-up" },
  { id: "posture", label: "Posture", icon: "lucide:user" },
];

// Actions de soulagement
const reliefActions = [
  { id: "rest", label: "Repos", icon: "lucide:bed" },
  { id: "medication", label: "Médicament", icon: "lucide:pill" },
  { id: "hot_cold", label: "Chaud/Froid", icon: "lucide:thermometer" },
  { id: "massage", label: "Massage", icon: "lucide:hand" },
  { id: "hydration", label: "Hydratation", icon: "lucide:droplet" },
  { id: "breathing", label: "Respiration", icon: "lucide:wind" },
  { id: "stretching", label: "Étirements", icon: "lucide:move-3d" },
  { id: "meditation", label: "Méditation", icon: "lucide:brain" },
];

// Méthodes
const toggleSymptom = (symptom: any) => {
  const index = selectedSymptoms.value.findIndex((s) => s.id === symptom.id);
  if (index > -1) {
    selectedSymptoms.value.splice(index, 1);
  } else {
    selectedSymptoms.value.push({
      ...symptom,
      intensity: 5,
    });
  }
  updateMetadata();
};

const addCustomSymptom = () => {
  if (!customSymptom.value.trim()) return;

  const customId = `custom_${Date.now()}`;
  selectedSymptoms.value.push({
    id: customId,
    name: customSymptom.value.trim(),
    category: "Personnalisé",
    icon: "lucide:help-circle",
    intensity: 5,
  });

  customSymptom.value = "";
  updateMetadata();
};

const removeSymptom = (symptomId: string) => {
  const index = selectedSymptoms.value.findIndex((s) => s.id === symptomId);
  if (index > -1) {
    selectedSymptoms.value.splice(index, 1);
    updateMetadata();
  }
};

const toggleTrigger = (triggerId: string) => {
  const index = selectedTriggers.value.indexOf(triggerId);
  if (index > -1) {
    selectedTriggers.value.splice(index, 1);
  } else {
    selectedTriggers.value.push(triggerId);
  }
  updateMetadata();
};

const toggleAction = (actionId: string) => {
  const index = selectedActions.value.indexOf(actionId);
  if (index > -1) {
    selectedActions.value.splice(index, 1);
  } else {
    selectedActions.value.push(actionId);
  }
  updateMetadata();
};

const getIntensityLabel = (intensity: number) => {
  if (intensity <= 3) return "Léger";
  if (intensity <= 6) return "Modéré";
  if (intensity <= 8) return "Fort";
  return "Sévère";
};

const getIntensityColor = (intensity: number) => {
  if (intensity <= 3) return "text-yellow-600";
  if (intensity <= 6) return "text-orange-600";
  if (intensity <= 8) return "text-red-600";
  return "text-red-800";
};

const updateModelValue = (updates: Partial<Props["modelValue"]>) => {
  emit("update:modelValue", {
    ...props.modelValue,
    ...updates,
  });
};

const updateMetadata = () => {
  // Calculer l'intensité moyenne comme valeur principale
  const avgIntensity =
    selectedSymptoms.value.length > 0
      ? selectedSymptoms.value.reduce((sum, s) => sum + s.intensity, 0) /
        selectedSymptoms.value.length
      : 0;

  updateModelValue({
    value: Math.round(avgIntensity * 10) / 10, // Arrondir à 1 décimale
    unit: "/10",
    metadata: {
      ...props.modelValue.metadata,
      symptoms: selectedSymptoms.value,
      duration: symptomDuration.value,
      triggers: selectedTriggers.value,
      reliefActions: selectedActions.value,
      symptomCount: selectedSymptoms.value.length,
    },
  });
};

// Initialisation
onMounted(() => {
  if (props.modelValue.metadata) {
    const meta = props.modelValue.metadata;
    selectedSymptoms.value = meta.symptoms || [];
    symptomDuration.value = meta.duration || "";
    selectedTriggers.value = meta.triggers || [];
    selectedActions.value = meta.reliefActions || [];
  }
});
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #ef4444;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #ef4444;
  cursor: pointer;
  border: none;
}
</style>
