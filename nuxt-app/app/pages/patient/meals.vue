<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- En-tête -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Journal Alimentaire
            </h1>
            <p class="text-gray-600 mt-1">
              Suivez vos repas et obtenez des recommandations personnalisées
            </p>
          </div>
          <div class="flex gap-3">
            <Button
              @click="showAddMealDialog = true"
              class="bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
              Ajouter un repas
            </Button>
            <Button
              @click="showPhotoDialog = true"
              variant="outline"
              class="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Icon name="lucide:camera" class="mr-2 h-4 w-4" />
              Photo de repas
            </Button>
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Repas aujourd'hui</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats.todayCount }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="lucide:utensils" class="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Cette semaine</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats.weekCount }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <Icon
                name="lucide:calendar-days"
                class="h-4 w-4 text-green-600"
              />
            </div>
          </div>
        </Card>

        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Photos analysées</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats.analyzedPhotosCount }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="lucide:image" class="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Recommandations</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ recommendations.length }}
              </p>
            </div>
            <div
              class="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="lucide:lightbulb" class="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Onglets -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              <Icon :name="tab.icon" class="mr-2 h-4 w-4 inline" />
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Onglet Journal des repas -->
          <div v-if="activeTab === 'meals'" class="space-y-4">
            <MealsList
              :meals="meals"
              @edit="editMeal"
              @delete="handleDeleteMeal"
            />
          </div>
          <!-- Onglet Recommandations -->
          <div v-if="activeTab === 'recommendations'" class="space-y-6">
            <!-- Panneau de test de développement -->
            <RecommendationTestPanel
              v-if="isDevelopment"
              :user-id="user?.id || ''"
              @recommendations-updated="loadRecommendations"
            />

            <!-- Métriques et insights -->
            <RecommendationMetrics
              :recommendations="recommendations"
              :meals="meals"
            />

            <!-- Liste des recommandations -->
            <RecommendationsList
              :recommendations="recommendations"
              @mark-as-read="handleRecommendationMarkAsRead"
              @toggle-bookmark="handleRecommendationBookmark"
              @provide-feedback="handleRecommendationFeedback"
              @mark-all-as-read="handleMarkAllAsRead"
              @generate-recommendations="handleGenerateRecommendations"
            />
          </div>

          <!-- Onglet Analyse -->
          <div v-if="activeTab === 'analysis'" class="space-y-4">
            <MealsAnalysis :meals="meals" />
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog d'ajout de repas manuel -->
    <Dialog v-model:open="showAddMealDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un repas</DialogTitle>
          <DialogDescription>
            Enregistrez manuellement les détails de votre repas
          </DialogDescription>
        </DialogHeader>
        <ManualMealForm
          @save="handleMealSave"
          @cancel="showAddMealDialog = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Dialog de photo de repas -->
    <Dialog v-model:open="showPhotoDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Analyser une photo de repas</DialogTitle>
          <DialogDescription>
            Prenez ou téléchargez une photo de votre repas pour une analyse
            automatique
          </DialogDescription>
        </DialogHeader>
        <PhotoMealForm
          @mealSaved="handlePhotoMealSaved"
          @cancel="showPhotoDialog = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "role"],
  requiredRole: "patient",
  layout: "dashboard",
});

// Imports des composables
const {
  meals,
  recommendations,
  isLoading,
  error,
  loadMeals,
  saveMealWithRecommendations,
  saveMealWithPhoto,
  updateMeal,
  deleteMeal,
  loadRecommendations,
  getMealStats,
  getPersonalizedRecommendations,
} = useMeals();

const { user } = useSupabaseUser();
const { showToast } = useToast();

// Configuration pour l'environnement de développement
const isDevelopment = process.env.NODE_ENV === "development";

// État réactif
const showAddMealDialog = ref(false);
const showPhotoDialog = ref(false);
const activeTab = ref("meals");

// Statistiques calculées
const stats = computed(() => getMealStats.value);

// Configuration des onglets
const tabs = [
  { id: "meals", name: "Journal des repas", icon: "lucide:utensils" },
  { id: "recommendations", name: "Recommandations", icon: "lucide:lightbulb" },
  { id: "analysis", name: "Analyse", icon: "lucide:bar-chart-3" },
];

// Méthodes
const handleMealSave = async (mealData: any) => {
  try {
    const {
      data,
      error: saveError,
      recommendations: newRecommendations,
    } = await saveMealWithRecommendations({
      type: mealData.mealType,
      datetime: mealData.mealTime,
      foods: mealData.foods,
      notes: mealData.notes,
      satisfaction: mealData.satisfaction,
      hunger_level: mealData.hungerLevel,
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
      showToast({
        title: `${newRecommendations.length} nouvelles recommandations générées`,
        variant: "warning",
      });
    }

    showAddMealDialog.value = false;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    showToast({
      title: "Erreur lors de la sauvegarde",
      variant: "error",
    });
  }
};

const handlePhotoMealSaved = async (data: any) => {
  try {
    showToast({
      title: "Repas photo enregistré avec succès",
      variant: "success",
    });

    if (data.recommendations && data.recommendations.length > 0) {
      showToast({
        title: `${data.recommendations.length} nouvelles recommandations générées`,
        variant: "warning",
      });
    }

    if (data.aiAnalysis) {
      showToast({
        title: "Analyse IA terminée",
        description: "Votre repas a été analysé automatiquement",
        variant: "success",
      });
    }

    showPhotoDialog.value = false;

    // Recharger les données
    await Promise.all([loadMeals(), loadRecommendations()]);
  } catch (error) {
    console.error("Erreur lors du traitement post-sauvegarde:", error);
  }
};

const handlePhotoMealSave = async (photoData: any) => {
  try {
    const result = await saveMealWithPhoto(
      photoData.image.processed.processedBlob,
      photoData.form.mealType,
      photoData.form.mealTime,
      photoData.form.notes,
      photoData.form.satisfaction,
      photoData.form.hungerLevel
    );

    if (result.error) {
      showToast({
        title: "Erreur lors de la sauvegarde",
        variant: "error",
      });
      return;
    }

    showToast({
      title: "Repas photo enregistré avec succès",
      variant: "success",
    });

    if (result.recommendations && result.recommendations.length > 0) {
      showToast({
        title: `${result.recommendations.length} nouvelles recommandations générées`,
        variant: "warning",
      });
    }
    if (result.data && "aiAnalysis" in result) {
      showToast({
        title: "Analyse IA terminée",
        description: `Confiance: ${Math.round(
          ((result as any).aiConfidence || 0) * 100
        )}%`,
        variant: "success",
      });
    }

    showPhotoDialog.value = false;
  } catch (error) {
    console.error("Erreur lors de l'analyse de la photo:", error);
    showToast({
      title: "Erreur lors de l'analyse de la photo",
      variant: "error",
    });
  }
};

const editMeal = async (meal: any) => {
  try {
    console.log("Édition du repas:", meal);
    showToast({
      title: "Fonctionnalité à venir",
      description: "L'édition des repas sera bientôt disponible",
      variant: "warning",
    });
  } catch (error) {
    console.error("Erreur lors de l'édition:", error);
  }
};

const handleDeleteMeal = async (mealId: string) => {
  try {
    const { error: deleteError } = await deleteMeal(mealId);

    if (deleteError) {
      showToast({
        title: "Erreur lors de la suppression",
        variant: "error",
      });
      return;
    }

    showToast({
      title: "Repas supprimé avec succès",
      variant: "success",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    showToast({
      title: "Erreur lors de la suppression",
      variant: "error",
    });
  }
};

// Gestionnaires pour les recommandations
const handleRecommendationMarkAsRead = async (recommendationId: string) => {
  // La méthode dans le composable met déjà à jour l'état réactif
  await loadRecommendations(); // Optionnel: recharger pour garantir la synchronisation
};

const handleRecommendationBookmark = async (recommendationId: string) => {
  // La méthode dans le composable met déjà à jour l'état réactif
  await loadRecommendations(); // Optionnel: recharger pour garantir la synchronisation
};

const handleRecommendationFeedback = async (
  recommendationId: string,
  feedback: string
) => {
  // La méthode dans le composable met déjà à jour l'état réactif
  await loadRecommendations(); // Optionnel: recharger pour garantir la synchronisation
};

const handleMarkAllAsRead = async () => {
  // Recharger les recommandations après avoir tout marqué comme lu
  await loadRecommendations();
};

const handleGenerateRecommendations = async () => {
  try {
    if (meals.value.length === 0) {
      // Si aucun repas n'existe, créer des recommandations de test via l'API
      const testRecommendations = [
        {
          category: "nutrition",
          title: "Augmenter votre consommation de légumes",
          description:
            "Essayez d'inclure au moins 3 portions de légumes par jour. Les légumes colorés apportent des antioxydants essentiels pour votre santé.",
          priority: "high",
        },
        {
          category: "portion",
          title: "Contrôler les portions de féculents",
          description:
            "Une portion de féculents devrait équivaloir à la taille de votre poing fermé. Cela vous aidera à maintenir un bon équilibre énergétique.",
          priority: "medium",
        },
        {
          category: "variety",
          title: "Varier vos sources de protéines",
          description:
            "Alternez entre protéines animales et végétales. Les légumineuses, poissons et volailles offrent des profils nutritionnels complémentaires.",
          priority: "medium",
        },
        {
          category: "timing",
          title: "Respecter les horaires de repas",
          description:
            "Essayez de manger à heures régulières pour maintenir un bon métabolisme. Un petit-déjeuner équilibré est particulièrement important.",
          priority: "low",
        },
      ]; // Créer les recommandations via l'API
      const supabase = useSupabase();
      const { data, error: insertError } = await supabase
        .from("meal_recommendations")
        .insert(
          testRecommendations.map((rec) => ({
            user_id: user.value?.id,
            category: rec.category,
            title: rec.title,
            description: rec.description,
            priority: rec.priority,
            is_read: false,
            is_bookmarked: false,
          }))
        );

      if (insertError) {
        throw insertError;
      }

      await loadRecommendations(); // Recharger les recommandations

      showToast({
        title: "Recommandations de démonstration générées",
        description: `${testRecommendations.length} recommandations créées`,
        variant: "success",
      });
      return;
    }

    // Si des repas existent, générer des recommandations personnalisées
    const newRecommendations = getPersonalizedRecommendations();

    await loadRecommendations(); // Recharger les recommandations

    showToast({
      title: "Recommandations générées",
      description: `${newRecommendations.length} nouvelles recommandations créées`,
      variant: "success",
    });
  } catch (error) {
    console.error("Erreur lors de la génération des recommandations:", error);
    showToast({
      title: "Erreur",
      description: "Impossible de générer les recommandations",
      variant: "error",
    });
  }
};

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([loadMeals(), loadRecommendations()]);
  } catch (error) {
    console.error("Erreur lors du chargement initial:", error);
    showToast({
      title: "Erreur lors du chargement des données",
      variant: "error",
    });
  }
});
</script>
