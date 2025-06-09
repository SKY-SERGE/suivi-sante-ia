<template>
  <div class="space-y-4">
    <!-- En-tête avec filtres et actions -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h3 class="text-lg font-semibold text-gray-900">Recommandations IA</h3>

      <div class="flex items-center space-x-3">
        <!-- Filtre par catégorie -->
        <select
          v-model="filterCategory"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Toutes les catégories</option>
          <option value="nutrition">Nutrition</option>
          <option value="variety">Variété</option>
          <option value="portion">Portions</option>
          <option value="timing">Horaires</option>
        </select>

        <!-- Filtre par priorité -->
        <select
          v-model="filterPriority"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Toutes les priorités</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Faible</option>
        </select>

        <!-- Toggle pour montrer seulement les non lues -->
        <label class="flex items-center space-x-2">
          <input
            v-model="showUnreadOnly"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">Non lues uniquement</span>
        </label>
      </div>
    </div>

    <!-- Indicateurs de statut -->
    <div
      v-if="recommendations.length > 0"
      class="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
    >
      <div class="flex items-center space-x-4">
        <span
          >{{ filteredRecommendations.length }} recommandation(s)
          affichée(s)</span
        >
        <span>{{ unreadCount }} non lue(s)</span>
        <span>{{ bookmarkedCount }} enregistrée(s)</span>
      </div>
      <Button
        v-if="unreadCount > 0"
        @click="markAllAsRead"
        variant="outline"
        size="sm"
        :disabled="isActionLoading"
      >
        <Icon name="lucide:check-circle-2" class="h-4 w-4 mr-1" />
        Tout marquer comme lu
      </Button>
    </div>

    <!-- Liste des recommandations -->
    <div v-if="filteredRecommendations.length > 0" class="space-y-3">
      <Card
        v-for="recommendation in filteredRecommendations"
        :key="recommendation.id"
        :class="[
          'p-4 transition-all duration-200 hover:shadow-md',
          !recommendation.is_read
            ? 'border-l-4 border-l-blue-500 bg-blue-50/30'
            : '',
          recommendation.is_bookmarked ? 'ring-1 ring-yellow-200' : '',
        ]"
      >
        <div class="flex items-start space-x-4">
          <!-- Icône de catégorie -->
          <div
            :class="getCategoryStyle(recommendation.category).color"
            class="p-2 rounded-lg flex-shrink-0"
          >
            <Icon
              :name="getCategoryStyle(recommendation.category).icon"
              class="h-5 w-5"
            />
          </div>

          <div class="flex-1">
            <!-- En-tête -->
            <div class="flex items-start justify-between mb-2">
              <div>
                <h4 class="font-medium text-gray-900 flex items-center">
                  {{ recommendation.title }}
                  <Icon
                    v-if="!recommendation.is_read"
                    name="lucide:circle"
                    class="h-2 w-2 ml-2 text-blue-500 fill-current"
                  />
                </h4>
                <div class="flex items-center space-x-2 mt-1">
                  <span
                    :class="getCategoryStyle(recommendation.category).badge"
                    class="text-xs font-medium px-2 py-1 rounded-full"
                  >
                    {{ getCategoryName(recommendation.category) }}
                  </span>
                  <span
                    :class="getPriorityStyle(recommendation.priority)"
                    class="text-xs font-medium px-2 py-1 rounded-full"
                  >
                    {{ getPriorityText(recommendation.priority) }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(recommendation.created_at) }}
                  </span>
                </div>
              </div>
              <!-- Bouton bookmark -->
              <Button
                @click="toggleBookmark(recommendation.id!)"
                variant="ghost"
                size="sm"
                :disabled="isActionLoading"
              >
                <Icon
                  name="lucide:bookmark"
                  :class="
                    recommendation.is_bookmarked
                      ? 'fill-current text-yellow-500'
                      : 'text-gray-400'
                  "
                  class="h-4 w-4"
                />
              </Button>
            </div>

            <!-- Contenu de la recommandation -->
            <p class="text-gray-700 mb-3 leading-relaxed">
              {{ recommendation.description }}
            </p>

            <!-- Actions et feedback -->
            <div
              class="flex items-center justify-between pt-3 border-t border-gray-200"
            >
              <div class="flex items-center space-x-2">
                <Button
                  @click="markAsRead(recommendation.id!)"
                  :variant="recommendation.is_read ? 'outline' : 'default'"
                  size="sm"
                  :disabled="isActionLoading"
                >
                  <Icon
                    :name="
                      recommendation.is_read
                        ? 'lucide:check-circle-2'
                        : 'lucide:circle'
                    "
                    class="h-3 w-3 mr-1"
                  />
                  {{ recommendation.is_read ? "Lu" : "Marquer comme lu" }}
                </Button>
              </div>
              <div class="flex items-center space-x-2">
                <Button
                  @click="provideFeedback(recommendation.id!, 'very_helpful')"
                  :variant="
                    recommendation.feedback === 'very_helpful'
                      ? 'default'
                      : 'outline'
                  "
                  size="sm"
                  class="text-xs"
                  :disabled="isActionLoading"
                >
                  <Icon name="lucide:heart" class="h-3 w-3 mr-1" />
                  Très utile
                </Button>
                <Button
                  @click="provideFeedback(recommendation.id!, 'helpful')"
                  :variant="
                    recommendation.feedback === 'helpful'
                      ? 'default'
                      : 'outline'
                  "
                  size="sm"
                  class="text-xs"
                  :disabled="isActionLoading"
                >
                  <Icon name="lucide:thumbs-up" class="h-3 w-3 mr-1" />
                  Utile
                </Button>
                <Button
                  @click="provideFeedback(recommendation.id!, 'not_helpful')"
                  :variant="
                    recommendation.feedback === 'not_helpful'
                      ? 'default'
                      : 'outline'
                  "
                  size="sm"
                  class="text-xs"
                  :disabled="isActionLoading"
                >
                  <Icon name="lucide:thumbs-down" class="h-3 w-3 mr-1" />
                  Pas utile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- État vide -->
    <div v-else class="text-center py-12">
      <Icon
        name="lucide:lightbulb"
        class="h-12 w-12 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ getEmptyStateTitle() }}
      </h3>
      <p class="text-gray-600 mb-4">
        {{ getEmptyStateDescription() }}
      </p>
      <Button
        v-if="recommendations.length === 0"
        @click="$emit('generate-recommendations')"
        :disabled="isActionLoading"
      >
        <Icon name="lucide:sparkles" class="h-4 w-4 mr-2" />
        Générer des recommandations
      </Button>
    </div>
    <!-- Loading overlay -->
    <div
      v-if="isActionLoading"
      class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
    >
      <div
        class="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3"
      >
        <Icon
          name="lucide:loader-2"
          class="h-5 w-5 animate-spin text-blue-600"
        />
        <span class="text-gray-700">Traitement en cours...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealRecommendation } from "@/composables/useMeals";

// Props
interface Props {
  recommendations: MealRecommendation[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "mark-as-read": [id: string];
  "toggle-bookmark": [id: string];
  "provide-feedback": [
    id: string,
    feedback: "helpful" | "not_helpful" | "very_helpful"
  ];
  "mark-all-as-read": [];
  "generate-recommendations": [];
}>();

// Composables
const {
  markRecommendationAsRead,
  toggleRecommendationBookmark,
  giveFeedbackOnRecommendation,
} = useMeals();
const { showToast } = useToast();

// État réactif
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
const getCategoryName = (category: string) => {
  const categories: Record<string, string> = {
    nutrition: "Nutrition",
    variety: "Variété",
    portion: "Portions",
    timing: "Horaires",
  };
  return categories[category] || category;
};

const getCategoryStyle = (category: string) => {
  const styles: Record<string, { icon: string; color: string; badge: string }> =
    {
      nutrition: {
        icon: "lucide:apple",
        color: "bg-green-100 text-green-600",
        badge: "bg-green-100 text-green-800",
      },
      variety: {
        icon: "lucide:palette",
        color: "bg-pink-100 text-pink-600",
        badge: "bg-pink-100 text-pink-800",
      },
      portion: {
        icon: "lucide:scales",
        color: "bg-purple-100 text-purple-600",
        badge: "bg-purple-100 text-purple-800",
      },
      timing: {
        icon: "lucide:clock",
        color: "bg-orange-100 text-orange-600",
        badge: "bg-orange-100 text-orange-800",
      },
    };
  return (
    styles[category] || {
      icon: "lucide:lightbulb",
      color: "bg-gray-100 text-gray-600",
      badge: "bg-gray-100 text-gray-800",
    }
  );
};

const getPriorityStyle = (priority: string) => {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-gray-100 text-gray-800",
  };
  return styles[priority] || "bg-gray-100 text-gray-800";
};

const getPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    high: "Haute",
    medium: "Moyenne",
    low: "Faible",
  };
  return texts[priority] || priority;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

const markAsRead = async (recommendationId: string) => {
  try {
    isActionLoading.value = true;
    const { error } = await markRecommendationAsRead(recommendationId);

    if (error) {
      throw error;
    }

    emit("mark-as-read", recommendationId);

    showToast({
      title: "Succès",
      description: "Recommandation marquée comme lue",
      variant: "success",
    });
  } catch (error: any) {
    console.error("Erreur lors du marquage comme lu:", error);
    showToast({
      title: "Erreur",
      description: error.message || "Impossible de marquer comme lu",
      variant: "error",
    });
  } finally {
    isActionLoading.value = false;
  }
};

const toggleBookmark = async (recommendationId: string) => {
  try {
    isActionLoading.value = true;
    const { error } = await toggleRecommendationBookmark(recommendationId);

    if (error) {
      throw error;
    }

    emit("toggle-bookmark", recommendationId);

    showToast({
      title: "Succès",
      description: "Bookmark mis à jour",
      variant: "success",
    });
  } catch (error: any) {
    console.error("Erreur lors du bookmark:", error);
    showToast({
      title: "Erreur",
      description: error.message || "Impossible de modifier le bookmark",
      variant: "error",
    });
  } finally {
    isActionLoading.value = false;
  }
};

const provideFeedback = async (
  recommendationId: string,
  feedback: "helpful" | "not_helpful" | "very_helpful"
) => {
  try {
    isActionLoading.value = true;
    const { error } = await giveFeedbackOnRecommendation(
      recommendationId,
      feedback
    );

    if (error) {
      throw error;
    }

    emit("provide-feedback", recommendationId, feedback);

    showToast({
      title: "Merci pour votre retour !",
      description: "Votre feedback nous aide à améliorer nos recommandations",
      variant: "success",
    });
  } catch (error: any) {
    console.error("Erreur lors de l'envoi du feedback:", error);
    showToast({
      title: "Erreur",
      description: error.message || "Impossible d'envoyer le feedback",
      variant: "error",
    });
  } finally {
    isActionLoading.value = false;
  }
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

    emit("mark-all-as-read");

    showToast({
      title: "Succès",
      description: `${unreadRecommendations.length} recommandation(s) marquée(s) comme lues`,
      variant: "success",
    });
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
