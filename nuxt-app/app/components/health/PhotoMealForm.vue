<template>
  <div class="space-y-6">
    <!-- Options de capture -->
    <div class="flex justify-center space-x-4">
      <Button
        @click="captureFromCamera"
        :disabled="isProcessing"
        class="bg-blue-600 hover:bg-blue-700"
      >
        <Icon name="lucide:camera" class="mr-2 h-4 w-4" />
        Prendre une photo
      </Button>

      <Button
        @click="selectFromGallery"
        :disabled="isProcessing"
        variant="outline"
        class="border-blue-300 text-blue-600 hover:bg-blue-50"
      >
        <Icon name="lucide:image" class="mr-2 h-4 w-4" />
        Galerie
      </Button>
    </div>

    <!-- Input fichier caché -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="handleFileSelection"
    />

    <input
      ref="galleryInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelection"
    />

    <!-- Zone de prévisualisation -->
    <div v-if="selectedImage" class="space-y-4">
      <div class="relative">
        <img
          :src="selectedImage.preview"
          :alt="selectedImage.name"
          class="w-full max-w-md mx-auto rounded-lg shadow-md"
        />
        <Button
          @click="clearImage"
          variant="outline"
          size="sm"
          class="absolute top-2 right-2 bg-white/90 hover:bg-white"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </Button>
      </div>

      <!-- Informations sur l'image -->
      <div class="text-center text-sm text-gray-600">
        <p>{{ selectedImage.name }}</p>
        <p>{{ formatFileSize(selectedImage.size) }}</p>
      </div>
    </div>

    <!-- Formulaire complémentaire -->
    <div v-if="selectedImage" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="mealType">Type de repas *</Label>
          <select
            id="mealType"
            v-model="form.mealType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Sélectionnez un type</option>
            <option value="petit-dejeuner">Petit-déjeuner</option>
            <option value="dejeuner">Déjeuner</option>
            <option value="diner">Dîner</option>
            <option value="collation">Collation</option>
          </select>
        </div>

        <div class="space-y-2">
          <Label for="mealTime">Heure du repas *</Label>
          <input
            id="mealTime"
            v-model="form.mealTime"
            type="datetime-local"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>
      <div class="space-y-2">
        <Label for="notes">Notes (optionnel)</Label>
        <textarea
          id="notes"
          v-model="form.notes"
          rows="3"
          placeholder="Ajoutez des détails sur votre repas..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        ></textarea>
      </div>

      <!-- Satisfaction et niveau de faim -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="satisfaction">Satisfaction (1-5)</Label>
          <select
            id="satisfaction"
            v-model="form.satisfaction"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Non spécifié</option>
            <option value="1">1 - Très insatisfait</option>
            <option value="2">2 - Insatisfait</option>
            <option value="3">3 - Neutre</option>
            <option value="4">4 - Satisfait</option>
            <option value="5">5 - Très satisfait</option>
          </select>
        </div>

        <div class="space-y-2">
          <Label for="hungerLevel">Niveau de faim (1-5)</Label>
          <select
            id="hungerLevel"
            v-model="form.hungerLevel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Non spécifié</option>
            <option value="1">1 - Pas faim du tout</option>
            <option value="2">2 - Peu de faim</option>
            <option value="3">3 - Faim modérée</option>
            <option value="4">4 - Très faim</option>
            <option value="5">5 - Affamé</option>
          </select>
        </div>
      </div>
    </div>
    <!-- Résultat de l'analyse IA -->
    <div v-if="lastAnalysis" class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <Icon name="lucide:brain" class="mr-2 h-5 w-5" />
          Analyse IA de votre repas
        </h4>

        <!-- Aliments identifiés -->
        <div v-if="lastAnalysis.identifiedFoods?.length" class="mb-4">
          <h5 class="text-sm font-medium text-blue-800 mb-2">
            Aliments identifiés :
          </h5>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="food in lastAnalysis.identifiedFoods"
              :key="food.name"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ food.name }}
              <span v-if="food.confidence" class="ml-1 text-blue-600">
                ({{ Math.round(food.confidence * 100) }}%)
              </span>
            </span>
          </div>
        </div>

        <!-- Feedback général -->
        <div v-if="lastAnalysis.feedback" class="mb-4">
          <h5 class="text-sm font-medium text-blue-800 mb-2">Feedback :</h5>
          <p class="text-sm text-blue-700">{{ lastAnalysis.feedback }}</p>
        </div>

        <!-- Suggestions -->
        <div v-if="lastAnalysis.recommendations?.length" class="mb-4">
          <h5 class="text-sm font-medium text-blue-800 mb-2">Suggestions :</h5>
          <ul class="space-y-1">
            <li
              v-for="suggestion in lastAnalysis.recommendations"
              :key="suggestion"
              class="text-sm text-blue-700 flex items-start"
            >
              <Icon
                name="lucide:lightbulb"
                class="h-3 w-3 mr-2 mt-1 text-blue-500 flex-shrink-0"
              />
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <!-- Score nutritionnel estimé -->
        <div
          v-if="lastAnalysis.nutritionalAnalysis?.healthScore"
          class="flex items-center justify-between bg-white rounded-lg p-3"
        >
          <span class="text-sm font-medium text-gray-700"
            >Score nutritionnel estimé :</span
          >
          <div class="flex items-center space-x-2">
            <div class="flex">
              <Icon
                v-for="i in 10"
                :key="i"
                name="lucide:star"
                :class="
                  i <= lastAnalysis.nutritionalAnalysis.healthScore
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                "
                class="h-4 w-4"
              />
            </div>
            <span class="text-sm text-gray-600"
              >{{ lastAnalysis.nutritionalAnalysis.healthScore }}/10</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- État de traitement -->
    <div v-if="progressInfo" class="text-center py-8">
      <Icon
        name="lucide:loader-2"
        class="h-8 w-8 mx-auto text-blue-500 animate-spin mb-4"
      />
      <h4 class="text-lg font-medium text-gray-900 mb-2">
        {{ progressInfo.message }}
      </h4>
      <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progressInfo.percentage}%` }"
        ></div>
      </div>
      <p class="text-gray-600">
        {{ Math.round(progressInfo.percentage) }}% terminé
      </p>
    </div>

    <!-- Boutons d'action -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <Button type="button" @click="$emit('cancel')" variant="outline">
        Annuler
      </Button>

      <Button
        v-if="selectedImage && !isProcessing"
        @click="analyzeImage"
        :disabled="!form.mealType || !form.mealTime"
        class="bg-purple-600 hover:bg-purple-700"
      >
        <Icon name="lucide:brain" class="mr-2 h-4 w-4" />
        Analyser la photo
      </Button>
      <Button
        v-if="lastAnalysis"
        @click="savePhotoMeal"
        :disabled="isSaving"
        class="bg-green-600 hover:bg-green-700"
      >
        <Icon
          v-if="isSaving"
          name="lucide:loader-2"
          class="mr-2 h-4 w-4 animate-spin"
        />
        <Icon v-else name="lucide:save" class="mr-2 h-4 w-4" />
        {{ isSaving ? "Enregistrement..." : "Enregistrer le repas" }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Imports des types
interface ProcessedImage {
  originalFile: File;
  processedBlob: Blob;
  processedDataUrl: string;
  originalDataUrl: string;
  metadata: {
    fileName: string;
    fileSize: number;
    dimensions: { width: number; height: number };
    format: string;
    timestamp: string;
    isCompressed: boolean;
  };
}

interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  uploadedAt: string;
  metadata: Record<string, any>;
}

interface MealAnalysis {
  identifiedFoods: Array<{
    name: string;
    confidence: number;
    category: string;
    nutritionalInfo?: {
      calories?: number;
      proteins?: number;
      carbs?: number;
      fats?: number;
    };
  }>;
  nutritionalAnalysis: {
    totalCalories: number;
    macronutrients: {
      proteins: number;
      carbohydrates: number;
      fats: number;
    };
    foodGroups: { [key: string]: number };
    healthScore: number;
  };
  recommendations: string[];
  feedback: string;
  confidence: number;
  processingTime: number;
}

// Imports des composables
const {
  validateImageFile,
  processImage,
  cleanupUrls,
  isProcessing: isImageProcessing,
  processingProgress,
} = useImageProcessing();

const { uploadImage, isUploading, uploadProgress, uploadError } =
  useImageUpload();

const {
  analyzeImage: analyzeWithAI,
  isAnalyzing,
  analysisProgress,
  lastAnalysis,
  analysisError,
} = useGoogleVisionAI();

const { saveMealWithPhoto } = useMeals();
const { showToast } = useToast();

interface SelectedImage {
  file: File;
  preview: string;
  name: string;
  size: number;
  processed?: ProcessedImage;
}

interface PhotoMealForm {
  mealType: string;
  mealTime: string;
  notes: string;
  satisfaction?: number;
  hungerLevel?: number;
}

// Props et émissions
const emit = defineEmits<{
  mealSaved: [
    data: {
      meal: any;
      recommendations: any[];
      aiAnalysis: any;
    }
  ];
  cancel: [];
}>();

// Refs
const fileInput = ref<HTMLInputElement>();
const galleryInput = ref<HTMLInputElement>();

// État réactif
const selectedImage = ref<SelectedImage | null>(null);
const isSaving = ref(false);
const currentStep = ref<"select" | "process" | "analyze" | "save">("select");

const form = ref<PhotoMealForm>({
  mealType: "",
  mealTime: new Date().toISOString().slice(0, 16),
  notes: "",
  satisfaction: undefined,
  hungerLevel: undefined,
});

// État global de traitement
const isProcessing = computed(
  () =>
    isImageProcessing.value ||
    isUploading.value ||
    isAnalyzing.value ||
    isSaving.value
);

const progressInfo = computed(() => {
  if (isImageProcessing.value) {
    return {
      percentage: processingProgress.value,
      message: "Traitement de l'image...",
    };
  }
  if (isUploading.value && uploadProgress.value) {
    return {
      percentage: uploadProgress.value.percentage,
      message: uploadProgress.value.message,
    };
  }
  if (isAnalyzing.value) {
    return {
      percentage: analysisProgress.value,
      message: "Analyse IA en cours...",
    };
  }
  if (isSaving.value) {
    return {
      percentage: 90,
      message: "Sauvegarde...",
    };
  }
  return null;
});

// Méthodes
const captureFromCamera = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const selectFromGallery = () => {
  if (galleryInput.value) {
    galleryInput.value.click();
  }
};

const handleFileSelection = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // Validation du fichier
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      showToast({
        title: validation.error || "Fichier invalide",
        variant: "error",
      });
      return;
    }

    try {
      currentStep.value = "process";

      // Traitement de l'image
      const processedImage = await processImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        format: "jpeg",
      });

      selectedImage.value = {
        file,
        preview: processedImage.processedDataUrl,
        name: processedImage.metadata.fileName,
        size: processedImage.metadata.fileSize,
        processed: processedImage,
      };

      currentStep.value = "select";
      showToast({ title: "Image traitée avec succès", variant: "success" });
    } catch (error) {
      console.error("Erreur traitement image:", error);
      showToast({
        title: "Erreur lors du traitement de l'image",
        variant: "error",
      });
      currentStep.value = "select";
    }
  }

  // Reset input
  target.value = "";
};

const clearImage = () => {
  if (selectedImage.value) {
    // Nettoyer les URLs blob
    cleanupUrls(selectedImage.value.preview);
    if (selectedImage.value.processed) {
      cleanupUrls(
        selectedImage.value.processed.processedDataUrl,
        selectedImage.value.processed.originalDataUrl
      );
    }
  }

  selectedImage.value = null;
  currentStep.value = "select";
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const analyzeImage = async () => {
  if (!selectedImage.value?.processed || !form.value.mealType) return;

  try {
    currentStep.value = "analyze";

    // Analyser l'image avec l'IA
    await analyzeWithAI(selectedImage.value.processed.processedBlob);

    showToast({ title: "Analyse terminée avec succès", variant: "success" });
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
    showToast({ title: "Erreur lors de l'analyse IA", variant: "error" });
  }
};

const savePhotoMeal = async () => {
  if (!selectedImage.value?.processed || !lastAnalysis.value) return;

  isSaving.value = true;
  currentStep.value = "save";

  try {
    // Sauvegarder le repas photo avec l'IA directement via le composable
    const result = await saveMealWithPhoto(
      selectedImage.value.processed.processedBlob,
      form.value.mealType,
      form.value.mealTime,
      form.value.notes,
      form.value.satisfaction,
      form.value.hungerLevel
    );

    if (result.error) {
      showToast({ title: "Erreur lors de la sauvegarde", variant: "error" });
      return;
    }

    showToast({
      title: "Repas photo sauvegardé avec succès",
      variant: "success",
    });

    if (result.recommendations && result.recommendations.length > 0) {
      showToast({
        title: `${result.recommendations.length} nouvelles recommandations générées`,
        variant: "warning",
      });
    } // Émettre l'événement de réussite
    emit("mealSaved", {
      meal: result.data,
      recommendations: result.recommendations || [],
      aiAnalysis: (result as any).aiAnalysis || null,
    }); // Reset du formulaire
    clearImage();
    form.value = {
      mealType: "",
      mealTime: new Date().toISOString().slice(0, 16),
      notes: "",
      satisfaction: undefined,
      hungerLevel: undefined,
    };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    showToast({ title: "Erreur lors de la sauvegarde", variant: "error" });
  } finally {
    isSaving.value = false;
    currentStep.value = "select";
  }
};

// Cleanup
onUnmounted(() => {
  if (selectedImage.value) {
    clearImage();
  }
});
</script>
