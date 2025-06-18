<template>
  <Card class="p-4 border-yellow-200 bg-yellow-50">
    <div class="flex items-start space-x-3">
      <Icon name="lucide:book-check" class="h-5 w-5 text-yellow-600 mt-0.5" />
      <div class="flex-1">
        <h4 class="font-medium text-yellow-900 mb-2">
          Tests de l'interface de recommandations
        </h4>

        <div class="space-y-3">
          <!-- Tests basiques -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              @click="testBasicRecommendations"
              size="sm"
              variant="outline"
            >
              <Icon name="lucide:check" class="h-3 w-3 mr-1" />
              Créer recommandations test
            </Button>

            <Button @click="testMetricsCalculation" size="sm" variant="outline">
              <Icon name="lucide:bar-chart-3" class="h-3 w-3 mr-1" />
              Tester métriques
            </Button>

            <Button @click="testFeedbackFlow" size="sm" variant="outline">
              <Icon name="lucide:thumbs-up" class="h-3 w-3 mr-1" />
              Tester feedback
            </Button>
          </div>

          <!-- Résultats des tests -->
          <div v-if="testResults.length > 0" class="space-y-2">
            <h5 class="font-medium text-yellow-900">Résultats :</h5>
            <div class="space-y-1">
              <div
                v-for="result in testResults"
                :key="result.test"
                class="flex items-center space-x-2 text-sm"
              >
                <Icon
                  :name="
                    result.success ? 'lucide:check-circle-2' : 'lucide:x-circle'
                  "
                  :class="result.success ? 'text-green-500' : 'text-red-500'"
                  class="h-4 w-4"
                />
                <span
                  :class="result.success ? 'text-green-700' : 'text-red-700'"
                >
                  {{ result.test }}: {{ result.message }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions de nettoyage -->
          <div class="pt-3 border-t border-yellow-200">
            <Button @click="cleanupTestData" size="sm" variant="destructive">
              <Icon name="lucide:trash-2" class="h-3 w-3 mr-1" />
              Nettoyer les données de test
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  generateTestRecommendations,
  validateRecommendationData,
} from "@/utils/test-meal-recommendations";

// Props
interface Props {
  userId: string;
}

const props = defineProps<Props>();

// Composables
const { showToast } = useToast();
const supabaseClient = useSupabaseClient();

// État
const testResults = ref<
  Array<{
    test: string;
    success: boolean;
    message: string;
  }>
>([]);

// Fonctions de test
const testBasicRecommendations = async () => {
  try {
    const testRecs = generateTestRecommendations(props.userId);

    // Valider chaque recommandation
    const validationResults = testRecs.map((rec) =>
      validateRecommendationData(rec)
    );
    const allValid = validationResults.every((v) => v);

    if (!allValid) {
      addTestResult(
        "Validation des données",
        false,
        "Format de données invalide"
      );
      return;
    }

    // Insérer en base de données
    const { error } = await supabaseClient
      .from("meal_recommendations")
      .insert(testRecs);

    if (error) {
      addTestResult("Insertion en base", false, error.message);
      return;
    }

    addTestResult(
      "Création recommandations test",
      true,
      `${testRecs.length} recommandations créées`
    );

    showToast({
      title: "Recommandations de test créées",
      description: `${testRecs.length} recommandations ajoutées`,
      variant: "success",
    });

    // Émettre un événement pour recharger les données
    emit("recommendationsUpdated");
  } catch (error) {
    addTestResult(
      "Création recommandations test",
      false,
      (error as Error).message
    );
    console.error(
      "Erreur lors de la création des recommandations de test:",
      error
    );
  }
};

const testMetricsCalculation = async () => {
  try {
    // Récupérer les recommandations existantes
    const { data: recommendations, error } = await supabaseClient
      .from("meal_recommendations")
      .select("*")
      .eq("user_id", props.userId);

    if (error) {
      addTestResult("Calcul métriques", false, error.message);
      return;
    }

    if (!recommendations || recommendations.length === 0) {
      addTestResult("Calcul métriques", false, "Aucune recommandation trouvée");
      return;
    }

    // Calculer les métriques de base
    const totalCount = recommendations.length;
    const readCount = recommendations.filter((r) => r.is_read).length;
    const bookmarkedCount = recommendations.filter(
      (r) => r.is_bookmarked
    ).length;
    const feedbackCount = recommendations.filter((r) => r.feedback).length;

    const readRate = totalCount > 0 ? (readCount / totalCount) * 100 : 0;
    const engagementRate =
      totalCount > 0 ? (feedbackCount / totalCount) * 100 : 0;

    addTestResult(
      "Calcul métriques",
      true,
      `Total: ${totalCount}, Lues: ${readCount}, Bookmarks: ${bookmarkedCount}, Taux lecture: ${readRate.toFixed(
        1
      )}%`
    );

    showToast({
      title: "Métriques calculées",
      description: `Taux de lecture: ${readRate.toFixed(
        1
      )}%, Engagement: ${engagementRate.toFixed(1)}%`,
      variant: "success",
    });
  } catch (error) {
    addTestResult("Calcul métriques", false, (error as Error).message);
    console.error("Erreur lors du calcul des métriques:", error);
  }
};

const testFeedbackFlow = async () => {
  try {
    // Récupérer une recommandation non lue
    const { data: recommendations, error: fetchError } = await supabaseClient
      .from("meal_recommendations")
      .select("*")
      .eq("user_id", props.userId)
      .eq("is_read", false)
      .limit(1);

    if (fetchError) {
      addTestResult("Test feedback", false, fetchError.message);
      return;
    }

    if (!recommendations || recommendations.length === 0) {
      addTestResult(
        "Test feedback",
        false,
        "Aucune recommandation non lue trouvée"
      );
      return;
    }

    const recommendation = recommendations[0];

    // Test: marquer comme lu
    const { error: readError } = await supabaseClient
      .from("meal_recommendations")
      .update({ is_read: true })
      .eq("id", recommendation.id);

    if (readError) {
      addTestResult("Test feedback - lecture", false, readError.message);
      return;
    }

    // Test: ajouter un feedback
    const { error: feedbackError } = await supabaseClient
      .from("meal_recommendations")
      .update({ feedback: "helpful" })
      .eq("id", recommendation.id);

    if (feedbackError) {
      addTestResult("Test feedback - notation", false, feedbackError.message);
      return;
    }

    // Test: bookmarker
    const { error: bookmarkError } = await supabaseClient
      .from("meal_recommendations")
      .update({ is_bookmarked: true })
      .eq("id", recommendation.id);

    if (bookmarkError) {
      addTestResult("Test feedback - bookmark", false, bookmarkError.message);
      return;
    }

    addTestResult(
      "Test feedback complet",
      true,
      "Lecture, notation et bookmark OK"
    );

    showToast({
      title: "Test de feedback réussi",
      description: "Toutes les interactions fonctionnent correctement",
      variant: "success",
    });

    emit("recommendationsUpdated");
  } catch (error) {
    addTestResult("Test feedback", false, (error as Error).message);
    console.error("Erreur lors du test de feedback:", error);
  }
};

const cleanupTestData = async () => {
  try {
    // Supprimer les recommandations de test (créées dans les dernières heures)
    const cutoffTime = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(); // 24h ago

    const { error } = await supabaseClient
      .from("meal_recommendations")
      .delete()
      .eq("user_id", props.userId)
      .gte("created_at", cutoffTime);

    if (error) {
      addTestResult("Nettoyage", false, error.message);
      return;
    }

    addTestResult("Nettoyage", true, "Données de test supprimées");
    testResults.value = []; // Clear test results

    showToast({
      title: "Nettoyage terminé",
      description: "Les données de test ont été supprimées",
      variant: "success",
    });

    emit("recommendationsUpdated");
  } catch (error) {
    addTestResult("Nettoyage", false, (error as Error).message);
    console.error("Erreur lors du nettoyage:", error);
  }
};

// Utilitaires
const addTestResult = (test: string, success: boolean, message: string) => {
  testResults.value.push({ test, success, message });
};

// Émissions
const emit = defineEmits<{
  recommendationsUpdated: [];
}>();
</script>
