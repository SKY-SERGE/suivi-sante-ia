<template>
  <div class="w-full max-w-md mx-auto space-y-4">
    <MyuiPhotoUploader v-model:file="uploadedFile" />

    <div v-if="uploadedFile" class="mt-4">
      <p class="text-sm text-gray-500">
        Fichier sélectionné : {{ uploadedFile.name }} ({{
          formatFileSize(uploadedFile.size)
        }})
      </p>
    </div>

    <div class="flex justify-between mt-6">
      <Button @click="emit('cancel')" variant="outline"> Annuler </Button>
      <Button @click="analyzePhoto" :disabled="!uploadedFile || isProcessing" :class="{
        'opacity-50 cursor-not-allowed': !uploadedFile || isProcessing,
      }">
        <Icon v-if="isProcessing" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
        <Icon v-else name="lucide:camera" class="mr-2 h-4 w-4" />
        {{ isProcessing ? "Analyse en cours..." : "Analyser" }}
      </Button>
    </div>

    <!-- Affichage des résultats -->
    <div v-if="apiResult" class="mt-6 space-y-4">
      <!-- Aliment détecté -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div class="flex items-center mb-2">
          <Icon name="lucide:utensils" class="mr-2 h-5 w-5 text-green-600" />
          <h3 class="text-lg font-semibold text-green-800">Aliment identifié</h3>
        </div>
        <p class="text-2xl font-bold text-green-700 capitalize">{{ apiResult.food }}</p>
      </div>

      <!-- Informations nutritionnelles -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div class="flex items-center mb-4">
          <Icon name="lucide:bar-chart-3" class="mr-2 h-5 w-5 text-blue-600" />
          <h4 class="text-lg font-semibold text-gray-800">Informations nutritionnelles</h4>
          <span class="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Pour 100g
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Calories -->
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <Icon name="lucide:zap" class="mx-auto mb-2 h-6 w-6 text-orange-600" />
            <div class="text-2xl font-bold text-orange-700">{{ apiResult.nutrition.cal }}</div>
            <div class="text-sm text-orange-600 font-medium">kcal</div>
          </div>

          <!-- Protéines -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <Icon name="lucide:dumbbell" class="mx-auto mb-2 h-6 w-6 text-red-600" />
            <div class="text-2xl font-bold text-red-700">{{ apiResult.nutrition.protein }}</div>
            <div class="text-sm text-red-600 font-medium">g de protéines</div>
          </div>

          <!-- Glucides -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <Icon name="lucide:wheat" class="mx-auto mb-2 h-6 w-6 text-blue-600" />
            <div class="text-2xl font-bold text-blue-700">{{ apiResult.nutrition.carbs }}</div>
            <div class="text-sm text-blue-600 font-medium">g de glucides</div>
          </div>

          <!-- Lipides -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <Icon name="lucide:droplets" class="mx-auto mb-2 h-6 w-6 text-yellow-600" />
            <div class="text-2xl font-bold text-yellow-700">{{ apiResult.nutrition.fat }}</div>
            <div class="text-sm text-yellow-600 font-medium">g de lipides</div>
          </div>
        </div>

        <!-- Répartition calorique -->
        <div class="mt-6 pt-4 border-t border-gray-200">
          <h5 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Icon name="lucide:pie-chart" class="mr-2 h-4 w-4" />
            Répartition calorique
          </h5>
          <div class="flex space-x-4 text-xs">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-red-500 rounded-full mr-1" />
              <span class="text-gray-600">
                Protéines: {{ Math.round((apiResult.nutrition.protein * 4 / apiResult.nutrition.cal) * 100) }}%
              </span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-1" />
              <span class="text-gray-600">
                Glucides: {{ Math.round((apiResult.nutrition.carbs * 4 / apiResult.nutrition.cal) * 100) }}%
              </span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-yellow-500 rounded-full mr-1" />
              <span class="text-gray-600">
                Lipides: {{ Math.round((apiResult.nutrition.fat * 9 / apiResult.nutrition.cal) * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions supplémentaires -->
      <div class="flex justify-end space-x-2">
        <Button variant="outline" size="sm" @click="resetForm">
          <Icon name="lucide:rotate-ccw" class="mr-2 h-4 w-4" />
          Nouvelle analyse
        </Button>
        <Button size="sm" @click="saveResult">
          <Icon name="lucide:save" class="mr-2 h-4 w-4" />
          Enregistrer
        </Button>
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
const isProcessing = ref(false);
const isError = ref(false);
const errorMessage = ref("");

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
    isProcessing.value = true;
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
    if (!result.food || !result.nutrition) {
      throw new Error("Réponse API invalide");
    }
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
    isProcessing.value = false;
  }
};

// Remet à zéro le formulaire pour une nouvelle analyse
const resetForm = () => {
  uploadedFile.value = null;
  apiResult.value = null;
  isError.value = false;
  errorMessage.value = "";
  isProcessing.value = false;
};

// Sauvegarde le résultat (à implémenter selon vos besoins)
const saveResult = () => {
  if (apiResult.value) {
    // Ici vous pouvez ajouter la logique pour sauvegarder les données
    // Par exemple, ajouter à une base de données, local storage, etc.
    toastSuccess("Résultat sauvegardé avec succès");
    console.log("Résultat à sauvegarder:", apiResult.value);
  }
};
</script>
