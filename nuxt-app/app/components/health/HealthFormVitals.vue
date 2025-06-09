<template>
  <div class="space-y-4">
    <!-- Sélection du type de signe vital -->
    <div>
      <Label class="text-base font-medium"
        >Quel signe vital souhaitez-vous enregistrer ?</Label
      >
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="vital in vitalTypes"
          :key="vital.id"
          @click="selectVitalType(vital)"
          :class="[
            'flex items-center p-3 rounded-lg border-2 transition-all duration-200',
            selectedVitalType?.id === vital.id
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          ]"
          type="button"
        >
          <Icon :name="vital.icon" class="h-5 w-5 mr-2" />
          <div class="text-left">
            <div class="font-medium text-sm">{{ vital.name }}</div>
            <div class="text-xs text-gray-500">{{ vital.unit }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Formulaire spécifique selon le type sélectionné -->
    <div v-if="selectedVitalType">
      <!-- Tension artérielle -->
      <div v-if="selectedVitalType.id === 'blood_pressure'" class="space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="systolic">Pression systolique</Label>
            <div class="relative">
              <Input
                id="systolic"
                v-model.number="bloodPressure.systolic"
                type="number"
                min="60"
                max="250"
                @input="updateBloodPressure"
                placeholder="120"
                class="pr-12"
              />
              <span
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
              >
                mmHg
              </span>
            </div>
          </div>
          <div>
            <Label for="diastolic">Pression diastolique</Label>
            <div class="relative">
              <Input
                id="diastolic"
                v-model.number="bloodPressure.diastolic"
                type="number"
                min="30"
                max="150"
                @input="updateBloodPressure"
                placeholder="80"
                class="pr-12"
              />
              <span
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
              >
                mmHg
              </span>
            </div>
          </div>
        </div>

        <!-- Interprétation de la tension -->
        <div
          v-if="bloodPressure.systolic && bloodPressure.diastolic"
          class="p-3 rounded-lg border"
        >
          <div class="flex items-center">
            <Icon
              :name="getBPStatusIcon()"
              :class="getBPStatusColor()"
              class="h-5 w-5 mr-2"
            />
            <span :class="getBPStatusColor()" class="font-medium">
              {{ getBPStatusText() }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mt-1">{{ getBPDescription() }}</p>
        </div>
      </div>

      <!-- Poids -->
      <div v-else-if="selectedVitalType.id === 'weight'" class="space-y-3">
        <div>
          <Label for="weight-value">Poids</Label>
          <div class="relative">
            <Input
              id="weight-value"
              v-model.number="weight"
              type="number"
              min="20"
              max="300"
              step="0.1"
              @input="updateWeight"
              placeholder="70.5"
              class="pr-8"
            />
            <span
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
            >
              kg
            </span>
          </div>
        </div>
      </div>

      <!-- Fréquence cardiaque -->
      <div v-else-if="selectedVitalType.id === 'heart_rate'" class="space-y-3">
        <div>
          <Label for="heart-rate-value">Fréquence cardiaque</Label>
          <div class="relative">
            <Input
              id="heart-rate-value"
              v-model.number="heartRate"
              type="number"
              min="30"
              max="220"
              @input="updateHeartRate"
              placeholder="72"
              class="pr-12"
            />
            <span
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
            >
              bpm
            </span>
          </div>
        </div>

        <!-- Contexte de la mesure -->
        <div>
          <Label for="hr-context">Contexte de la mesure</Label>
          <select
            id="hr-context"
            v-model="heartRateContext"
            @change="updateMetadata"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionner le contexte</option>
            <option value="rest">Au repos</option>
            <option value="after_exercise">Après exercice</option>
            <option value="during_exercise">Pendant l'exercice</option>
            <option value="stressed">En stress</option>
            <option value="morning">Au réveil</option>
          </select>
        </div>

        <!-- Interprétation de la fréquence cardiaque -->
        <div v-if="heartRate" class="p-3 rounded-lg border">
          <div class="flex items-center">
            <Icon
              :name="getHRStatusIcon()"
              :class="getHRStatusColor()"
              class="h-5 w-5 mr-2"
            />
            <span :class="getHRStatusColor()" class="font-medium">
              {{ getHRStatusText() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Température -->
      <div v-else-if="selectedVitalType.id === 'temperature'" class="space-y-3">
        <div>
          <Label for="temperature-value">Température corporelle</Label>
          <div class="relative">
            <Input
              id="temperature-value"
              v-model.number="temperature"
              type="number"
              min="35"
              max="43"
              step="0.1"
              @input="updateTemperature"
              placeholder="37.0"
              class="pr-8"
            />
            <span
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
            >
              °C
            </span>
          </div>
        </div>

        <!-- Méthode de mesure -->
        <div>
          <Label for="temp-method">Méthode de mesure</Label>
          <select
            id="temp-method"
            v-model="temperatureMethod"
            @change="updateMetadata"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionner la méthode</option>
            <option value="oral">Orale</option>
            <option value="axillary">Aisselle</option>
            <option value="ear">Oreille</option>
            <option value="forehead">Front</option>
            <option value="rectal">Rectale</option>
          </select>
        </div>

        <!-- Interprétation de la température -->
        <div v-if="temperature" class="p-3 rounded-lg border">
          <div class="flex items-center">
            <Icon
              :name="getTempStatusIcon()"
              :class="getTempStatusColor()"
              class="h-5 w-5 mr-2"
            />
            <span :class="getTempStatusColor()" class="font-medium">
              {{ getTempStatusText() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Conditions de mesure -->
    <div v-if="selectedVitalType">
      <Label class="text-base font-medium"
        >Conditions de mesure (optionnel)</Label
      >
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="condition in measurementConditions"
          :key="condition.id"
          @click="toggleCondition(condition.id)"
          :class="[
            'flex items-center p-2 rounded-lg border text-sm transition-colors',
            selectedConditions.includes(condition.id)
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300',
          ]"
          type="button"
        >
          <Icon :name="condition.icon" class="h-4 w-4 mr-2" />
          {{ condition.label }}
        </button>
      </div>
    </div>

    <!-- Notes supplémentaires -->
    <div>
      <Label for="vitals-notes">Notes sur la mesure (optionnel)</Label>
      <textarea
        id="vitals-notes"
        v-model="modelValue.notes"
        rows="2"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Circonstances particulières, ressenti..."
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

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// État local
const selectedVitalType = ref(null);
const bloodPressure = ref({ systolic: null, diastolic: null });
const weight = ref(null);
const heartRate = ref(null);
const heartRateContext = ref("");
const temperature = ref(null);
const temperatureMethod = ref("");
const selectedConditions = ref<string[]>([]);

// Types de signes vitaux
const vitalTypes = [
  {
    id: "blood_pressure",
    name: "Tension artérielle",
    icon: "lucide:heart",
    unit: "mmHg",
  },
  { id: "weight", name: "Poids", icon: "lucide:scale", unit: "kg" },
  {
    id: "heart_rate",
    name: "Fréquence cardiaque",
    icon: "lucide:activity",
    unit: "bpm",
  },
  {
    id: "temperature",
    name: "Température",
    icon: "lucide:thermometer",
    unit: "°C",
  },
];

// Conditions de mesure
const measurementConditions = [
  { id: "fasting", label: "À jeun", icon: "lucide:coffee" },
  { id: "after_meal", label: "Après repas", icon: "lucide:utensils" },
  { id: "after_exercise", label: "Après exercice", icon: "lucide:activity" },
  { id: "stressed", label: "Stressé", icon: "lucide:zap" },
  { id: "tired", label: "Fatigué", icon: "lucide:moon" },
  { id: "medication", label: "Sous médication", icon: "lucide:pill" },
];

// Méthodes pour la tension artérielle
const getBPStatusIcon = () => {
  const sys = bloodPressure.value.systolic;
  const dia = bloodPressure.value.diastolic;

  if (sys >= 140 || dia >= 90) return "lucide:alert-triangle";
  if (sys >= 130 || dia >= 80) return "lucide:alert-circle";
  if (sys < 90 || dia < 60) return "lucide:trending-down";
  return "lucide:check-circle";
};

const getBPStatusColor = () => {
  const sys = bloodPressure.value.systolic;
  const dia = bloodPressure.value.diastolic;

  if (sys >= 140 || dia >= 90) return "text-red-600";
  if (sys >= 130 || dia >= 80) return "text-orange-600";
  if (sys < 90 || dia < 60) return "text-blue-600";
  return "text-green-600";
};

const getBPStatusText = () => {
  const sys = bloodPressure.value.systolic;
  const dia = bloodPressure.value.diastolic;

  if (sys >= 140 || dia >= 90) return "Tension élevée";
  if (sys >= 130 || dia >= 80) return "Tension limite";
  if (sys < 90 || dia < 60) return "Tension basse";
  return "Tension normale";
};

const getBPDescription = () => {
  const sys = bloodPressure.value.systolic;
  const dia = bloodPressure.value.diastolic;

  if (sys >= 140 || dia >= 90) return "Consultez un professionnel de santé";
  if (sys >= 130 || dia >= 80) return "Surveillez régulièrement";
  if (sys < 90 || dia < 60) return "Peut nécessiter une consultation";
  return "Valeurs dans la normale";
};

// Méthodes pour la fréquence cardiaque
const getHRStatusIcon = () => {
  if (heartRate.value > 100) return "lucide:trending-up";
  if (heartRate.value < 60) return "lucide:trending-down";
  return "lucide:heart";
};

const getHRStatusColor = () => {
  if (heartRate.value > 100) return "text-orange-600";
  if (heartRate.value < 60) return "text-blue-600";
  return "text-green-600";
};

const getHRStatusText = () => {
  if (heartRate.value > 100) return "Fréquence élevée";
  if (heartRate.value < 60) return "Fréquence basse";
  return "Fréquence normale";
};

// Méthodes pour la température
const getTempStatusIcon = () => {
  if (temperature.value >= 38) return "lucide:thermometer";
  if (temperature.value <= 36) return "lucide:snowflake";
  return "lucide:check-circle";
};

const getTempStatusColor = () => {
  if (temperature.value >= 38) return "text-red-600";
  if (temperature.value <= 36) return "text-blue-600";
  return "text-green-600";
};

const getTempStatusText = () => {
  if (temperature.value >= 38) return "Fièvre";
  if (temperature.value <= 36) return "Hypothermie";
  return "Température normale";
};

// Méthodes principales
const selectVitalType = (vital: any) => {
  selectedVitalType.value = vital;
  updateMetadata();
};

const updateBloodPressure = () => {
  if (bloodPressure.value.systolic && bloodPressure.value.diastolic) {
    updateModelValue({
      value: bloodPressure.value.systolic, // Valeur principale = systolique
      unit: "mmHg",
    });
  }
  updateMetadata();
};

const updateWeight = () => {
  updateModelValue({
    value: weight.value,
    unit: "kg",
  });
  updateMetadata();
};

const updateHeartRate = () => {
  updateModelValue({
    value: heartRate.value,
    unit: "bpm",
  });
  updateMetadata();
};

const updateTemperature = () => {
  updateModelValue({
    value: temperature.value,
    unit: "°C",
  });
  updateMetadata();
};

const toggleCondition = (conditionId: string) => {
  const index = selectedConditions.value.indexOf(conditionId);
  if (index > -1) {
    selectedConditions.value.splice(index, 1);
  } else {
    selectedConditions.value.push(conditionId);
  }
  updateMetadata();
};

const updateModelValue = (updates: Partial<Props["modelValue"]>) => {
  emit("update:modelValue", {
    ...props.modelValue,
    ...updates,
  });
};

const updateMetadata = () => {
  const metadata = {
    ...props.modelValue.metadata,
    vitalType: selectedVitalType.value?.id,
    conditions: selectedConditions.value,
  };

  // Ajouter les données spécifiques selon le type
  if (selectedVitalType.value?.id === "blood_pressure") {
    metadata.systolic = bloodPressure.value.systolic;
    metadata.diastolic = bloodPressure.value.diastolic;
  } else if (selectedVitalType.value?.id === "heart_rate") {
    metadata.context = heartRateContext.value;
  } else if (selectedVitalType.value?.id === "temperature") {
    metadata.method = temperatureMethod.value;
  }

  updateModelValue({ metadata });
};

// Initialisation
onMounted(() => {
  if (props.modelValue.metadata) {
    const meta = props.modelValue.metadata;
    selectedConditions.value = meta.conditions || [];

    if (meta.vitalType) {
      selectedVitalType.value =
        vitalTypes.find((v) => v.id === meta.vitalType) || null;

      if (meta.vitalType === "blood_pressure") {
        bloodPressure.value.systolic = meta.systolic || props.modelValue.value;
        bloodPressure.value.diastolic = meta.diastolic;
      } else if (meta.vitalType === "heart_rate") {
        heartRate.value = props.modelValue.value;
        heartRateContext.value = meta.context || "";
      } else if (meta.vitalType === "temperature") {
        temperature.value = props.modelValue.value;
        temperatureMethod.value = meta.method || "";
      } else if (meta.vitalType === "weight") {
        weight.value = props.modelValue.value;
      }
    }
  }
});
</script>
