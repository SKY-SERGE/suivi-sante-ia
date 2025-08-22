import { ref, computed, readonly, onMounted } from "vue";

/**
 * Composable pour le chatbot de santé AI
 * Utilise Google Generative AI avec des prompts contraints pour des réponses sécurisées
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "warning" | "emergency";
  suggestedActions?: readonly string[];
  isVerified?: boolean; // Pour les informations critiques de santé
}

export interface ChatResponse {
  message: string;
  type: "text" | "warning" | "emergency";
  requiresDisclaimer: boolean;
  suggestedActions?: readonly string[];
}

export interface ChatError {
  code: string;
  message: string;
  shouldShowDisclaimer: boolean;
}

// Configuration et constantes
const EMERGENCY_KEYWORDS = [
  "urgence",
  "emergency",
  "douleur intense",
  "severe pain",
  "crise cardiaque",
  "heart attack",
  "difficulté à respirer",
  "trouble breathing",
  "saignement abondant",
  "heavy bleeding",
  "perte de conscience",
  "unconscious",
  "overdose",
  "suicide",
  "empoisonnement",
  "poison",
  "convulsion",
  "convulsions",
  "arrêt cardiaque",
  "cardiac arrest",
  "avc",
  "stroke",
  "fracture ouverte",
  "brûlure grave",
  "hémorragie",
  "anaphylaxie",
  "allergique sévère",
] as const;

const PROHIBITED_KEYWORDS = [
  "diagnostiquer",
  "prescrire",
  "traitement pour",
  "médicament pour",
  "dose de",
  "arrêter le traitement",
  "remplacer le médicament",
  "automédication",
  "opération chirurgicale",
  "intervention",
] as const;

const DAILY_MESSAGE_LIMIT = 50;
const WARNING_MESSAGE_LIMIT = 30;
const STRICT_CHECK = false;

export const useHealthChatbot = () => {
  const { showToast } = useToast();

  // État réactif
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<ChatError | null>(null);
  const disclaimerAccepted = ref(false);
  const conversationCount = ref(0);

  // Utilitaires
  const generateMessageId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const detectKeywords = (
    message: string,
    keywords: readonly string[]
  ): boolean => {
    const lowercaseMessage = message.toLowerCase();
    return keywords.some((keyword) =>
      lowercaseMessage.includes(keyword.toLowerCase())
    );
  };

  // Validation et sécurité
  const detectEmergency = (message: string): boolean => {
    return detectKeywords(message, EMERGENCY_KEYWORDS);
  };

  const detectProhibitedContent = (message: string): boolean => {
    return detectKeywords(message, PROHIBITED_KEYWORDS);
  };

  const checkUsageLimits = (): {
    exceeded: boolean;
    warningMessage?: string;
  } => {
    const conversationsToday = conversationCount.value;

    if (conversationsToday > DAILY_MESSAGE_LIMIT) {
      return {
        exceeded: true,
        warningMessage:
          "Vous avez atteint la limite quotidienne de conversations. Pour des questions médicales importantes, consultez un professionnel de santé.",
      };
    } else if (conversationsToday > WARNING_MESSAGE_LIMIT) {
      return {
        exceeded: false,
        warningMessage:
          "Vous approchez de la limite quotidienne. N'oubliez pas qu'un professionnel de santé reste votre meilleure ressource.",
      };
    }

    return { exceeded: false };
  };

  // Gestion des messages
  const addMessage = (
    content: string,
    role: "user" | "assistant",
    type: "text" | "warning" | "emergency" = "text",
    suggestedActions?: readonly string[],
    isVerified: boolean = false
  ): ChatMessage => {
    const message: ChatMessage = {
      id: generateMessageId(),
      content,
      role,
      timestamp: new Date(),
      type,
      suggestedActions,
      isVerified,
    };

    messages.value.push(message);
    return message;
  };

  // Analyse de la qualité des réponses
  const analyzeResponseQuality = (userMessage: string, response: string) => {
    const disclaimerKeywords = [
      "consulter",
      "médecin",
      "professionnel",
      "avis médical",
    ];
    const containsDisclaimers = disclaimerKeywords.some((keyword) =>
      response.toLowerCase().includes(keyword)
    );

    const wordCount = response.split(" ").length;
    const appropriateLength = wordCount >= 20 && wordCount <= 300;

    const userWords = userMessage.toLowerCase().split(" ");
    const responseWords = response.toLowerCase().split(" ");
    const commonWords = userWords.filter(
      (word) => responseWords.includes(word) && word.length > 3
    );

    let relevance: "high" | "medium" | "low" = "low";
    if (commonWords.length >= 3) relevance = "high";
    else if (commonWords.length >= 1) relevance = "medium";

    return { relevance, containsDisclaimers, appropriateLength };
  };

  const detectInappropriateContent = (
    response: string
  ): { isInappropriate: boolean; reason?: string } => {
    const forbiddenMedicalAdvice = [
      "vous avez",
      "vous souffrez de",
      "prenez ce médicament",
      "votre diagnostic est",
      "arrêtez votre traitement",
      "augmentez la dose",
    ];

    const dangerousAdvice = [
      "ne consultez pas",
      "inutile de voir un médecin",
      "ce n'est rien",
      "ignorez ces symptômes",
      "auto-médication",
    ];

    const lowerResponse = response.toLowerCase();

    if (STRICT_CHECK) {
      for (const advice of forbiddenMedicalAdvice) {
        if (lowerResponse.includes(advice)) {
          return {
            isInappropriate: true,
            reason: "Conseil médical direct non autorisé",
          };
        }
      }
    }

    for (const advice of dangerousAdvice) {
      if (lowerResponse.includes(advice)) {
        return {
          isInappropriate: true,
          reason: "Conseil potentiellement dangereux",
        };
      }
    }

    return { isInappropriate: false };
  };

  const verifyCriticalHealthInfo = (message: string, type: string): boolean => {
    const criticalKeywords = [
      "urgence",
      "emergency",
      "danger",
      "grave",
      "immédiat",
      "immédiatement",
      "crise",
      "attaque",
      "hémorragie",
      "convulsion",
      "arrêt",
      "syncope",
      "prescription",
      "médicament",
      "diagnostic",
      "traitement",
    ];

    const lowerMessage = message.toLowerCase();
    const hasCriticalKeywords = criticalKeywords.some((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );

    return hasCriticalKeywords || type === "emergency" || type === "warning";
  };
  // Fonction principale pour envoyer un message
  const sendMessage = async (
    userMessage: string
  ): Promise<ChatResponse | null> => {
    if (!userMessage.trim()) {
      showToast({ title: "Veuillez saisir un message", variant: "error" });
      return null;
    }

    // Vérifier les limites d'utilisation
    const usageLimits = checkUsageLimits();
    if (usageLimits.exceeded) {
      showToast({
        title: "Limite atteinte",
        description: usageLimits.warningMessage!,
        variant: "warning",
      });
      return null;
    } else if (usageLimits.warningMessage) {
      showToast({
        title: "Information",
        description: usageLimits.warningMessage,
        variant: "warning",
      });
    }

    // Vérifier le contenu interdit
    if (detectProhibitedContent(userMessage)) {
      return handleProhibitedContent(userMessage);
    }

    // Ajouter le message de l'utilisateur
    addMessage(userMessage, "user");
    conversationCount.value++;

    // Vérifier s'il s'agit d'une urgence
    if (detectEmergency(userMessage)) {
      return handleEmergency();
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Préparer l'historique de conversation
      const conversationHistory = messages.value.slice(-6).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Appel à l'API de santé
      const apiResponse = await $fetch<{
        success: boolean;
        message: string;
        type: "text" | "warning" | "emergency";
        requiresDisclaimer: boolean;
        suggestedActions?: string[];
        error?: string;
      }>("/api/ai/health-chat", {
        method: "POST",
        body: {
          message: userMessage,
          conversationHistory,
        },
      });

      if (!apiResponse.success) {
        throw new Error(
          apiResponse.error || "Erreur lors de la génération de réponse"
        );
      }

      return handleSuccessfulResponse(userMessage, apiResponse);
    } catch (err: any) {
      return handleError(err);
    } finally {
      isLoading.value = false;
    }
  };

  // Gestionnaires spécialisés
  const handleProhibitedContent = (userMessage: string): ChatResponse => {
    const prohibitedResponse =
      "Je ne peux pas fournir de conseils médicaux personnalisés, de diagnostics ou de recommandations de traitement. Ces décisions importantes doivent être prises par un professionnel de santé qualifié qui peut évaluer votre situation personnelle.";
    const prohibitedActions = [
      "Consulter votre médecin traitant",
      "Prendre rendez-vous médical",
      "Contacter un professionnel de santé",
    ];

    addMessage(userMessage, "user");
    addMessage(
      prohibitedResponse,
      "assistant",
      "warning",
      prohibitedActions,
      true
    );

    return {
      message: prohibitedResponse,
      type: "warning",
      requiresDisclaimer: true,
      suggestedActions: prohibitedActions,
    };
  };

  const handleEmergency = (): ChatResponse => {
    const emergencyResponse =
      "🚨 URGENCE DÉTECTÉE 🚨\n\nSi vous ressentez des symptômes graves ou si votre vie est en danger, contactez immédiatement :\n\n• Le 15 (SAMU)\n• Le 112 (numéro d'urgence européen)\n• Rendez-vous aux urgences les plus proches\n\nCe chatbot ne peut pas gérer les situations d'urgence médicale.";
    const emergencyActions = [
      "Appeler le 15 (SAMU)",
      "Appeler le 112",
      "Se rendre aux urgences",
    ];

    addMessage(
      emergencyResponse,
      "assistant",
      "emergency",
      emergencyActions,
      true
    );

    return {
      message: emergencyResponse,
      type: "emergency",
      requiresDisclaimer: true,
      suggestedActions: emergencyActions,
    };
  };

  const handleSuccessfulResponse = (
    userMessage: string,
    apiResponse: any
  ): ChatResponse => {
    const response: ChatResponse = {
      message: apiResponse.message,
      type: apiResponse.type,
      requiresDisclaimer: apiResponse.requiresDisclaimer,
      suggestedActions: apiResponse.suggestedActions,
    };

    // Validation et vérification de la réponse
    const quality = analyzeResponseQuality(userMessage, response.message);
    const isCritical = verifyCriticalHealthInfo(
      response.message,
      response.type
    );
    const inappropriateCheck = detectInappropriateContent(response.message);

    // Gestion du contenu inapproprié
    if (inappropriateCheck.isInappropriate) {
      console.warn("Contenu inapproprié détecté:", inappropriateCheck.reason);
      return handleInappropriateContent();
    }

    // Afficher un avertissement si nécessaire
    if (isCritical && !quality.containsDisclaimers) {
      showToast({
        title: "Information importante",
        description:
          "Cette réponse concerne votre santé. Consultez toujours un professionnel pour des conseils personnalisés.",
        variant: "warning",
      });
    }

    // Ajouter la réponse de l'assistant
    const messageType = response.type || "text";
    const isVerified =
      isCritical ||
      response.type === "emergency" ||
      response.type === "warning";
    addMessage(
      response.message,
      "assistant",
      messageType,
      response.suggestedActions,
      isVerified
    );

    return response;
  };

  const handleInappropriateContent = (): ChatResponse => {
    const safeResponse =
      "Je ne peux pas fournir de conseils médicaux directs. Pour votre sécurité, je vous recommande de consulter un professionnel de santé qualifié qui pourra évaluer votre situation personnelle.";
    const safeActions = [
      "Consulter votre médecin",
      "Contacter un professionnel",
      "Prendre rendez-vous",
    ];

    addMessage(safeResponse, "assistant", "warning", safeActions, true);

    showToast({
      title: "Réponse modifiée pour votre sécurité",
      description:
        "Le contenu a été adapté pour respecter les bonnes pratiques médicales.",
      variant: "warning",
    });

    return {
      message: safeResponse,
      type: "warning",
      requiresDisclaimer: true,
      suggestedActions: safeActions,
    };
  };

  const handleError = (err: any): ChatResponse => {
    console.error("Erreur lors de l'envoi du message:", err);
    const errorResponse =
      "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants. En cas de problème médical urgent, contactez votre médecin ou les services d'urgence.";
    const errorActions = ["Réessayer plus tard", "Contacter un professionnel"];

    addMessage(errorResponse, "assistant", "warning", errorActions, true);

    error.value = {
      code: "CHAT_ERROR",
      message: err.message || "Erreur inconnue",
      shouldShowDisclaimer: true,
    };

    showToast({
      title: "Erreur lors de la communication avec le chatbot",
      variant: "error",
    });

    return {
      message: errorResponse,
      type: "warning",
      requiresDisclaimer: true,
    };
  };
  // Gestion du disclaimer et des utilitaires
  const clearConversation = () => {
    messages.value = [];
    error.value = null;
    conversationCount.value = 0;
    initializeChatbot();
  };

  const acceptDisclaimer = () => {
    disclaimerAccepted.value = true;
    if (import.meta.client) {
      localStorage.setItem("health-chatbot-disclaimer-accepted", "true");
    }
  };

  const checkDisclaimerAcceptance = (): boolean => {
    if (import.meta.client) {
      const accepted = localStorage.getItem(
        "health-chatbot-disclaimer-accepted"
      );
      disclaimerAccepted.value = accepted === "true";
    }
    return disclaimerAccepted.value;
  };

  const resetDisclaimerAcceptance = () => {
    disclaimerAccepted.value = false;
    if (import.meta.client) {
      localStorage.removeItem("health-chatbot-disclaimer-accepted");
    }
  };

  const initializeChatbot = () => {
    if (messages.value.length === 0) {
      const welcomeMessage = `Bonjour ! Je suis votre assistant santé IA. Je peux vous fournir des **informations générales** sur la santé et le bien-être.

**Important :** 
• Je ne remplace pas un avis médical professionnel
• Consultez toujours votre médecin pour des conseils personnalisés
• En cas d'urgence, appelez le 15 ou le 112

Comment puis-je vous aider aujourd'hui ?`;

      addMessage(welcomeMessage, "assistant", "text", [], true);
    }
  };

  // Propriétés calculées
  const hasMessages = computed(() => messages.value.length > 1);
  const lastMessage = computed(() =>
    messages.value.length > 0 ? messages.value[messages.value.length - 1] : null
  );
  const userMessagesCount = computed(
    () => messages.value.filter((msg) => msg.role === "user").length
  );

  // Initialisation au montage
  onMounted(() => {
    checkDisclaimerAcceptance();
    initializeChatbot();
  });

  return {
    // État réactif (readonly pour l'extérieur)
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    error: readonly(error),
    disclaimerAccepted: readonly(disclaimerAccepted),
    conversationCount: readonly(conversationCount),

    // Propriétés calculées
    hasMessages,
    lastMessage,
    userMessagesCount,

    // Actions principales
    sendMessage,
    clearConversation,
    initializeChatbot,

    // Gestion du disclaimer
    acceptDisclaimer,
    checkDisclaimerAcceptance,
    resetDisclaimerAcceptance,

    // Utilitaires d'analyse (pour tests et debug)
    detectEmergency,
    detectProhibitedContent,
    verifyCriticalHealthInfo,
    analyzeResponseQuality,
    checkUsageLimits,
    addMessage,
  };
};
