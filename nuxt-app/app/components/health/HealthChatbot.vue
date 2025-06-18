<template>
  <div class="flex flex-col h-full max-h-[80vh] bg-white rounded-lg shadow-lg">
    <!-- Modal de disclaimer -->
    <HealthDisclaimerModal
      :is-open="showDisclaimerModal"
      @update:open="showDisclaimerModal = $event"
      @accepted="handleDisclaimerAccepted"
    />

    <!-- En-tête du chatbot -->
    <div
      class="flex items-center justify-between p-4 bg-blue-50 rounded-t-lg border-b"
    >
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <Icon name="lucide:bot" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">Assistant Santé IA</h3>
          <p class="text-sm text-gray-600">
            Informations générales sur la santé
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <Button
          @click="showDisclaimerModal = true"
          variant="ghost"
          size="sm"
          class="text-gray-500 hover:text-gray-700"
          title="Voir les limitations et disclaimers"
        >
          <Icon name="lucide:info" class="w-4 h-4" />
        </Button>
        <Button
          @click="clearConversation"
          variant="ghost"
          size="sm"
          class="text-gray-500 hover:text-gray-700"
          title="Nouvelle conversation"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Zone de conversation -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] p-3 rounded-lg"
          :class="getMessageClasses(message)"
        >
          <!-- Avatar pour l'assistant -->
          <div
            v-if="message.role === 'assistant'"
            class="flex items-start space-x-2"
          >
            <div
              class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
            >
              <Icon name="lucide:bot" class="w-4 h-4 text-white" />
            </div>
            <div class="flex-1">
              <div
                class="prose prose-sm max-w-none"
                v-html="formatMessageContent(message.content)"
              />
              <div class="text-xs text-gray-500 mt-1">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Message utilisateur -->
          <div v-else>
            <div class="text-white">
              {{ message.content }}
            </div>
            <div class="text-xs text-blue-100 mt-1 text-right">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
          <!-- Indicateur d'urgence -->
          <div
            v-if="message.type === 'emergency'"
            class="mt-2 p-2 bg-red-100 border border-red-200 rounded flex items-center space-x-2"
          >
            <Icon name="lucide:alert-triangle" class="w-4 h-4 text-red-600" />
            <span class="text-xs text-red-800 font-medium"
              >Message d'urgence</span
            >
          </div>

          <!-- Indicateur d'avertissement -->
          <div
            v-if="message.type === 'warning'"
            class="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded flex items-center space-x-2"
          >
            <Icon name="lucide:alert-circle" class="w-4 h-4 text-yellow-600" />
            <span class="text-xs text-yellow-800 font-medium"
              >Conseil important</span
            >
          </div>

          <!-- Indicateur de vérification -->
          <div
            v-if="message.isVerified && message.role === 'assistant'"
            class="mt-2 p-2 bg-green-100 border border-green-200 rounded flex items-center space-x-2"
          >
            <Icon name="lucide:shield-check" class="w-4 h-4 text-green-600" />
            <span class="text-xs text-green-800 font-medium"
              >Information vérifiée</span
            >
          </div>

          <!-- Actions suggérées -->
          <div
            v-if="
              message.suggestedActions && message.suggestedActions.length > 0
            "
            class="mt-3 space-y-2"
          >
            <p class="text-xs text-gray-600 font-medium">Actions suggérées :</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="action in message.suggestedActions"
                :key="action"
                @click="handleSuggestedAction(action, message.type)"
                :variant="
                  message.type === 'emergency' ? 'destructive' : 'outline'
                "
                size="sm"
                class="text-xs"
              >
                <Icon
                  :name="getSuggestedActionIcon(action)"
                  class="w-3 h-3 mr-1"
                />
                {{ action }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Indicateur de frappe -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-100 p-3 rounded-lg flex items-center space-x-2">
          <div
            class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <Icon name="lucide:bot" class="w-4 h-4 text-white" />
          </div>
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 0.1s"
            ></div>
            <div
              class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 0.2s"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Disclaimer permanent -->
    <div
      class="px-4 py-2 bg-yellow-50 border-t border-yellow-200"
      data-testid="permanent-disclaimer"
    >
      <div class="flex items-start space-x-2">
        <Icon
          name="lucide:info"
          class="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0"
        />
        <p class="text-xs text-yellow-800">
          <strong>Important :</strong> Ce chatbot fournit des informations
          générales et ne remplace pas un avis médical professionnel. Consultez
          toujours votre médecin pour des conseils personnalisés.
        </p>
      </div>
    </div>

    <!-- Zone de saisie -->
    <div class="p-4 border-t bg-gray-50 rounded-b-lg">
      <form @submit.prevent="handleSubmit" class="flex space-x-2">
        <Textarea
          v-model="currentMessage"
          placeholder="Posez votre question sur la santé..."
          class="flex-1 min-h-[44px] max-h-32 resize-none"
          :disabled="isLoading"
          @keydown.enter.exact.prevent="handleSubmit"
          @keydown.enter.shift="() => {}"
          rows="1"
        />
        <Button
          type="submit"
          :disabled="!currentMessage.trim() || isLoading"
          class="self-end"
        >
          <Icon
            :name="isLoading ? 'lucide:loader-2' : 'lucide:send'"
            :class="['w-4 h-4', isLoading && 'animate-spin']"
          />
        </Button>
      </form>

      <!-- Suggestions rapides -->
      <div v-if="messages.length === 1" class="mt-3">
        <p class="text-xs text-gray-600 mb-2">Suggestions :</p>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="suggestion in quickSuggestions"
            :key="suggestion"
            @click="selectSuggestion(suggestion)"
            variant="outline"
            size="sm"
            class="text-xs"
          >
            {{ suggestion }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from "~/composables/useHealthChatbot";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const {
  messages,
  isLoading,
  error,
  disclaimerAccepted,
  sendMessage,
  clearConversation,
  initializeChatbot,
  checkDisclaimerAcceptance,
  acceptDisclaimer,
} = useHealthChatbot();

const currentMessage = ref("");
const messagesContainer = ref<HTMLElement>();
const showDisclaimerModal = ref(false);

// Vérifier au démarrage si le disclaimer a été accepté
onMounted(() => {
  const hasAcceptedDisclaimer = checkDisclaimerAcceptance();
  if (!hasAcceptedDisclaimer) {
    showDisclaimerModal.value = true;
  }
  initializeChatbot();
});

// Gestion de l'acceptation du disclaimer
const handleDisclaimerAccepted = () => {
  acceptDisclaimer();
  showDisclaimerModal.value = false;
};

// Suggestions rapides pour commencer la conversation
const quickSuggestions = [
  "Comment améliorer mon sommeil ?",
  "Conseils pour une alimentation équilibrée",
  "Prévention des maladies cardiovasculaires",
  "Bienfaits de l'exercice physique",
  "Gestion du stress au quotidien",
];

/**
 * Gère l'envoi de message
 */
const handleSubmit = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return;

  // Vérifier que le disclaimer a été accepté
  if (!disclaimerAccepted.value) {
    showDisclaimerModal.value = true;
    return;
  }

  const message = currentMessage.value.trim();
  currentMessage.value = "";

  await sendMessage(message);

  // Scroll vers le bas après l'envoi
  nextTick(() => {
    scrollToBottom();
  });
};

/**
 * Sélectionne une suggestion rapide
 */
const selectSuggestion = (suggestion: string) => {
  // Vérifier que le disclaimer a été accepté
  if (!disclaimerAccepted.value) {
    showDisclaimerModal.value = true;
    return;
  }

  currentMessage.value = suggestion;
  handleSubmit();
};

/**
 * Scroll automatique vers le bas
 */
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

/**
 * Formate le contenu du message (supports markdown basique)
 */
const formatMessageContent = (content: string): string => {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>")
    .replace(/•/g, "&bull;");
};

/**
 * Formate l'heure du message
 */
const formatTime = (timestamp: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
};

/**
 * Retourne les classes CSS pour un message
 */
const getMessageClasses = (message: ChatMessage): string => {
  const baseClasses = "shadow-sm";

  if (message.role === "user") {
    return `${baseClasses} bg-blue-500 text-white`;
  }

  switch (message.type) {
    case "emergency":
      return `${baseClasses} bg-red-50 border border-red-200 text-red-900`;
    case "warning":
      return `${baseClasses} bg-yellow-50 border border-yellow-200 text-yellow-900`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-900`;
  }
};

/**
 * Gère les actions suggérées
 */
const handleSuggestedAction = (action: string, messageType?: string) => {
  const { showToast } = useToast();

  if (action.includes("Appeler") || action.includes("urgences")) {
    // Actions d'urgence - on affiche un message d'aide
    showToast({
      title: "Action d'urgence",
      description: `N'oubliez pas : ${action}`,
      variant: messageType === "emergency" ? "destructive" : "default",
    });
  } else if (
    action.includes("médecin") ||
    action.includes("professionnel") ||
    action.includes("rendez-vous")
  ) {
    // Actions de consultation - on peut rediriger vers la prise de rendez-vous
    showToast({
      title: "Consultation recommandée",
      description: "Pensez à prendre rendez-vous avec votre médecin traitant",
      variant: "default",
    });
  } else if (action.includes("En savoir plus")) {
    // Action d'information - pourrait ouvrir des ressources externes
    showToast({
      title: "Information",
      description:
        "Vous pouvez consulter des ressources fiables sur ameli.fr ou le site de l'Assurance Maladie",
      variant: "default",
    });
  } else {
    // Action générique
    showToast({
      title: action,
      description: "Action notée",
      variant: "default",
    });
  }
};

/**
 * Retourne l'icône appropriée pour une action suggérée
 */
const getSuggestedActionIcon = (action: string): string => {
  if (
    action.includes("Appeler") ||
    action.includes("112") ||
    action.includes("15")
  ) {
    return "lucide:phone";
  } else if (action.includes("urgences")) {
    return "lucide:ambulance";
  } else if (action.includes("médecin") || action.includes("professionnel")) {
    return "lucide:stethoscope";
  } else if (action.includes("rendez-vous")) {
    return "lucide:calendar";
  } else if (
    action.includes("En savoir plus") ||
    action.includes("plus tard")
  ) {
    return "lucide:info";
  } else {
    return "lucide:arrow-right";
  }
};

// Observer les changements de messages pour auto-scroll
watch(
  messages,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  },
  { deep: true }
);
</script>

<style scoped>
/* Style pour les messages avec scroll personnalisé */
.prose {
  color: inherit;
}

.prose strong {
  color: inherit;
}

.prose em {
  color: inherit;
}

/* Animation pour l'indicateur de frappe */
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-0.25rem);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
