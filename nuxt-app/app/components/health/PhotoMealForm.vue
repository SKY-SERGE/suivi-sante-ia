<template>
  <div class="w-full max-w-md mx-auto space-y-4">
    <PhotoUploader v-model:file="uploadedFile" />

    <div v-if="uploadedFile" class="mt-4">
      <p class="text-sm text-gray-500">
        Fichier sélectionné : {{ uploadedFile.name }} ({{
          formatFileSize(uploadedFile.size)
        }})
      </p>
    </div>

    <div class="flex justify-between mt-6">
      <Button @click="emit('cancel')" variant="outline"> Annuler </Button>
      <Button
        @click="analyzePhoto"
        :disabled="!uploadedFile || isProcessing"
        :class="{
          'opacity-50 cursor-not-allowed': !uploadedFile || isProcessing,
        }"
      >
        <Icon
          v-if="isProcessing"
          name="lucide:loader-2"
          class="mr-2 h-4 w-4 animate-spin"
        />
        <Icon v-else name="lucide:camera" class="mr-2 h-4 w-4" />
        {{ isProcessing ? "Analyse en cours..." : "Analyser" }}
      </Button>
    </div>

    <!-- Affichage des résultats -->
    <div v-if="apiResult" class="mt-6 p-4 bg-white rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-2 flex items-center">
        <Icon name="lucide:brain" class="mr-2 h-5 w-5" />
        Résultats de l'analyse
      </h3>
      <div class="space-y-2">
        <p><strong>Aliment détecté :</strong> {{ apiResult.food }}</p>
        <div class="mt-4">
          <h4 class="font-medium mb-2">Informations nutritionnelles :</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Calories : {{ apiResult.nutrition.cal }} kcal</li>
            <li>Protéines : {{ apiResult.nutrition.protein }}g</li>
            <li>Glucides : {{ apiResult.nutrition.carbs }}g</li>
            <li>Lipides : {{ apiResult.nutrition.fat }}g</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="isError" class="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRuntimeConfig } from "#app";
import { useToast } from "@/composables/useToast";
import { Icon } from "#components";
import { Button } from "@/components/ui/button";
import PhotoUploader from "@/components/ui/PhotoUploader.vue";

// Type pour la réponse de l'API
interface ApiResult {
  food: string;
  nutrition: {
    cal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const config = useRuntimeConfig();
const { success: toastSuccess, error: toastError } = useToast();
const apiResult = ref<ApiResult | null>(null);
const uploadedFile = ref<File | null>(null);
const isSaving = ref(false);
const isError = ref(false);
const errorMessage = ref("");

const isProcessing = computed(() => isSaving.value);

// Émets les événements
const emit = defineEmits<{
  cancel: [];
  success: [result: ApiResult];
}>();

// Formate la taille du fichier en KB/MB
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
};

// Analyse la photo
const analyzePhoto = async () => {
  if (!uploadedFile.value) return;

  try {
    isSaving.value = true;
    isError.value = false;
    errorMessage.value = "";

    const formData = new FormData();
    formData.append("image", uploadedFile.value);

    const response = await fetch(
      `${config.public.visionAiBaseUrl}/predict_from_file`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de l'analyse de l'image");
    }

    const result = await response.json();
    apiResult.value = result;
    emit("success", result);

    toastSuccess("Photo analysée avec succès");
  } catch (error) {
    isError.value = true;
    errorMessage.value =
      error instanceof Error ? error.message : "Une erreur est survenue";
    console.error("Erreur lors de l'analyse:", error);
    toastError("Erreur lors de l'analyse de la photo");
  } finally {
    isSaving.value = false;
  }
};
</script>
