<template>
  <div class="space-y-4">
    <!-- En-tête avec filtres et actions -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h3 class="text-lg font-semibold text-gray-900">
        Recommandations IA
      </h3>

      <div class="flex items-center space-x-3">
        <!-- Métriques et insights -->
        <Button @click="showInsight = true" class="bg-sky-500">
          <Icon name="lucide:brain" class="h-4 w-4 mr-2" />
          Insights IA personnalisés
        </Button>
        <Dialog v-model:open="showInsight">
          <DialogContent class="min-w-2xl max-h-[90dvh] overflow-auto p-5">
            <RecommendationMetrics :recommendations="recommendations" :meals="meals" />
          </DialogContent>
        </Dialog>

        <!-- Filtre par catégorie -->
        <select v-model="filterCategory"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
          <option value="">Toutes les catégories</option>
          <option value="nutrition">Nutrition</option>
          <option value="variety">Variété</option>
          <option value="portion">Portions</option>
          <option value="timing">Horaires</option>
        </select>

        <!-- Filtre par priorité -->
        <select v-model="filterPriority"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
          <option value="">Toutes les priorités</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Faible</option>
        </select>

        <!-- Toggle pour montrer seulement les non lues -->
        <label class="flex items-center space-x-2">
          <input v-model="showUnreadOnly" type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm text-gray-700">Non lues uniquement</span>
        </label>
      </div>
    </div>

    <!-- Indicateurs de statut -->
    <div v-if="recommendations.length > 0"
      class="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
      <div class="flex items-center space-x-4">
        <span>{{ filteredRecommendations.length }} recommandation(s)
          affichée(s)</span>
        <span>{{ unreadCount }} non lue(s)</span>
        <span>{{ bookmarkedCount }} enregistrée(s)</span>
      </div>
      <Button v-if="unreadCount > 0" @click="markAllAsRead" variant="outline" size="sm" :disabled="isActionLoading">
        <Icon name="lucide:check-circle-2" class="h-4 w-4 mr-1" />
        Tout marquer comme lu
      </Button>
    </div>

    <!-- Liste des recommandations -->
    <div v-if="filteredRecommendations.length > 0" class="space-y-3">
      <RecommendationCard v-for="recommendation in filteredRecommendations" :key="recommendation.id"
        v-model:isActionLoading="isActionLoading" :recommendation="recommendation" @mark-as-read="loadRecommendations()"
        @toggle-bookmark="loadRecommendations()" @provide-feedback="loadRecommendations()" />
    </div>

    <!-- État vide -->
    <div v-else class="text-center py-12">
      <Icon name="lucide:lightbulb" class="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ getEmptyStateTitle() }}
      </h3>
      <p class="text-gray-600 mb-4">
        {{ getEmptyStateDescription() }}
      </p>
      <Button v-if="recommendations.length === 0" @click="$emit('generate-recommendations')"
        :disabled="isActionLoading">
        <Icon name="lucide:sparkles" class="h-4 w-4 mr-2" />
        Générer des recommandations
      </Button>
    </div>
    <!-- Loading overlay -->
    <div v-if="isActionLoading" class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
        <Icon name="lucide:loader-2" class="h-5 w-5 animate-spin text-blue-600" />
        <span class="text-gray-700">Traitement en cours...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealData, MealRecommendation } from "@/types/models";
import RecommendationMetrics from "@/components/health/RecommendationMetrics.vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import RecommendationCard from "./RecommendationCard.vue";

// Props
interface Props {
  recommendations: MealRecommendation[];
  meals: MealData[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "generate-recommendations": [];
}>();

// Composables
const {
  loadRecommendations,
  markRecommendationAsRead,
} = useRecommendationEngine();
const { showToast } = useToast();

// État réactif
const showInsight = ref(false);
const filterCategory = ref("");
const filterPriority = ref("");
const showUnreadOnly = ref(false);
const isActionLoading = ref(false);

// Computed
const filteredRecommendations = computed(() => {
  let filtered = [...props.recommendations];

  if (filterCategory.value) {
    filtered = filtered.filter((rec) => rec.category === filterCategory.value);
  }

  if (filterPriority.value) {
    filtered = filtered.filter((rec) => rec.priority === filterPriority.value);
  }

  if (showUnreadOnly.value) {
    filtered = filtered.filter((rec) => !rec.is_read);
  }

  // Trier par priorité puis par date
  return filtered.sort((a, b) => {
    // D'abord par statut non lu
    if (a.is_read !== b.is_read) {
      return a.is_read ? 1 : -1;
    }

    // Puis par priorité
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority =
      priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority =
      priorityOrder[b.priority as keyof typeof priorityOrder] || 0;

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    // Enfin par date
    return (
      new Date(b.created_at || "").getTime() -
      new Date(a.created_at || "").getTime()
    );
  });
});

const unreadCount = computed(
  () => props.recommendations.filter((r) => !r.is_read).length
);
const bookmarkedCount = computed(
  () => props.recommendations.filter((r) => r.is_bookmarked).length
);

// Méthodes
const getEmptyStateTitle = () => {
  if (filterCategory.value || filterPriority.value || showUnreadOnly.value) {
    return "Aucune recommandation correspondante";
  }
  return "Aucune recommandation disponible";
};

const getEmptyStateDescription = () => {
  if (filterCategory.value || filterPriority.value || showUnreadOnly.value) {
    return "Modifiez vos filtres pour voir plus de recommandations.";
  }
  return "Enregistrez quelques repas pour recevoir des recommandations personnalisées.";
};

const markAllAsRead = async () => {
  try {
    isActionLoading.value = true;
    const unreadRecommendations = props.recommendations.filter(
      (r) => !r.is_read
    );

    for (const recommendation of unreadRecommendations) {
      if (recommendation.id) {
        await markRecommendationAsRead(recommendation.id);
      }
    }

    showToast({
      title: "Succès",
      description: `${unreadRecommendations.length} recommandation(s) marquée(s) comme lues`,
      variant: "success",
    });

    loadRecommendations();
  } catch (error: any) {
    console.error("Erreur lors du marquage global:", error);
    showToast({
      title: "Erreur",
      description: error.message || "Impossible de marquer toutes comme lues",
      variant: "error",
    });
  } finally {
    isActionLoading.value = false;
  }
};
</script>
