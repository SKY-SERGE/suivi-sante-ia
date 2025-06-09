<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-6"
    :aria-label="formTitle"
  >
    <!-- En-tête du formulaire -->
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-lg font-semibold text-gray-900">{{ formTitle }}</h2>
      <p v-if="formDescription" class="mt-1 text-sm text-gray-600">
        {{ formDescription }}
      </p>

      <!-- Indicateur de progression -->
      <div v-if="showProgress" class="mt-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Progression</span>
          <span class="text-gray-900 font-medium"
            >{{ completionPercentage }}%</span
          >
        </div>
        <div class="mt-1 bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${completionPercentage}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Indicateur de sauvegarde automatique -->
    <div
      v-if="autoSave && (isSaving || lastSaved)"
      class="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
    >
      <div class="flex items-center">
        <Icon
          :name="isSaving ? 'lucide:loader-2' : 'lucide:check-circle'"
          class="h-4 w-4 mr-2"
          :class="isSaving ? 'animate-spin text-blue-600' : 'text-green-600'"
        />
        <span class="text-gray-700">
          {{
            isSaving ? "Sauvegarde en cours..." : "Sauvegardé automatiquement"
          }}
        </span>
      </div>
      <span v-if="lastSaved && !isSaving" class="text-gray-500">
        {{ formatRelativeTime(lastSaved) }}
      </span>
    </div>

    <!-- Champs du formulaire -->
    <div class="space-y-4">
      <slot
        :errors="errors"
        :validationErrors="validationErrors"
        :isValid="isValid"
        :isDirty="isDirty"
        :validate="validateField"
        :clearError="clearFieldError"
      />
    </div>

    <!-- Actions du formulaire -->
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 border-t border-gray-200"
    >
      <!-- Informations sur les erreurs -->
      <div v-if="Object.keys(validationErrors).length > 0" class="mb-4 sm:mb-0">
        <p class="text-sm text-red-600">
          {{ Object.keys(validationErrors).length }} erreur(s) à corriger
        </p>
      </div>

      <!-- Boutons d'action -->
      <div class="flex space-x-3">
        <Button
          v-if="showCancel"
          type="button"
          variant="outline"
          @click="handleCancel"
          :disabled="isSubmitting"
        >
          {{ cancelLabel }}
        </Button>

        <Button
          type="submit"
          :disabled="!isValid || isSubmitting"
          :loading="isSubmitting"
          class="min-w-32"
        >
          {{ submitLabel }}
        </Button>
      </div>
    </div>

    <!-- Raccourcis clavier -->
    <div v-if="showKeyboardShortcuts" class="pt-4 border-t border-gray-100">
      <details class="text-sm text-gray-600">
        <summary class="cursor-pointer hover:text-gray-800">
          Raccourcis clavier
        </summary>
        <div class="mt-2 pl-4 space-y-1">
          <div>
            <kbd class="bg-gray-100 px-1 rounded">Ctrl+S</kbd> - Sauvegarder
          </div>
          <div>
            <kbd class="bg-gray-100 px-1 rounded">Ctrl+Enter</kbd> - Soumettre
          </div>
          <div>
            <kbd class="bg-gray-100 px-1 rounded">Escape</kbd> - Annuler
          </div>
        </div>
      </details>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface FormField {
  name: string;
  rules?: ValidationRule;
}

interface Props {
  formTitle: string;
  formDescription?: string;
  fields: FormField[];
  modelValue: Record<string, any>;
  autoSave?: boolean;
  autoSaveDelay?: number; // en millisecondes
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  showProgress?: boolean;
  showKeyboardShortcuts?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoSave: false,
  autoSaveDelay: 2000,
  submitLabel: "Enregistrer",
  cancelLabel: "Annuler",
  showCancel: true,
  showProgress: false,
  showKeyboardShortcuts: true,
  validateOnBlur: true,
  validateOnChange: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, any>];
  submit: [value: Record<string, any>];
  cancel: [];
  autoSave: [value: Record<string, any>];
  validationChange: [isValid: boolean, errors: Record<string, string>];
}>();

const { notifications } = useNotifications();

// État du formulaire
const isSubmitting = ref(false);
const isSaving = ref(false);
const lastSaved = ref<Date | null>(null);
const validationErrors = ref<Record<string, string>>({});
const touchedFields = ref<Set<string>>(new Set());
const initialData = ref<Record<string, any>>({});

// Auto-save timer
let autoSaveTimer: NodeJS.Timeout | null = null;

// Computed
const errors = computed(() => validationErrors.value);

const isValid = computed(
  () => Object.keys(validationErrors.value).length === 0
);

const isDirty = computed(() => {
  return JSON.stringify(props.modelValue) !== JSON.stringify(initialData.value);
});

const completionPercentage = computed(() => {
  const totalFields = props.fields.length;
  const completedFields = props.fields.filter((field) => {
    const value = props.modelValue[field.name];
    return value !== undefined && value !== null && value !== "";
  }).length;

  return Math.round((completedFields / totalFields) * 100);
});

// Méthodes de validation
const validateField = (fieldName: string, value: any): string | null => {
  const field = props.fields.find((f) => f.name === fieldName);
  if (!field?.rules) return null;

  const rules = field.rules;

  // Required
  if (
    rules.required &&
    (value === undefined || value === null || value === "")
  ) {
    return "Ce champ est obligatoire";
  }

  // Si le champ est vide et non requis, pas d'autres validations
  if (!value && !rules.required) return null;

  // MinLength
  if (
    rules.minLength &&
    typeof value === "string" &&
    value.length < rules.minLength
  ) {
    return `Minimum ${rules.minLength} caractères requis`;
  }

  // MaxLength
  if (
    rules.maxLength &&
    typeof value === "string" &&
    value.length > rules.maxLength
  ) {
    return `Maximum ${rules.maxLength} caractères autorisés`;
  }

  // Pattern
  if (
    rules.pattern &&
    typeof value === "string" &&
    !rules.pattern.test(value)
  ) {
    return "Format invalide";
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

const validateAllFields = () => {
  const errors: Record<string, string> = {};

  props.fields.forEach((field) => {
    const error = validateField(field.name, props.modelValue[field.name]);
    if (error) {
      errors[field.name] = error;
    }
  });

  validationErrors.value = errors;
  emit("validationChange", Object.keys(errors).length === 0, errors);
};

const clearFieldError = (fieldName: string) => {
  delete validationErrors.value[fieldName];
};

// Gestion de la soumission
const handleSubmit = async () => {
  validateAllFields();

  if (!isValid.value) {
    notifications.error("Erreurs de validation", {
      message:
        "Veuillez corriger les erreurs avant de soumettre le formulaire.",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    emit("submit", { ...props.modelValue });
    notifications.success("Formulaire soumis", {
      message: "Les données ont été enregistrées avec succès.",
    });
  } catch (error) {
    notifications.error("Erreur de soumission", {
      message: "Une erreur est survenue lors de l'enregistrement.",
    });
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  if (isDirty.value) {
    const confirmed = confirm(
      "Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?"
    );
    if (!confirmed) return;
  }

  emit("cancel");
};

// Auto-save
const triggerAutoSave = () => {
  if (!props.autoSave || !isDirty.value) return;

  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }

  autoSaveTimer = setTimeout(async () => {
    if (!isValid.value) return;

    isSaving.value = true;

    try {
      emit("autoSave", { ...props.modelValue });
      lastSaved.value = new Date();
    } catch (error) {
      notifications.warning("Sauvegarde automatique échouée", {
        message: "Impossible de sauvegarder automatiquement.",
      });
    } finally {
      isSaving.value = false;
    }
  }, props.autoSaveDelay);
};

// Surveillance des changements
watch(
  () => props.modelValue,
  () => {
    if (props.validateOnChange) {
      validateAllFields();
    }

    if (props.autoSave) {
      triggerAutoSave();
    }
  },
  { deep: true }
);

// Raccourcis clavier
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === "s") {
      event.preventDefault();
      if (props.autoSave) {
        triggerAutoSave();
      } else {
        handleSubmit();
      }
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  }

  if (event.key === "Escape") {
    handleCancel();
  }
};

// Formatage du temps relatif
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 60) {
    return "à l'instant";
  } else if (diffMinutes < 60) {
    return `il y a ${diffMinutes} min`;
  } else {
    return "il y a plus d'1h";
  }
};

// Lifecycle
onMounted(() => {
  initialData.value = { ...props.modelValue };
  validateAllFields();
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  document.removeEventListener("keydown", handleKeydown);
});

// Exposition des méthodes
defineExpose({
  validateAllFields,
  validateField,
  clearFieldError,
  submit: handleSubmit,
  reset: () => {
    emit("update:modelValue", { ...initialData.value });
    validationErrors.value = {};
    touchedFields.value.clear();
  },
});
</script>

<style scoped>
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 0.75em;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
  border: 1px solid #d1d5db;
}
</style>
