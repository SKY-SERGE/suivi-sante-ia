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

export const useHealthChatbot = () => {
  const config = useRuntimeConfig();
  const { showToast } = useToast();

  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<ChatError | null>(null);
  // Messages d'urgence détectés par mots-clés
  const emergencyKeywords = [
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
  ];

  // Mots-clés interdits pour éviter les diagnostics ou conseils médicaux personnalisés
  const prohibitedKeywords = [
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
  ];

  // Messages de consentement et acceptation des limitations
  const disclaimerAccepted = ref(false);
  const conversationCount = ref(0);
  /**
   * Détecte si le message contient des mots-clés d'urgence
   */
  const detectEmergency = (message: string): boolean => {
    const lowercaseMessage = message.toLowerCase();
    return emergencyKeywords.some((keyword) =>
      lowercaseMessage.includes(keyword.toLowerCase())
    );
  };

  /**
   * Détecte si le message demande quelque chose d'interdit
   */
  const detectProhibitedContent = (message: string): boolean => {
    const lowercaseMessage = message.toLowerCase();
    return prohibitedKeywords.some((keyword) =>
      lowercaseMessage.includes(keyword.toLowerCase())
    );
  };

  /**
   * Vérifie si l'utilisateur dépasse les limites d'utilisation raisonnables
   */
  const checkUsageLimits = (): {
    exceeded: boolean;
    warningMessage?: string;
  } => {
    const conversationsToday = conversationCount.value;

    if (conversationsToday > 20) {
      return {
        exceeded: true,
        warningMessage:
          "Vous avez atteint la limite quotidienne de conversations. Pour des questions médicales importantes, consultez un professionnel de santé.",
      };
    } else if (conversationsToday > 15) {
      return {
        exceeded: false,
        warningMessage:
          "Vous approchez de la limite quotidienne. N'oubliez pas qu'un professionnel de santé reste votre meilleure ressource.",
      };
    }

    return { exceeded: false };
  };

  /**
   * Génère un ID unique pour les messages
   */
  const generateMessageId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  /**
   * Ajoute un message à la conversation
   */ const addMessage = (
    content: string,
    role: "user" | "assistant",
    type: "text" | "warning" | "emergency" = "text",
    suggestedActions?: readonly string[],
    isVerified: boolean = false
  ) => {
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

  /**
   * Vérifie si une réponse contient des informations critiques de santé
   */
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

  /**
   * Analyse la pertinence d'une réponse
   */
  const analyzeResponseQuality = (
    userMessage: string,
    response: string
  ): {
    relevance: "high" | "medium" | "low";
    containsDisclaimers: boolean;
    appropriateLength: boolean;
  } => {
    // Vérification des disclaimers
    const disclaimerKeywords = [
      "consulter",
      "médecin",
      "professionnel",
      "avis médical",
    ];
    const containsDisclaimers = disclaimerKeywords.some((keyword) =>
      response.toLowerCase().includes(keyword)
    );

    // Vérification de la longueur (ni trop court ni trop long)
    const wordCount = response.split(" ").length;
    const appropriateLength = wordCount >= 20 && wordCount <= 300;

    // Analyse simple de pertinence (peut être améliorée)
    const userWords = userMessage.toLowerCase().split(" ");
    const responseWords = response.toLowerCase().split(" ");
    const commonWords = userWords.filter(
      (word) => responseWords.includes(word) && word.length > 3
    );

    let relevance: "high" | "medium" | "low" = "low";
    if (commonWords.length >= 3) relevance = "high";
    else if (commonWords.length >= 1) relevance = "medium";

    return {
      relevance,
      containsDisclaimers,
      appropriateLength,
    };
  };

  /**
   * Détecte si une réponse contient du contenu potentiellement inapproprié
   */
  const detectInappropriateContent = (
    response: string
  ): {
    isInappropriate: boolean;
    reason?: string;
  } => {
    // Mots-clés indiquant des conseils médicaux directs (interdits)
    const forbiddenMedicalAdvice = [
      "vous avez",
      "vous souffrez de",
      "prenez ce médicament",
      "votre diagnostic est",
      "arrêtez votre traitement",
      "augmentez la dose",
    ];

    // Mots-clés indiquant des conseils dangereux
    const dangerousAdvice = [
      "ne consultez pas",
      "inutile de voir un médecin",
      "ce n'est rien",
      "ignorez ces symptômes",
      "auto-médication",
    ];

    const lowerResponse = response.toLowerCase();

    // Vérifier les conseils médicaux directs
    for (const advice of forbiddenMedicalAdvice) {
      if (lowerResponse.includes(advice)) {
        return {
          isInappropriate: true,
          reason: "Conseil médical direct non autorisé",
        };
      }
    }

    // Vérifier les conseils dangereux
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
  /**
   * Envoie un message au chatbot et reçoit une réponse
   */
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
    }

    // Ajouter le message de l'utilisateur
    addMessage(userMessage, "user");
    conversationCount.value++;

    isLoading.value = true;
    error.value = null;

    try {
      // Vérifier s'il s'agit d'une urgence
      const isEmergency = detectEmergency(userMessage);
      if (isEmergency) {
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
      } // Construire le prompt complet avec l'historique
      const conversationHistory = messages.value.slice(-6); // Garde les 6 derniers messages pour le contexte

      // Appeler l'API serveur pour la génération de réponse
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
          conversationHistory: conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
      });

      if (!apiResponse.success) {
        throw new Error(
          apiResponse.error || "Erreur lors de la génération de réponse"
        );
      }
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

      // Log de qualité pour débogage (peut être supprimé en production)
      console.log("Qualité de la réponse:", quality);

      // Gestion du contenu inapproprié
      if (inappropriateCheck.isInappropriate) {
        console.warn("Contenu inapproprié détecté:", inappropriateCheck.reason);

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
      }

      // Afficher un avertissement si la réponse ne contient pas de disclaimers appropriés
      if (isCritical && !quality.containsDisclaimers) {
        showToast({
          title: "Information importante",
          description:
            "Cette réponse concerne votre santé. Consultez toujours un professionnel pour des conseils personnalisés.",
          variant: "warning",
        });
      }

      // Vérification du contenu inapproprié
      const { isInappropriate, reason } = detectInappropriateContent(
        response.message
      );
      if (isInappropriate) {
        showToast({
          title: "Contenu inapproprié détecté",
          description: `La réponse contient du contenu inapproprié : ${reason}`,
          variant: "error",
        });
        return null;
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
    } catch (err: any) {
      console.error("Erreur lors de l'envoi du message:", err);
      const errorResponse =
        "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants. En cas de problème médical urgent, contactez votre médecin ou les services d'urgence.";
      const errorActions = [
        "Réessayer plus tard",
        "Contacter un professionnel",
      ];

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
    } finally {
      isLoading.value = false;
    }
  };
  /**
   * Efface la conversation
   */
  const clearConversation = () => {
    messages.value = [];
    error.value = null;
    conversationCount.value = 0;
    initializeChatbot();
  };

  /**
   * Accepte le disclaimer et débloque le chatbot
   */
  const acceptDisclaimer = () => {
    disclaimerAccepted.value = true;
    // Sauvegarder le consentement en local storage
    if (process.client) {
      localStorage.setItem("health-chatbot-disclaimer-accepted", "true");
    }
  };

  /**
   * Vérifie si le disclaimer a été accepté
   */
  const checkDisclaimerAcceptance = (): boolean => {
    if (process.client) {
      const accepted = localStorage.getItem(
        "health-chatbot-disclaimer-accepted"
      );
      disclaimerAccepted.value = accepted === "true";
    }
    return disclaimerAccepted.value;
  };

  /**
   * Force l'affichage du disclaimer (pour les reset ou nouvelles sessions)
   */
  const resetDisclaimerAcceptance = () => {
    disclaimerAccepted.value = false;
    if (process.client) {
      localStorage.removeItem("health-chatbot-disclaimer-accepted");
    }
  };

  /**
   * Initialise le chatbot avec un message de bienvenue
   */
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

  return {
    // État
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    error: readonly(error),
    disclaimerAccepted: readonly(disclaimerAccepted),
    conversationCount: readonly(conversationCount),

    // Actions
    sendMessage,
    clearConversation,
    initializeChatbot,
    acceptDisclaimer,
    checkDisclaimerAcceptance,
    resetDisclaimerAcceptance,

    // Utilitaires
    addMessage,
    detectEmergency,
    detectProhibitedContent,
    verifyCriticalHealthInfo,
    analyzeResponseQuality,
    checkUsageLimits,
  };
};
