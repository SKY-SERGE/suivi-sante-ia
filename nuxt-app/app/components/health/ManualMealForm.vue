<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <!-- Type de repas et heure -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="mealType">Type de repas *</Label>
        <select id="mealType" v-model="form.mealType"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required>
          <option value="">Sélectionnez un type</option>
          <option value="petit-dejeuner">Petit-déjeuner</option>
          <option value="dejeuner">Déjeuner</option>
          <option value="diner">Dîner</option>
          <option value="collation">Collation</option>
        </select>
      </div>

      <div class="space-y-2">
        <Label for="mealTime">Heure du repas *</Label>
        <input id="mealTime" v-model="form.mealTime" type="datetime-local"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required />
      </div>
    </div>

    <!-- Aliments -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <Label>Aliments consommés *</Label>
        <Button type="button" @click="addFoodItem" variant="outline" size="sm"
          class="text-blue-600 border-blue-300 hover:bg-blue-50">
          <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          Ajouter un aliment
        </Button>
      </div>

      <div class="space-y-3">
        <div v-for="(food, index) in form.foods" :key="index"
          class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div class="flex-1">
            <input v-model="food.name" type="text" placeholder="Nom de l'aliment (ex: Pomme, Riz basmati...)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required />
          </div>
          <div class="w-32">
            <input v-model="food.quantity" type="text" placeholder="Quantité"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div class="w-24">
            <select v-model="food.unit"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="cl">cl</option>
              <option value="l">l</option>
              <option value="unité">unité</option>
              <option value="tranche">tranche</option>
              <option value="cuillère">cuillère</option>
              <option value="bol">bol</option>
              <option value="assiette">assiette</option>
            </select>
          </div>
          <Button type="button" @click="removeFoodItem(index)" variant="outline" size="sm"
            class="text-red-600 border-red-300 hover:bg-red-50">
            <Icon name="lucide:trash-2" class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div v-if="form.foods.length === 0" class="text-center py-6 text-gray-500">
        <Icon name="lucide:utensils" class="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>Aucun aliment ajouté</p>
        <p class="text-sm">Cliquez sur "Ajouter un aliment" pour commencer</p>
      </div>
    </div>

    <!-- Photo du repas -->
    <div class="space-y-2">
      <Label>Photo du repas (optionnel)</Label>
      <MyuiPhotoUploader v-model:file="form.photo" />
    </div>

    <!-- Notes supplémentaires -->
    <div class="space-y-2">
      <Label for="notes">Notes (optionnel)</Label>
      <textarea id="notes" v-model="form.notes" rows="3"
        placeholder="Ajoutez des détails sur votre repas, comment vous vous sentiez, le contexte..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"></textarea>
    </div>

    <!-- Sentiment et satisfaction -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="satisfaction">Niveau de satisfaction</Label>
        <select id="satisfaction" v-model="form.satisfaction"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Non spécifié</option>
          <option value="1">😞 Pas satisfait</option>
          <option value="2">😐 Peu satisfait</option>
          <option value="3">🙂 Satisfait</option>
          <option value="4">😊 Très satisfait</option>
          <option value="5">😍 Excellent</option>
        </select>
      </div>

      <div class="space-y-2">
        <Label for="hunger">Niveau de faim avant le repas</Label>
        <select id="hunger" v-model="form.hungerLevel"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Non spécifié</option>
          <option value="1">Pas faim</option>
          <option value="2">Légèrement faim</option>
          <option value="3">Faim modérée</option>
          <option value="4">Très faim</option>
          <option value="5">Affamé</option>
        </select>
      </div>
    </div>

    <!-- Boutons d'action -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <Button type="button" @click="$emit('cancel')" variant="outline">
        Annuler
      </Button>
      <Button type="submit" :disabled="!isFormValid || isSubmitting" class="bg-blue-600 hover:bg-blue-700">
        <Icon v-if="isSubmitting" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
        {{ isSubmitting ? "Enregistrement..." : "Enregistrer le repas" }}
      </Button>
    </div>
  </form>

  <!-- Dialog d'ajout de repas manuel -->
  <Dialog v-model:open="showRecommendationDialog" @update:open="handleModalUpdate">
    <DialogContent class="min-w-2xl max-w-5xl max-h-[90dvh] overflow-auto">
      <DialogHeader>
        <DialogTitle>Liste des recommandations</DialogTitle>
        <DialogDescription>
          Voici les recommandations générées pour votre repas
        </DialogDescription>
      </DialogHeader>
      <div class="p-6">
        <div v-if="newGeneratedRecommendations.length > 0" class="space-y-3">
          <RecommendationCard v-for="recommendation in newGeneratedRecommendations" :key="recommendation.id"
            :recommendation="recommendation" />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import RecommendationCard from "./RecommendationCard.vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { MealRecommendation } from "~/types/models";

interface FoodItem {
  name: string;
  quantity: string;
  unit: string;
}

interface MealForm {
  mealType: string;
  mealTime: string;
  foods: FoodItem[];
  notes: string;
  satisfaction: string;
  hungerLevel: string;
  photo?: File | null;
}

// Props et émissions
const emit = defineEmits<{
  save: [data: MealForm];
  saved: [];
  cancel: [];
}>();

// Composables
const { showToast } = useToast();
const { saveMealWithRecommendations } = useMeals();

// État réactif
const isSubmitting = ref(false);
const newGeneratedRecommendations = ref<MealRecommendation[]>([]);
const showRecommendationDialog = ref(false);

const form = ref<MealForm>({
  mealType: "",
  mealTime: new Date().toISOString().slice(0, 16), // Format datetime-local
  foods: [],
  notes: "",
  satisfaction: "",
  hungerLevel: "",
  photo: null,
});

// Computed
const isFormValid = computed(() => {
  return (
    form.value.mealType &&
    form.value.mealTime &&
    form.value.foods.length > 0 &&
    form.value.foods.every((food) => food.name.trim() !== "")
  );
});

// Méthodes
const addFoodItem = () => {
  form.value.foods.push({
    name: "",
    quantity: "",
    unit: "g",
  });
};

const removeFoodItem = (index: number) => {
  form.value.foods.splice(index, 1);
};

const handleModalUpdate = (value: boolean) => {
  if (!value) {
    newGeneratedRecommendations.value = [];
    // Émettre l'événement de sauvegarde
    emit("saved");
  }
}

const submitForm = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  try {
    // Validation et nettoyage des données
    const cleanedForm = {
      ...form.value,
      foods: form.value.foods.filter((food) => food.name.trim() !== ""),
    };

    const {
      data,
      error: saveError,
      recommendations: newRecommendations,
    } = await saveMealWithRecommendations({
      type: cleanedForm.mealType,
      datetime: cleanedForm.mealTime,
      foods: cleanedForm.foods,
      notes: cleanedForm.notes,
      satisfaction: cleanedForm.satisfaction
        ? parseInt(cleanedForm.satisfaction)
        : undefined,
      hunger_level: cleanedForm.hungerLevel
        ? parseInt(cleanedForm.hungerLevel)
        : undefined,
    });

    if (saveError) {
      showToast({
        title: "Erreur lors de la sauvegarde",
        variant: "error",
      });
      return;
    }

    showToast({
      title: "Repas enregistré avec succès",
      variant: "success",
    });

    if (newRecommendations && newRecommendations.length > 0) {
      newGeneratedRecommendations.value = newRecommendations;
      showToast({
        title: `${newRecommendations.length} nouvelles recommandations générées`,
        variant: "warning",
      });
      showRecommendationDialog.value = true;
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    showToast({
      title: "Erreur lors de la sauvegarde",
      variant: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Initialisation
onMounted(() => {
  // Ajouter un premier aliment par défaut
  addFoodItem();
});
</script>
