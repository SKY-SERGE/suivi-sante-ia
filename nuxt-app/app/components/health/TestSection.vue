<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-blue-100 rounded-lg">
          <Icon :name="icon" class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <CardTitle class="text-lg">{{ title }}</CardTitle>
          <CardDescription>{{ description }}</CardDescription>
        </div>
        <div class="ml-auto">
          <Badge
            :variant="sectionStatus.variant"
            class="flex items-center space-x-1"
          >
            <Icon :name="sectionStatus.icon" class="w-3 h-3" />
            <span>{{ sectionStatus.text }}</span>
          </Badge>
        </div>
      </div>
    </CardHeader>

    <CardContent class="pt-0">
      <div class="space-y-3">
        <div
          v-for="test in tests"
          :key="test.testName"
          class="flex items-start space-x-3 p-3 rounded-lg border"
          :class="
            test.passed
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          "
        >
          <!-- Icône de statut -->
          <div class="flex-shrink-0 mt-0.5">
            <Icon
              :name="test.passed ? 'lucide:check-circle' : 'lucide:x-circle'"
              :class="[
                'w-4 h-4',
                test.passed ? 'text-green-600' : 'text-red-600',
              ]"
            />
          </div>

          <!-- Contenu du test -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <h4 class="text-sm font-medium text-gray-900">
                {{ test.testName }}
              </h4>
              <Badge
                :variant="test.passed ? 'default' : 'destructive'"
                size="sm"
                class="ml-2"
              >
                {{ test.passed ? "Réussi" : "Échoué" }}
              </Badge>
            </div>

            <p class="text-sm text-gray-600 mt-1">
              {{ test.details }}
            </p>

            <!-- Recommandation si échec -->
            <div
              v-if="test.recommendation"
              class="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded flex items-start space-x-2"
            >
              <Icon
                name="lucide:lightbulb"
                class="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0"
              />
              <span class="text-xs text-yellow-800">
                <strong>Recommandation :</strong> {{ test.recommendation }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Résumé de la section -->
      <div v-if="tests.length > 0" class="mt-4 pt-3 border-t border-gray-200">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">
            {{ passedTests }}/{{ tests.length }} tests réussis
          </span>
          <span class="font-medium" :class="sectionStatus.textColor">
            {{ Math.round(successRate) }}% de réussite
          </span>
        </div>

        <!-- Barre de progression -->
        <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-500"
            :class="
              successRate >= 80
                ? 'bg-green-500'
                : successRate >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
            "
            :style="{ width: `${successRate}%` }"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { ChatbotTestResult } from "~/utils/test-health-chatbot";

interface Props {
  title: string;
  description: string;
  tests: ChatbotTestResult[];
  icon: string;
}

const props = defineProps<Props>();

// Calculs de statut
const passedTests = computed(
  () => props.tests.filter((test) => test.passed).length
);
const successRate = computed(() => {
  if (props.tests.length === 0) return 0;
  return (passedTests.value / props.tests.length) * 100;
});

// Statut de la section
const sectionStatus = computed(() => {
  const rate = successRate.value;

  if (rate === 100) {
    return {
      variant: "default" as const,
      icon: "lucide:check-circle",
      text: "Parfait",
      textColor: "text-green-600",
    };
  } else if (rate >= 80) {
    return {
      variant: "secondary" as const,
      icon: "lucide:check",
      text: "Bon",
      textColor: "text-green-600",
    };
  } else if (rate >= 60) {
    return {
      variant: "outline" as const,
      icon: "lucide:alert-circle",
      text: "Moyen",
      textColor: "text-yellow-600",
    };
  } else {
    return {
      variant: "destructive" as const,
      icon: "lucide:x-circle",
      text: "Échec",
      textColor: "text-red-600",
    };
  }
});
</script>
