<template>
  <div class="space-y-4">
    <!-- Échelle d'humeur -->
    <div>
      <Label class="text-base font-medium"
        >Comment vous sentez-vous aujourd'hui ?</Label
      >
      <div class="mt-3">
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="mood in moodLevels"
            :key="mood.value"
            :class="[
              'flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200',
              selectedMood?.value === mood.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
            ]"
            type="button"
            @click="selectMood(mood)"
          >
            <Icon :name="mood.icon" class="h-6 w-6 mb-1" />
            <span class="text-xs font-medium">{{ mood.label }}</span>
            <span class="text-xs text-gray-500">{{ mood.value }}/10</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Échelle numérique fine -->
    <div v-if="selectedMood">
      <Label>Ajustement précis ({{ modelValue.value }}/10)</Label>
      <div class="mt-2">
        <input
          v-model="modelValue.value"
          type="range"
          min="1"
          max="10"
          step="1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 (Très mal)</span>
          <span>5 (Neutre)</span>
          <span>10 (Excellent)</span>
        </div>
      </div>
    </div>

    <!-- Facteurs influençant l'humeur -->
    <div>
      <Label class="text-base font-medium"
        >Facteurs influençant votre humeur (optionnel)</Label
      >
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="factor in moodFactors"
          :key="factor.id"
          :class="[
            'flex items-center p-2 rounded-lg border text-sm transition-colors',
            selectedFactors.includes(factor.id)
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300',
          ]"
          type="button"
          @click="toggleFactor(factor.id)"
        >
          <Icon :name="factor.icon" class="h-4 w-4 mr-2" />
          {{ factor.label }}
        </button>
      </div>
    </div>

    <!-- Description personnalisée -->
    <div>
      <Label for="mood-description"
        >Description de votre état (optionnel)</Label
      >
      <textarea
        id="mood-description"
        v-model="modelValue.notes"
        rows="2"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Décrivez votre humeur en quelques mots..."
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
const selectedMood = ref(null);
const selectedFactors = ref<string[]>([]);

// Configuration des niveaux d'humeur
const moodLevels = [
  { value: 2, label: "Très mal", icon: "lucide:frown", color: "red" },
  { value: 4, label: "Mal", icon: "lucide:meh", color: "orange" },
  { value: 6, label: "Neutre", icon: "lucide:smile", color: "yellow" },
  { value: 8, label: "Bien", icon: "lucide:smile", color: "green" },
  { value: 10, label: "Excellent", icon: "lucide:laugh", color: "emerald" },
];

// Facteurs influençant l'humeur
const moodFactors = [
  { id: "sleep", label: "Sommeil", icon: "lucide:moon" },
  { id: "work", label: "Travail", icon: "lucide:briefcase" },
  { id: "family", label: "Famille", icon: "lucide:heart" },
  { id: "health", label: "Santé", icon: "lucide:activity" },
  { id: "weather", label: "Météo", icon: "lucide:sun" },
  { id: "social", label: "Relations", icon: "lucide:users" },
  { id: "stress", label: "Stress", icon: "lucide:zap" },
  { id: "exercise", label: "Exercice", icon: "lucide:dumbbell" },
];

// Méthodes
const selectMood = (mood: any) => {
  selectedMood.value = mood;
  updateModelValue({
    value: mood.value,
    unit: "/10",
  });
};

const toggleFactor = (factorId: string) => {
  const index = selectedFactors.value.indexOf(factorId);
  if (index > -1) {
    selectedFactors.value.splice(index, 1);
  } else {
    selectedFactors.value.push(factorId);
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
  updateModelValue({
    metadata: {
      ...props.modelValue.metadata,
      factors: selectedFactors.value,
    },
  });
};

// Initialisation
onMounted(() => {
  if (props.modelValue.value) {
    selectedMood.value =
      moodLevels.find((m) => m.value === props.modelValue.value) || null;
  }
  if (props.modelValue.metadata?.factors) {
    selectedFactors.value = props.modelValue.metadata.factors;
  }
});
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
