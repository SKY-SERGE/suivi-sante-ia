<template>
  <div class="space-y-4">
    <!-- Filtres -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div class="flex items-center space-x-3">
        <select
          v-model="filterType"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tous les repas</option>
          <option value="petit-dejeuner">Petit-déjeuner</option>
          <option value="dejeuner">Déjeuner</option>
          <option value="diner">Dîner</option>
          <option value="collation">Collation</option>
        </select>

        <select
          v-model="filterPeriod"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
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
      <Card
        v-for="meal in filteredMeals"
        :key="meal.id"
        class="p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- En-tête du repas -->
            <div class="flex items-center space-x-3 mb-3">
              <div class="flex items-center space-x-2">
                <div
                  :class="getMealTypeIcon(meal.type).color"
                  class="p-2 rounded-lg"
                >
                  <Icon
                    :name="getMealTypeIcon(meal.type).icon"
                    class="h-4 w-4"
                  />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">
                    {{ getMealTypeName(meal.type) }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ formatDateTime(meal.datetime) }}
                  </p>
                </div>
              </div>

              <!-- Badge photo -->
              <div
                v-if="meal.photo_url"
                class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                <Icon name="lucide:camera" class="h-3 w-3 inline mr-1" />
                Photo analysée
              </div>
            </div>

            <!-- Aliments -->
            <div class="mb-3">
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                Aliments consommés :
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="food in meal.foods"
                  :key="food.name"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ food.name }}
                  <span v-if="food.quantity" class="ml-1 text-blue-600">
                    ({{ food.quantity }}{{ food.unit }})
                  </span>
                </span>
              </div>
            </div>

            <!-- Satisfaction et faim -->
            <div
              v-if="meal.satisfaction || meal.hunger_level"
              class="flex items-center space-x-4 mb-3"
            >
              <div v-if="meal.satisfaction" class="flex items-center space-x-1">
                <span class="text-sm text-gray-600">Satisfaction :</span>
                <span class="text-sm">{{
                  getSatisfactionEmoji(meal.satisfaction)
                }}</span>
              </div>
              <div v-if="meal.hunger_level" class="flex items-center space-x-1">
                <span class="text-sm text-gray-600">Faim :</span>
                <span class="text-sm font-medium"
                  >{{ meal.hunger_level }}/5</span
                >
              </div>
            </div>

            <!-- Notes -->
            <div v-if="meal.notes" class="mb-3">
              <p class="text-sm text-gray-700 italic">{{ meal.notes }}</p>
            </div>

            <!-- Analyse IA -->
            <div
              v-if="meal.ai_analysis"
              class="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <h4
                class="text-sm font-medium text-green-800 mb-2 flex items-center"
              >
                <Icon name="lucide:brain" class="h-4 w-4 mr-2" />
                Analyse IA
              </h4>
              <p class="text-sm text-green-700">{{ meal.ai_analysis }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2 ml-4">
            <Button
              @click="$emit('edit', meal)"
              variant="outline"
              size="sm"
              class="text-gray-600 hover:text-gray-900"
            >
              <Icon name="lucide:edit-2" class="h-4 w-4" />
            </Button>
            <Button
              @click="confirmDelete(meal)"
              variant="outline"
              size="sm"
              class="text-red-600 hover:text-red-900 border-red-300 hover:bg-red-50"
            >
              <Icon name="lucide:trash-2" class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- État vide -->
    <div v-else class="text-center py-12">
      <Icon
        name="lucide:utensils"
        class="h-12 w-12 mx-auto text-gray-400 mb-4"
      />
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
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FoodItem {
  name: string;
  quantity?: string;
  unit?: string;
}

interface Meal {
  id: string;
  type: string;
  datetime: string;
  foods: FoodItem[];
  notes?: string;
  satisfaction?: number;
  hunger_level?: number;
  photo_url?: string;
  ai_analysis?: string;
  created_at: string;
}

// Props
interface Props {
  meals: Meal[];
}

const props = defineProps<Props>();

// Émissions
defineEmits<{
  edit: [meal: Meal];
  delete: [mealId: string];
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

// Méthodes
const getMealTypeName = (type: string) => {
  const types: Record<string, string> = {
    "petit-dejeuner": "Petit-déjeuner",
    dejeuner: "Déjeuner",
    diner: "Dîner",
    collation: "Collation",
  };
  return types[type] || type;
};

const getMealTypeIcon = (type: string) => {
  const icons: Record<string, { icon: string; color: string }> = {
    "petit-dejeuner": {
      icon: "lucide:coffee",
      color: "bg-orange-100 text-orange-600",
    },
    dejeuner: { icon: "lucide:sun", color: "bg-yellow-100 text-yellow-600" },
    diner: { icon: "lucide:moon", color: "bg-indigo-100 text-indigo-600" },
    collation: { icon: "lucide:apple", color: "bg-green-100 text-green-600" },
  };
  return (
    icons[type] || {
      icon: "lucide:utensils",
      color: "bg-gray-100 text-gray-600",
    }
  );
};

const getSatisfactionEmoji = (satisfaction: number) => {
  const emojis = ["", "😞", "😐", "🙂", "😊", "😍"];
  return emojis[satisfaction] || "";
};

const formatDateTime = (datetime: string) => {
  const date = new Date(datetime);
  const now = new Date();

  // Si c'est aujourd'hui, ne montrer que l'heure
  if (date.toDateString() === now.toDateString()) {
    return `Aujourd'hui à ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Si c'est hier
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Hier à ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Sinon, date complète
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const confirmDelete = (meal: Meal) => {
  if (
    confirm(
      `Êtes-vous sûr de vouloir supprimer ce repas (${getMealTypeName(
        meal.type
      )}) ?`
    )
  ) {
    $emit("delete", meal.id);
  }
};
</script>
