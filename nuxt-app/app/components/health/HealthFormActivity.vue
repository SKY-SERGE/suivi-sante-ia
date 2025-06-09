<template>
  <div class="space-y-4">
    <!-- Type d'activité -->
    <div>
      <Label class="text-base font-medium">Type d'activité physique</Label>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="activity in activityTypes"
          :key="activity.id"
          @click="selectActivityType(activity)"
          :class="[
            'flex items-center p-3 rounded-lg border-2 transition-all duration-200',
            selectedActivity?.id === activity.id
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          ]"
          type="button"
        >
          <Icon :name="activity.icon" class="h-5 w-5 mr-2" />
          <div class="text-left">
            <div class="font-medium text-sm">{{ activity.name }}</div>
            <div class="text-xs text-gray-500">{{ activity.category }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Activité personnalisée -->
    <div v-if="selectedActivity?.id === 'custom'">
      <Label for="custom-activity">Nom de l'activité</Label>
      <Input
        id="custom-activity"
        v-model="customActivityName"
        @input="updateMetadata"
        placeholder="Ex: Jardinage, ménage..."
        class="mt-1"
      />
    </div>

    <!-- Durée -->
    <div>
      <Label class="text-base font-medium">Durée de l'activité</Label>
      <div class="mt-2 grid grid-cols-2 gap-4">
        <div>
          <Label for="duration-hours">Heures</Label>
          <Input
            id="duration-hours"
            v-model.number="durationHours"
            type="number"
            min="0"
            max="8"
            step="1"
            @input="updateDuration"
            placeholder="0"
          />
        </div>
        <div>
          <Label for="duration-minutes">Minutes</Label>
          <Input
            id="duration-minutes"
            v-model.number="durationMinutes"
            type="number"
            min="0"
            max="59"
            step="5"
            @input="updateDuration"
            placeholder="30"
          />
        </div>
      </div>
    </div>

    <!-- Intensité -->
    <div>
      <Label class="text-base font-medium"
        >Intensité de l'effort ({{ intensity }}/10)</Label
      >
      <div class="mt-3">
        <div class="grid grid-cols-4 gap-2 mb-3">
          <button
            v-for="level in intensityLevels"
            :key="level.value"
            @click="selectIntensity(level)"
            :class="[
              'flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200',
              intensity === level.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
            ]"
            type="button"
          >
            <Icon :name="level.icon" class="h-6 w-6 mb-1" />
            <span class="text-xs font-medium">{{ level.label }}</span>
          </button>
        </div>

        <!-- Slider pour ajustement fin -->
        <input
          v-model="intensity"
          type="range"
          min="1"
          max="10"
          step="1"
          @input="updateMetadata"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 (Très léger)</span>
          <span>5 (Modéré)</span>
          <span>10 (Maximal)</span>
        </div>
      </div>
    </div>

    <!-- Calories brûlées (estimation) -->
    <div v-if="estimatedCalories > 0">
      <Label>Calories estimées brûlées</Label>
      <div class="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center">
          <Icon name="lucide:flame" class="h-5 w-5 mr-2 text-green-600" />
          <span class="font-medium text-green-700"
            >{{ estimatedCalories }} calories</span
          >
        </div>
        <p class="text-xs text-green-600 mt-1">
          Estimation basée sur l'activité, la durée et l'intensité
        </p>
      </div>
    </div>

    <!-- Ressenti post-exercice -->
    <div>
      <Label class="text-base font-medium"
        >Comment vous sentez-vous après l'exercice ?</Label
      >
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="feeling in postExerciseFeelings"
          :key="feeling.id"
          @click="toggleFeeling(feeling.id)"
          :class="[
            'flex items-center p-2 rounded-lg border text-sm transition-colors',
            selectedFeelings.includes(feeling.id)
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300',
          ]"
          type="button"
        >
          <Icon :name="feeling.icon" class="h-4 w-4 mr-2" />
          {{ feeling.label }}
        </button>
      </div>
    </div>

    <!-- Lieu de l'activité -->
    <div>
      <Label for="location">Lieu de l'activité (optionnel)</Label>
      <select
        id="location"
        v-model="activityLocation"
        @change="updateMetadata"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">Sélectionner un lieu</option>
        <option value="home">À domicile</option>
        <option value="gym">Salle de sport</option>
        <option value="outdoor">Extérieur</option>
        <option value="pool">Piscine</option>
        <option value="studio">Studio/cours</option>
        <option value="other">Autre</option>
      </select>
    </div>

    <!-- Notes supplémentaires -->
    <div>
      <Label for="activity-notes">Notes sur votre activité (optionnel)</Label>
      <textarea
        id="activity-notes"
        v-model="modelValue.notes"
        rows="2"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Performance, ressenti, objectifs atteints..."
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
const selectedActivity = ref(null);
const customActivityName = ref("");
const durationHours = ref(0);
const durationMinutes = ref(30);
const intensity = ref(5);
const activityLocation = ref("");
const selectedFeelings = ref<string[]>([]);

// Types d'activités
const activityTypes = [
  {
    id: "walking",
    name: "Marche",
    category: "Cardio",
    icon: "lucide:footprints",
    met: 3.5,
  },
  {
    id: "running",
    name: "Course",
    category: "Cardio",
    icon: "lucide:zap",
    met: 7.0,
  },
  {
    id: "cycling",
    name: "Vélo",
    category: "Cardio",
    icon: "lucide:bike",
    met: 6.0,
  },
  {
    id: "swimming",
    name: "Natation",
    category: "Cardio",
    icon: "lucide:waves",
    met: 8.0,
  },
  {
    id: "strength",
    name: "Musculation",
    category: "Force",
    icon: "lucide:dumbbell",
    met: 5.0,
  },
  {
    id: "yoga",
    name: "Yoga",
    category: "Flexibilité",
    icon: "lucide:heart",
    met: 3.0,
  },
  {
    id: "stretching",
    name: "Étirements",
    category: "Flexibilité",
    icon: "lucide:move-3d",
    met: 2.5,
  },
  {
    id: "custom",
    name: "Autre",
    category: "Personnalisé",
    icon: "lucide:plus",
    met: 4.0,
  },
];

// Niveaux d'intensité
const intensityLevels = [
  { value: 2, label: "Très léger", icon: "lucide:circle" },
  { value: 4, label: "Léger", icon: "lucide:circle-dot" },
  { value: 6, label: "Modéré", icon: "lucide:target" },
  { value: 8, label: "Intense", icon: "lucide:zap" },
];

// Ressenti post-exercice
const postExerciseFeelings = [
  { id: "energized", label: "Énergisé", icon: "lucide:zap" },
  { id: "tired", label: "Fatigué", icon: "lucide:battery-low" },
  { id: "satisfied", label: "Satisfait", icon: "lucide:smile" },
  { id: "sore", label: "Courbatures", icon: "lucide:alert-triangle" },
  { id: "relaxed", label: "Détendu", icon: "lucide:sun" },
  { id: "motivated", label: "Motivé", icon: "lucide:trending-up" },
];

// Computed
const estimatedCalories = computed(() => {
  if (!selectedActivity.value || durationMinutes.value === 0) return 0;

  const totalMinutes = durationHours.value * 60 + durationMinutes.value;
  const met = selectedActivity.value.met * (intensity.value / 5); // Ajustement selon l'intensité
  const weightKg = 70; // Poids moyen, pourrait être personnalisé

  return Math.round((met * weightKg * totalMinutes) / 60);
});

// Méthodes
const selectActivityType = (activity: any) => {
  selectedActivity.value = activity;
  updateMetadata();
};

const selectIntensity = (level: any) => {
  intensity.value = level.value;
  updateMetadata();
};

const updateDuration = () => {
  const totalMinutes = durationHours.value * 60 + durationMinutes.value;
  updateModelValue({
    value: totalMinutes,
    unit: "minutes",
  });
  updateMetadata();
};

const toggleFeeling = (feelingId: string) => {
  const index = selectedFeelings.value.indexOf(feelingId);
  if (index > -1) {
    selectedFeelings.value.splice(index, 1);
  } else {
    selectedFeelings.value.push(feelingId);
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
      activityType: selectedActivity.value?.id,
      activityName:
        selectedActivity.value?.id === "custom"
          ? customActivityName.value
          : selectedActivity.value?.name,
      intensity: intensity.value,
      location: activityLocation.value,
      feelings: selectedFeelings.value,
      estimatedCalories: estimatedCalories.value,
      durationHours: durationHours.value,
      durationMinutes: durationMinutes.value,
    },
  });
};

// Initialisation
onMounted(() => {
  if (props.modelValue.value) {
    const totalMinutes = props.modelValue.value;
    durationHours.value = Math.floor(totalMinutes / 60);
    durationMinutes.value = totalMinutes % 60;
  }

  if (props.modelValue.metadata) {
    const meta = props.modelValue.metadata;
    intensity.value = meta.intensity || 5;
    activityLocation.value = meta.location || "";
    selectedFeelings.value = meta.feelings || [];
    customActivityName.value = meta.customActivityName || "";

    if (meta.activityType) {
      selectedActivity.value =
        activityTypes.find((a) => a.id === meta.activityType) || null;
    }

    if (meta.durationHours !== undefined)
      durationHours.value = meta.durationHours;
    if (meta.durationMinutes !== undefined)
      durationMinutes.value = meta.durationMinutes;
  }

  updateDuration();
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
