<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Tests du Chatbot de Santé IA
      </h1>
      <p class="text-gray-600">
        Validation de l'intégration et des fonctionnalités selon la stratégie de
        test de la tâche 7.
      </p>
    </div>

    <!-- Score global -->
    <Card v-if="testResults" class="mb-6">
      <CardContent class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Score Global</h2>
          <Badge
            :variant="getScoreVariant(testScore.grade)"
            class="text-lg px-3 py-1"
          >
            {{ testScore.grade }} - {{ Math.round(testScore.score) }}%
          </Badge>
        </div>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-green-600">
              {{ testScore.passedTests }}
            </div>
            <div class="text-sm text-gray-600">Tests réussis</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-red-600">
              {{ testScore.totalTests - testScore.passedTests }}
            </div>
            <div class="text-sm text-gray-600">Tests échoués</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-blue-600">
              {{ testScore.totalTests }}
            </div>
            <div class="text-sm text-gray-600">Total tests</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Boutons d'action -->
    <div class="flex space-x-4 mb-6">
      <Button
        @click="runTests"
        :disabled="isRunning"
        class="flex items-center space-x-2"
      >
        <Icon
          :name="isRunning ? 'lucide:loader-2' : 'lucide:play'"
          :class="['w-4 h-4', isRunning && 'animate-spin']"
        />
        <span>{{ isRunning ? "Tests en cours..." : "Lancer les tests" }}</span>
      </Button>

      <Button
        @click="goToChatbot"
        variant="outline"
        class="flex items-center space-x-2"
      >
        <Icon name="lucide:message-circle" class="w-4 h-4" />
        <span>Ouvrir le chatbot</span>
      </Button>
    </div>

    <!-- Résultats des tests -->
    <div v-if="testResults" class="space-y-6">
      <!-- Tests d'interaction -->
      <TestSection
        title="Tests d'Interaction"
        description="Vérification de la communication de base avec le chatbot"
        :tests="testResults.interaction"
        icon="lucide:message-square"
      />

      <!-- Tests de pertinence -->
      <TestSection
        title="Tests de Pertinence"
        description="Validation de la qualité et de la pertinence des réponses"
        :tests="testResults.relevance"
        icon="lucide:target"
      />

      <!-- Tests de disclaimer -->
      <TestSection
        title="Tests de Disclaimer"
        description="Vérification de la visibilité et du contenu des avertissements"
        :tests="testResults.disclaimer"
        icon="lucide:alert-triangle"
      />

      <!-- Tests de sécurité -->
      <TestSection
        title="Tests de Sécurité"
        description="Validation des mesures de sécurité et de détection d'urgence"
        :tests="testResults.safety"
        icon="lucide:shield-check"
      />
    </div>

    <!-- État vide -->
    <Card v-else class="text-center py-12">
      <CardContent>
        <Icon
          name="lucide:flask"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Aucun test exécuté
        </h3>
        <p class="text-gray-600 mb-4">
          Lancez les tests pour valider le fonctionnement du chatbot
        </p>
        <Button @click="runTests"> Commencer les tests </Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { ChatbotTestSuite } from "~/utils/test-health-chatbot";
import {
  runFullTestSuite,
  calculateTestScore,
} from "~/utils/test-health-chatbot";

// Métadonnées de la page
definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Titre de la page
useHead({
  title: "Tests Chatbot - Suivi Santé IA",
});

// État des tests
const isRunning = ref(false);
const testResults = ref<ChatbotTestSuite | null>(null);
const testScore = computed(() => {
  if (!testResults.value)
    return { totalTests: 0, passedTests: 0, score: 0, grade: "F" as const };
  return calculateTestScore(testResults.value);
});

/**
 * Lance la suite complète de tests
 */
const runTests = async () => {
  isRunning.value = true;
  try {
    const results = await runFullTestSuite();
    testResults.value = results;

    const score = calculateTestScore(results);
    useToast().showToast({
      title: "Tests terminés",
      description: `Score: ${score.grade} (${Math.round(score.score)}%) - ${
        score.passedTests
      }/${score.totalTests} tests réussis`,
      variant:
        score.grade === "A" || score.grade === "B" ? "default" : "warning",
    });
  } catch (error) {
    useToast().showToast({
      title: "Erreur lors des tests",
      description: error instanceof Error ? error.message : "Erreur inconnue",
      variant: "destructive",
    });
  } finally {
    isRunning.value = false;
  }
};

/**
 * Navigue vers le chatbot
 */
const goToChatbot = () => {
  navigateTo("/patient/chatbot");
};

/**
 * Retourne la variante de badge selon la note
 */
const getScoreVariant = (grade: string) => {
  switch (grade) {
    case "A":
      return "default";
    case "B":
      return "secondary";
    case "C":
      return "outline";
    case "D":
      return "destructive";
    case "F":
      return "destructive";
    default:
      return "outline";
  }
};
</script>
