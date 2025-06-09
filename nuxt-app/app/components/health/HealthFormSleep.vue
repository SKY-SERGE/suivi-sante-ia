<template>
  <div class="space-y-4">
    <!-- Durée du sommeil -->
    <div>
      <Label class="text-base font-medium"
        >Combien d'heures avez-vous dormi ?</Label
      >
      <div class="mt-2 grid grid-cols-2 gap-4">
        <div>
          <Label for="sleep-hours">Heures</Label>
          <Input
            id="sleep-hours"
            v-model.number="sleepHours"
            type="number"
            min="0"
            max="12"
            step="1"
            @input="updateSleepDuration"
            placeholder="8"
          />
        </div>
        <div>
          <Label for="sleep-minutes">Minutes</Label>
          <select
            id="sleep-minutes"
            v-model.number="sleepMinutes"
            @change="updateSleepDuration"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="0">0 min</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Heures de coucher et lever -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <Label for="bedtime">Heure de coucher</Label>
        <Input
          id="bedtime"
          v-model="bedtime"
          type="time"
          @input="updateMetadata"
        />
      </div>
      <div>
        <Label for="wakeup">Heure de réveil</Label>
        <Input
          id="wakeup"
          v-model="wakeupTime"
          type="time"
          @input="updateMetadata"
        />
      </div>
    </div>

    <!-- Qualité du sommeil -->
    <div>
      <Label class="text-base font-medium"
        >Qualité du sommeil ({{ sleepQuality }}/10)</Label
      >
      <div class="mt-3">
        <div class="grid grid-cols-5 gap-2 mb-3">
          <button
            v-for="quality in sleepQualities"
            :key="quality.value"
            @click="selectSleepQuality(quality)"
            :class="[
              'flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200',
              sleepQuality === quality.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
            ]"
            type="button"
          >
            <Icon :name="quality.icon" class="h-6 w-6 mb-1" />
            <span class="text-xs font-medium">{{ quality.label }}</span>
          </button>
        </div>

        <!-- Slider pour ajustement fin -->
        <input
          v-model="sleepQuality"
          type="range"
          min="1"
          max="10"
          step="1"
          @input="updateSleepQuality"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 (Très mauvais)</span>
          <span>5 (Moyen)</span>
          <span>10 (Excellent)</span>
        </div>
      </div>
    </div>

    <!-- Facteurs affectant le sommeil -->
    <div>
      <Label class="text-base font-medium"
        >Facteurs affectant votre sommeil (optionnel)</Label
      >
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="factor in sleepFactors"
          :key="factor.id"
          @click="toggleSleepFactor(factor.id)"
          :class="[
            'flex items-center p-2 rounded-lg border text-sm transition-colors',
            selectedSleepFactors.includes(factor.id)
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300',
          ]"
          type="button"
        >
          <Icon :name="factor.icon" class="h-4 w-4 mr-2" />
          {{ factor.label }}
        </button>
      </div>
    </div>

    <!-- Réveils nocturnes -->
    <div>
      <Label for="night-awakenings">Nombre de réveils nocturnes</Label>
      <select
        id="night-awakenings"
        v-model.number="nightAwakenings"
        @change="updateMetadata"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="0">Aucun</option>
        <option value="1">1 fois</option>
        <option value="2">2 fois</option>
        <option value="3">3 fois</option>
        <option value="4">4 fois ou plus</option>
      </select>
    </div>

    <!-- Notes supplémentaires -->
    <div>
      <Label for="sleep-notes">Notes sur votre sommeil (optionnel)</Label>
      <textarea
        id="sleep-notes"
        v-model="modelValue.notes"
        rows="2"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Rêves, difficultés d'endormissement, etc."
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
const sleepHours = ref(8);
const sleepMinutes = ref(0);
const sleepQuality = ref(7);
const bedtime = ref("22:00");
const wakeupTime = ref("07:00");
const nightAwakenings = ref(0);
const selectedSleepFactors = ref<string[]>([]);

// Configuration des qualités de sommeil
const sleepQualities = [
  { value: 2, label: "Très mauvais", icon: "lucide:x-circle" },
  { value: 4, label: "Mauvais", icon: "lucide:frown" },
  { value: 6, label: "Moyen", icon: "lucide:meh" },
  { value: 8, label: "Bon", icon: "lucide:smile" },
  { value: 10, label: "Excellent", icon: "lucide:sun" },
];

// Facteurs affectant le sommeil
const sleepFactors = [
  { id: "stress", label: "Stress", icon: "lucide:zap" },
  { id: "caffeine", label: "Caféine", icon: "lucide:coffee" },
  { id: "alcohol", label: "Alcool", icon: "lucide:wine" },
  { id: "exercise", label: "Exercice tardif", icon: "lucide:dumbbell" },
  { id: "screen", label: "Écrans", icon: "lucide:smartphone" },
  { id: "noise", label: "Bruit", icon: "lucide:volume-2" },
  { id: "temperature", label: "Température", icon: "lucide:thermometer" },
  { id: "medication", label: "Médicaments", icon: "lucide:pill" },
];

// Méthodes
const updateSleepDuration = () => {
  const totalHours = sleepHours.value + sleepMinutes.value / 60;
  updateModelValue({
    value: totalHours,
    unit: "heures",
  });
  updateMetadata();
};

const updateSleepQuality = () => {
  updateMetadata();
};

const selectSleepQuality = (quality: any) => {
  sleepQuality.value = quality.value;
  updateMetadata();
};

const toggleSleepFactor = (factorId: string) => {
  const index = selectedSleepFactors.value.indexOf(factorId);
  if (index > -1) {
    selectedSleepFactors.value.splice(index, 1);
  } else {
    selectedSleepFactors.value.push(factorId);
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
      sleepQuality: sleepQuality.value,
      bedtime: bedtime.value,
      wakeupTime: wakeupTime.value,
      nightAwakenings: nightAwakenings.value,
      sleepFactors: selectedSleepFactors.value,
      sleepHours: sleepHours.value,
      sleepMinutes: sleepMinutes.value,
    },
  });
};

// Initialisation
onMounted(() => {
  if (props.modelValue.value) {
    const hours = Math.floor(props.modelValue.value);
    const minutes = Math.round((props.modelValue.value - hours) * 60);
    sleepHours.value = hours;
    sleepMinutes.value = minutes;
  }

  if (props.modelValue.metadata) {
    const meta = props.modelValue.metadata;
    sleepQuality.value = meta.sleepQuality || 7;
    bedtime.value = meta.bedtime || "22:00";
    wakeupTime.value = meta.wakeupTime || "07:00";
    nightAwakenings.value = meta.nightAwakenings || 0;
    selectedSleepFactors.value = meta.sleepFactors || [];
    if (meta.sleepHours) sleepHours.value = meta.sleepHours;
    if (meta.sleepMinutes) sleepMinutes.value = meta.sleepMinutes;
  }

  updateSleepDuration();
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
