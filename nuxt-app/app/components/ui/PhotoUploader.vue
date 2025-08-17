<template>
  <div class="w-full">
    <!-- Zone de drop et upload -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragenter.prevent="isDragging = true"
      @drop.prevent="handleDrop($event)"
      @click="triggerFileInput"
      :class="{
        'border-primary ring-2 ring-primary/20 bg-primary/5': isDragging,
        'border-gray-300 hover:border-gray-400': !isDragging && !preview,
        'border-transparent': preview,
      }"
      class="relative flex flex-col items-center justify-center w-full transition-all rounded-lg cursor-pointer"
    >
      <!-- Preview de l'image -->
      <div v-if="preview" class="relative w-full group">
        <img
          :src="preview"
          alt="Prévisualisation"
          class="w-full h-56 object-cover rounded-lg shadow-md"
        />
        <div
          class="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 group-hover:opacity-100 transition-opacity rounded-lg"
        >
          <div class="space-x-2">
            <Button
              type="button"
              @click.stop="triggerFileInput"
              variant="outline"
              size="sm"
              class="bg-white/90 hover:bg-white text-gray-700"
            >
              <Icon name="lucide:image" class="mr-2 h-4 w-4" />
              Changer
            </Button>
            <Button
              type="button"
              @click.stop="clearImage"
              variant="outline"
              size="sm"
              class="bg-white/90 hover:bg-white text-red-600"
            >
              <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <!-- Zone d'upload sans image -->
      <div
        v-else
        class="p-6 space-y-2 text-center border-2 border-dashed rounded-lg"
      >
        <Icon
          name="lucide:upload-cloud"
          class="mx-auto h-12 w-12 text-gray-400"
        />
        <div
          class="flex flex-col sm:flex-row items-center justify-center text-gray-600"
        >
          <Button
            type="button"
            @click.stop="triggerFileInput"
            variant="ghost"
            class="px-2 text-primary hover:text-primary/90"
          >
            Sélectionnez une photo
          </Button>
          <p class="pl-1">ou glissez-déposez</p>
        </div>
        <p class="text-xs text-gray-500">
          Formats acceptés: JPG, PNG (max. 10MB)
        </p>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Icon } from "#components";

// Props & models

const modelValue = defineModel<File | null>("file", {
  default: null,
});

const props = defineProps<{}>();

// Refs
const fileInput = ref<HTMLInputElement | null>(null);
const preview = ref<string | null>(null);
const isDragging = ref(false);
const error = ref("");

// Constants
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

// Validation functions
const validateFile = (file: File): boolean => {
  error.value = "";

  if (!ACCEPTED_TYPES.includes(file.type)) {
    error.value = "Type de fichier non supporté. Utilisez JPG ou PNG.";
    return false;
  }

  if (file.size > MAX_SIZE) {
    error.value = "La taille du fichier doit être inférieure à 10MB.";
    return false;
  }

  return true;
};

// File handling
const processFile = (file: File) => {
  if (validateFile(file)) {
    modelValue.value = file;
    createPreview(file);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    processFile(file);
  }
};

// Actions
function triggerFileInput() {
  fileInput.value?.click();
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] || null;
  if (file) {
    processFile(file);
  }
}

// Création de la prévisualisation
const createPreview = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

function clearImage() {
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  modelValue.value = null;
  preview.value = null;
}

// Watch for prop changes
watch(
  () => modelValue.value,
  (newFile) => {
    if (newFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.value = e.target?.result as string;
      };
      reader.readAsDataURL(newFile);
    } else {
      preview.value = null;
    }
  },
  { immediate: true }
);

// Cleanup
onBeforeUnmount(() => {
  if (preview.value) {
    URL.revokeObjectURL(preview.value);
  }
});
</script>
