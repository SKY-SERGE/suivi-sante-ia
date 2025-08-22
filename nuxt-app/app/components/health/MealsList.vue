<template>
  <div class="space-y-4">
    <!-- Filtres -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center space-x-3">
        <select v-model="filterType"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Tous les repas</option>
          <option value="petit-dejeuner">Petit-déjeuner</option>
          <option value="dejeuner">Déjeuner</option>
          <option value="diner">Dîner</option>
          <option value="collation">Collation</option>
        </select>

        <select v-model="filterPeriod"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="all">Toute la période</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      <div class="text-sm text-gray-600">
        {{ filteredMeals.length }} repas trouvés
      </div>
    </div>

    <!-- Liste des repas -->
    <div v-if="filteredMeals.length > 0" class="space-y-3">
      <MealCard v-for="meal in filteredMeals" :key="meal.id" :meal="meal" />
    </div>

    <!-- État vide -->
    <div v-else class="text-center py-12">
      <Icon name="lucide:utensils" class="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Aucun repas enregistré
      </h3>
      <p class="text-gray-600 mb-4">
        {{
          filterType || filterPeriod !== "all"
            ? "Aucun repas ne correspond aux filtres sélectionnés."
            : "Commencez par enregistrer votre premier repas."
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealData, FoodItem } from '~/types/models';
import MealCard from "./MealCard.vue";


// Props
interface Props {
  meals: MealData[];
}

const props = defineProps<Props>();

// Émissions
const emit = defineEmits<{
  edited: [meal: Meal];
  deleted: [mealId: string];
}>();

// État réactif
const filterType = ref("");
const filterPeriod = ref("all");

// Computed
const filteredMeals = computed(() => {
  let filtered = [...props.meals];

  // Filtrer par type
  if (filterType.value) {
    filtered = filtered.filter((meal) => meal.type === filterType.value);
  }

  // Filtrer par période
  if (filterPeriod.value !== "all") {
    const now = new Date();
    filtered = filtered.filter((meal) => {
      const mealDate = new Date(meal.datetime);

      switch (filterPeriod.value) {
        case "today":
          return mealDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return mealDate >= weekAgo;
        case "month":
          const monthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          return mealDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  // Trier par date (plus récent en premier)
  return filtered.sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );
});
</script>
