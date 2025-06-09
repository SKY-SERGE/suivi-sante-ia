<template>
  <div class="container mx-auto p-6">
    <!-- En-tête -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tests de sécurité</h1>
          <p class="mt-2 text-gray-600">
            Validation de la sécurité du système de messagerie patient-médecin
          </p>
        </div>
        <div class="flex gap-3">
          <Button
            @click="runTests"
            :disabled="isRunning"
            class="flex items-center gap-2"
          >
            <Icon
              :name="isRunning ? 'lucide:loader-2' : 'lucide:shield-check'"
              class="h-4 w-4"
              :class="{ 'animate-spin': isRunning }"
            />
            {{ isRunning ? "Tests en cours..." : "Lancer les tests" }}
          </Button>
          <NuxtLink to="/test-config">
            <Button variant="outline" class="flex items-center gap-2">
              <Icon name="lucide:arrow-left" class="h-4 w-4" />
              Retour aux tests
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Résumé global -->
    <Card v-if="testReport" class="mb-6">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Icon
            :name="getStatusIcon(testReport.overallStatus)"
            class="h-5 w-5"
            :class="getStatusColor(testReport.overallStatus)"
          />
          Résultats des tests de sécurité
        </CardTitle>
        <p class="text-sm text-gray-600">
          Exécutés le {{ formatDateTime(testReport.timestamp) }}
        </p>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">
              {{ testReport.summary.total }}
            </div>
            <div class="text-sm text-gray-600">Tests totaux</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">
              {{ testReport.summary.passed }}
            </div>
            <div class="text-sm text-gray-600">Réussis</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">
              {{ testReport.summary.failed }}
            </div>
            <div class="text-sm text-gray-600">Échecs</div>
          </div>
          <div class="text-center">
            <div
              class="text-2xl font-bold"
              :class="getStatusColor(testReport.overallStatus)"
            >
              {{
                Math.round(
                  (testReport.summary.passed / testReport.summary.total) * 100
                )
              }}%
            </div>
            <div class="text-sm text-gray-600">Taux de réussite</div>
          </div>
        </div>

        <div
          class="mt-4 p-4 rounded-lg"
          :class="getStatusBackground(testReport.overallStatus)"
        >
          <p
            class="font-medium"
            :class="getStatusColor(testReport.overallStatus)"
          >
            {{ getStatusMessage(testReport.overallStatus) }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Détails des tests -->
    <div v-if="testReport" class="space-y-4">
      <div
        v-for="(result, index) in testReport.results"
        :key="index"
        class="border rounded-lg"
      >
        <div class="p-4 cursor-pointer" @click="toggleTestDetails(index)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon
                :name="
                  result.passed ? 'lucide:check-circle' : 'lucide:x-circle'
                "
                class="h-5 w-5"
                :class="result.passed ? 'text-green-500' : 'text-red-500'"
              />
              <div>
                <h3 class="font-medium text-gray-900">{{ result.testName }}</h3>
                <p class="text-sm text-gray-600">{{ result.message }}</p>
              </div>
            </div>
            <Icon
              :name="
                expandedTests.has(index)
                  ? 'lucide:chevron-up'
                  : 'lucide:chevron-down'
              "
              class="h-4 w-4 text-gray-400"
            />
          </div>
        </div>

        <!-- Détails expandus -->
        <div
          v-if="expandedTests.has(index) && result.details"
          class="border-t bg-gray-50 p-4"
        >
          <h4 class="font-medium text-gray-700 mb-2">Détails du test :</h4>
          <pre class="text-xs bg-white p-3 rounded border overflow-auto">{{
            JSON.stringify(result.details, null, 2)
          }}</pre>
        </div>
      </div>
    </div>

    <!-- État initial -->
    <Card v-if="!testReport && !isRunning" class="text-center py-12">
      <CardContent>
        <Icon
          name="lucide:shield"
          class="h-16 w-16 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Tests de sécurité prêts
        </h3>
        <p class="text-gray-600 mb-6">
          Cliquez sur "Lancer les tests" pour valider la sécurité du système de
          messagerie.
        </p>
        <Button @click="runTests" class="flex items-center gap-2 mx-auto">
          <Icon name="lucide:play" class="h-4 w-4" />
          Lancer les tests de sécurité
        </Button>
      </CardContent>
    </Card>

    <!-- État de chargement -->
    <Card v-if="isRunning" class="text-center py-12">
      <CardContent>
        <Icon
          name="lucide:loader-2"
          class="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin"
        />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Tests de sécurité en cours...
        </h3>
        <p class="text-gray-600">
          Validation des mesures de sécurité en cours. Veuillez patienter.
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// Import du composable de tests de sécurité
import { useSecurityTests } from "@/composables/useSecurityTests";

// Métadonnées de la page
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

// État de l'interface
const isRunning = ref(false);
const testReport = ref<any>(null);
const expandedTests = reactive(new Set<number>());

// Composable de tests
const { runFullSecuritySuite } = useSecurityTests();
const toast = useToastStore();

/**
 * Lance tous les tests de sécurité
 */
async function runTests() {
  try {
    isRunning.value = true;
    expandedTests.clear();

    toast.info("Tests démarrés", "Exécution des tests de sécurité...");

    const report = await runFullSecuritySuite();
    testReport.value = report;

    // Notification basée sur les résultats
    if (report.overallStatus === "PASSED") {
      toast.success(
        "Tests réussis",
        "Tous les tests de sécurité ont été validés avec succès !"
      );
    } else if (report.overallStatus === "WARNING") {
      toast.warning(
        "Tests partiels",
        "Certains tests ont échoué. Vérifiez les détails."
      );
    } else {
      toast.error(
        "Tests échoués",
        "Des problèmes de sécurité ont été détectés."
      );
    }
  } catch (error) {
    console.error("Erreur lors des tests de sécurité:", error);
    toast.error(
      "Erreur de test",
      "Impossible d'exécuter les tests de sécurité"
    );
  } finally {
    isRunning.value = false;
  }
}

/**
 * Toggle l'affichage des détails d'un test
 */
function toggleTestDetails(index: number) {
  if (expandedTests.has(index)) {
    expandedTests.delete(index);
  } else {
    expandedTests.add(index);
  }
}

/**
 * Retourne l'icône appropriée pour le statut
 */
function getStatusIcon(status: string): string {
  switch (status) {
    case "PASSED":
      return "lucide:check-circle";
    case "WARNING":
      return "lucide:alert-triangle";
    case "FAILED":
      return "lucide:x-circle";
    default:
      return "lucide:help-circle";
  }
}

/**
 * Retourne la couleur appropriée pour le statut
 */
function getStatusColor(status: string): string {
  switch (status) {
    case "PASSED":
      return "text-green-600";
    case "WARNING":
      return "text-yellow-600";
    case "FAILED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

/**
 * Retourne la couleur de fond appropriée pour le statut
 */
function getStatusBackground(status: string): string {
  switch (status) {
    case "PASSED":
      return "bg-green-50 border-green-200";
    case "WARNING":
      return "bg-yellow-50 border-yellow-200";
    case "FAILED":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

/**
 * Retourne le message approprié pour le statut
 */
function getStatusMessage(status: string): string {
  switch (status) {
    case "PASSED":
      return "✅ Excellent ! Tous les tests de sécurité sont passés avec succès.";
    case "WARNING":
      return "⚠️ Attention ! Certains tests ont échoué, mais le système reste fonctionnel.";
    case "FAILED":
      return "❌ Problème ! Des vulnérabilités critiques ont été détectées.";
    default:
      return "Statut inconnu";
  }
}

/**
 * Formate une date/heure
 */
function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
