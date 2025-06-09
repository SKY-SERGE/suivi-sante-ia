<template>
  <!-- Overlay -->
  <div
    v-if="isActive"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-title"
  >
    <!-- Modal principal -->
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200"
      >
        <div>
          <h2 id="onboarding-title" class="text-xl font-semibold text-gray-900">
            {{ currentStep.title }}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Étape {{ currentStepIndex + 1 }} sur {{ steps.length }}
          </p>
        </div>
        <button
          @click="skipOnboarding"
          class="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Passer l'introduction"
        >
          <Icon name="lucide:x" class="h-5 w-5" />
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 h-1">
        <div
          class="bg-blue-600 h-1 transition-all duration-300"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <!-- Contenu -->
      <div class="p-6">
        <!-- Étape de bienvenue -->
        <div v-if="currentStep.type === 'welcome'" class="text-center">
          <div
            class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Icon name="lucide:heart" class="h-8 w-8 text-blue-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ currentStep.content.title }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ currentStep.content.description }}
          </p>
        </div>

        <!-- Étape de configuration -->
        <div v-else-if="currentStep.type === 'configuration'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ currentStep.content.title }}
          </h3>

          <!-- Questionnaire de profil -->
          <div v-if="currentStep.id === 'profile-setup'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quel est votre objectif principal ?
              </label>
              <div class="space-y-2">
                <label
                  v-for="goal in healthGoals"
                  :key="goal.id"
                  class="flex items-center"
                >
                  <input
                    type="radio"
                    :value="goal.id"
                    v-model="userPreferences.primaryGoal"
                    class="mr-3"
                  />
                  <div>
                    <div class="font-medium">{{ goal.title }}</div>
                    <div class="text-sm text-gray-600">
                      {{ goal.description }}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Configuration des notifications -->
          <div v-else-if="currentStep.id === 'notifications'" class="space-y-4">
            <div class="space-y-3">
              <label
                v-for="notif in notificationTypes"
                :key="notif.id"
                class="flex items-center justify-between"
              >
                <div>
                  <div class="font-medium">{{ notif.title }}</div>
                  <div class="text-sm text-gray-600">
                    {{ notif.description }}
                  </div>
                </div>
                <input
                  type="checkbox"
                  :checked="userPreferences.notifications[notif.id]"
                  @change="updateNotificationPreference(notif.id, $event)"
                  class="ml-3"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- Étape de tour guidé -->
        <div v-else-if="currentStep.type === 'tour'" class="space-y-4">
          <div class="flex items-start space-x-4">
            <div
              class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <Icon
                :name="currentStep.content.icon"
                class="h-6 w-6 text-blue-600"
              />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ currentStep.content.title }}
              </h3>
              <p class="text-gray-600 mb-4">
                {{ currentStep.content.description }}
              </p>
              <div v-if="currentStep.content.features" class="space-y-2">
                <div
                  v-for="feature in currentStep.content.features"
                  :key="feature"
                  class="flex items-center text-sm text-gray-700"
                >
                  <Icon
                    name="lucide:check"
                    class="h-4 w-4 text-green-600 mr-2"
                  />
                  {{ feature }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Étape de finalisation -->
        <div v-else-if="currentStep.type === 'completion'" class="text-center">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Icon name="lucide:check-circle" class="h-8 w-8 text-green-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Configuration terminée !
          </h3>
          <p class="text-gray-600 mb-6">
            Votre profil est maintenant configuré. Vous pouvez commencer à
            utiliser l'application.
          </p>

          <!-- Résumé des préférences -->
          <div class="bg-gray-50 rounded-lg p-4 text-left">
            <h4 class="font-medium text-gray-900 mb-2">
              Résumé de votre configuration :
            </h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>
                <strong>Objectif :</strong>
                {{ getGoalTitle(userPreferences.primaryGoal) }}
              </li>
              <li>
                <strong>Notifications :</strong>
                {{ getEnabledNotificationsCount() }} activées
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex items-center justify-between p-6 border-t border-gray-200"
      >
        <button
          v-if="currentStepIndex > 0"
          @click="previousStep"
          class="text-gray-600 hover:text-gray-800 font-medium"
        >
          Précédent
        </button>
        <div v-else></div>

        <div class="flex space-x-3">
          <button
            v-if="!isLastStep"
            @click="skipOnboarding"
            class="text-gray-600 hover:text-gray-800"
          >
            Passer
          </button>
          <Button
            @click="isLastStep ? completeOnboarding() : nextStep()"
            :disabled="!canProceed"
          >
            {{ isLastStep ? "Commencer" : "Suivant" }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Button } from "@/components/ui/button";

interface OnboardingStep {
  id: string;
  type: "welcome" | "configuration" | "tour" | "completion";
  title: string;
  content: any;
  validation?: () => boolean;
}

interface Props {
  userRole: "patient" | "doctor" | "admin";
  autoStart?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoStart: true,
});

const emit = defineEmits<{
  complete: [preferences: any];
  skip: [];
}>();

const { notifications } = useNotifications();

// État
const isActive = ref(false);
const currentStepIndex = ref(0);
const userPreferences = ref({
  primaryGoal: "",
  notifications: {
    healthReminders: true,
    mealSuggestions: true,
    appointments: true,
    achievements: true,
    weeklyReports: false,
  },
});

// Configuration des objectifs de santé
const healthGoals = [
  {
    id: "weight-loss",
    title: "Perdre du poids",
    description:
      "Suivre vos calories et activités pour atteindre un poids santé",
  },
  {
    id: "muscle-gain",
    title: "Prendre du muscle",
    description:
      "Optimiser votre alimentation et exercices pour la prise de masse",
  },
  {
    id: "health-maintenance",
    title: "Maintenir ma santé",
    description: "Surveiller vos indicateurs de santé et habitudes",
  },
  {
    id: "chronic-condition",
    title: "Gérer une condition chronique",
    description: "Suivi spécialisé pour diabète, hypertension, etc.",
  },
];

// Types de notifications
const notificationTypes = [
  {
    id: "healthReminders",
    title: "Rappels de santé",
    description: "Rappels pour saisir vos données quotidiennes",
  },
  {
    id: "mealSuggestions",
    title: "Suggestions de repas",
    description: "Recommandations personnalisées basées sur vos objectifs",
  },
  {
    id: "appointments",
    title: "Rendez-vous médicaux",
    description: "Rappels de vos consultations et traitements",
  },
  {
    id: "achievements",
    title: "Succès et récompenses",
    description: "Notifications quand vous atteignez vos objectifs",
  },
  {
    id: "weeklyReports",
    title: "Rapports hebdomadaires",
    description: "Résumé de votre semaine santé par email",
  },
];

// Étapes selon le rôle
const steps = computed<OnboardingStep[]>(() => {
  const commonSteps = [
    {
      id: "welcome",
      type: "welcome" as const,
      title: "Bienvenue dans votre suivi santé !",
      content: {
        title: "Prêt à transformer votre santé ?",
        description:
          "Cette application vous aide à suivre et améliorer votre bien-être au quotidien. Configurons votre profil en quelques étapes.",
      },
    },
  ];

  if (props.userRole === "patient") {
    return [
      ...commonSteps,
      {
        id: "profile-setup",
        type: "configuration" as const,
        title: "Configuration de votre profil",
        content: {
          title: "Personnalisons votre expérience",
        },
        validation: () => !!userPreferences.value.primaryGoal,
      },
      {
        id: "notifications",
        type: "configuration" as const,
        title: "Préférences de notifications",
        content: {
          title: "Restez informé selon vos préférences",
        },
      },
      {
        id: "dashboard-tour",
        type: "tour" as const,
        title: "Votre tableau de bord",
        content: {
          title: "Tableau de bord personnalisé",
          description:
            "Accédez rapidement à vos données de santé, objectifs et recommandations personnalisées.",
          icon: "lucide:layout-dashboard",
          features: [
            "Vue d'ensemble de vos métriques de santé",
            "Suivi de vos objectifs en temps réel",
            "Accès rapide aux fonctionnalités principales",
          ],
        },
      },
      {
        id: "ai-assistant",
        type: "tour" as const,
        title: "Assistant IA",
        content: {
          title: "Votre coach santé intelligent",
          description:
            "Posez vos questions sur la nutrition, l'exercice et obtenez des conseils personnalisés.",
          icon: "lucide:bot",
          features: [
            "Analyse de vos photos de repas",
            "Conseils nutritionnels personnalisés",
            "Réponses à vos questions santé",
          ],
        },
      },
      {
        id: "completion",
        type: "completion" as const,
        title: "Configuration terminée",
        content: {},
      },
    ];
  }

  return [
    ...commonSteps,
    {
      id: "completion",
      type: "completion" as const,
      title: "Configuration terminée",
      content: {},
    },
  ];
});

// Computed
const currentStep = computed(() => steps.value[currentStepIndex.value]);
const isLastStep = computed(
  () => currentStepIndex.value === steps.value.length - 1
);
const progress = computed(
  () => ((currentStepIndex.value + 1) / steps.value.length) * 100
);

const canProceed = computed(() => {
  if (currentStep.value.validation) {
    return currentStep.value.validation();
  }
  return true;
});

// Méthodes
const nextStep = () => {
  if (!canProceed.value) return;

  if (currentStepIndex.value < steps.value.length - 1) {
    currentStepIndex.value++;
  }
};

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
};

const skipOnboarding = () => {
  isActive.value = false;
  emit("skip");
};

const completeOnboarding = () => {
  isActive.value = false;
  emit("complete", userPreferences.value);

  notifications.success("Configuration terminée !", {
    message: "Votre profil a été configuré avec succès. Bienvenue !",
    autoDismiss: 4000,
  });
};

const updateNotificationPreference = (notifId: string, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  userPreferences.value.notifications[notifId] = checked;
};

const getGoalTitle = (goalId: string) => {
  return healthGoals.find((g) => g.id === goalId)?.title || "Non défini";
};

const getEnabledNotificationsCount = () => {
  return Object.values(userPreferences.value.notifications).filter(Boolean)
    .length;
};

const startOnboarding = () => {
  isActive.value = true;
  currentStepIndex.value = 0;
};

// Lifecycle
onMounted(() => {
  if (props.autoStart) {
    // Vérifier si l'onboarding a déjà été fait
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
    if (!hasCompletedOnboarding) {
      setTimeout(() => {
        startOnboarding();
      }, 1000); // Petit délai pour laisser la page se charger
    }
  }
});

// Exposition
defineExpose({
  startOnboarding,
  skipOnboarding,
});
</script>
