import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getClientIP,
  checkRateLimit,
  logSecurityEvent,
} from "../../utils/security";

export default defineEventHandler(async (event) => {
  try {
    // Vérifier que c'est bien une requête POST
    if (!isMethod(event, "POST")) {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
      });
    }

    const clientIP = getClientIP(event);

    // Rate limiting pour les requêtes AI
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      logSecurityEvent(event, "RATE_LIMIT_EXCEEDED", {
        endpoint: "/api/ai/health-chat",
        remaining: rateLimitCheck.remaining,
      });

      throw createError({
        statusCode: 429,
        statusMessage: "Trop de requêtes. Veuillez réessayer plus tard.",
      });
    }

    // Validation et sanitisation des données d'entrée
    const body = await readBody(event);
    const { message, conversationHistory } = body;

    if (!message || typeof message !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "Message valide requis",
      });
    }

    // Validation de la longueur du message
    if (message.length > 5000) {
      throw createError({
        statusCode: 400,
        statusMessage: "Message trop long (maximum 5000 caractères)",
      });
    }

    // Sanitisation basique du message
    const sanitizedMessage = message.replace(/[<>]/g, "").trim();

    // Validation de l'historique de conversation
    if (
      conversationHistory &&
      (!Array.isArray(conversationHistory) || conversationHistory.length > 50)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Historique de conversation invalide",
      });
    }

    const config = useRuntimeConfig();

    // Vérifier si l'API Google est configurée
    if (!config.googleAiApiKey) {
      console.warn("Google AI API key not configured, using simulation mode");
      return simulateHealthChatResponse(sanitizedMessage);
    }

    // Log de l'utilisation de l'API AI
    logSecurityEvent(event, "AI_CHAT_REQUEST", {
      endpoint: "/api/ai/health-chat",
      messageLength: sanitizedMessage.length,
      hasHistory: !!conversationHistory,
    });

    // Initialiser Google Generative AI
    const genAI = new GoogleGenerativeAI(config.googleAiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt système avec contraintes médicales strictes
    const systemPrompt = `Tu es un assistant de santé virtuel conçu pour fournir des informations générales sur la santé. 

CONTRAINTES IMPORTANTES ET OBLIGATOIRES :
- Tu ne dois JAMAIS diagnostiquer de maladies ou conditions médicales
- Tu ne dois JAMAIS prescrire ou recommander des médicaments spécifiques
- Tu ne dois JAMAIS remplacer un avis médical professionnel
- Tu ne dois JAMAIS donner de conseils médicaux spécifiques ou personnalisés
- Tu dois toujours encourager à consulter un professionnel de santé pour des symptômes inquiétants
- En cas d'urgence, tu dois immédiatement diriger vers les services d'urgence

DÉTECTION D'URGENCE :
Si tu détectes des symptômes graves ou d'urgence (douleur intense, difficultés respiratoires, signes de crise cardiaque, saignements abondants, perte de conscience, etc.), commence ta réponse par "🚨 URGENCE DÉTECTÉE 🚨" et dirige immédiatement vers les services d'urgence.

RÔLE AUTORISÉ :
- Fournir des informations générales sur la prévention et le bien-être
- Expliquer des concepts médicaux de base de manière éducative
- Suggérer des mesures préventives générales (alimentation, exercice, hygiène)
- Rappeler l'importance du suivi médical régulier
- Donner des informations sur les habitudes de vie saines

INSTRUCTIONS DE RÉPONSE :
- Réponds en français
- Sois empathique mais professionnel
- Limite tes réponses à 200 mots maximum
- Inclus toujours une phrase rappelant de consulter un professionnel pour un avis personnalisé
- Utilise un langage simple et accessible
- Si tu ne peux pas répondre à une question médicale, explique pourquoi et redirige vers un professionnel

EXEMPLES DE RÉPONSES ACCEPTABLES :
- Informations générales sur l'hygiène de vie
- Conseils de prévention généraux
- Explications éducatives sur le fonctionnement du corps humain
- Rappels sur l'importance des consultations médicales régulières

EXEMPLES DE RÉPONSES INTERDITES :
- "Vous avez probablement..." (diagnostic)
- "Prenez ce médicament..." (prescription)
- "C'est sûrement..." (diagnostic différentiel)
- Toute interprétation de symptômes spécifiques`;

    // Construire l'historique de conversation pour le contexte
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = "\n\nHistorique de conversation récent:\n";
      conversationHistory.slice(-3).forEach((msg: any) => {
        conversationContext += `${
          msg.role === "user" ? "Utilisateur" : "Assistant"
        }: ${msg.content}\n`;
      });
    }

    // Prompt complet
    const fullPrompt = `${systemPrompt}

${conversationContext}

Question actuelle de l'utilisateur: ${message}

Réponds en respectant strictement toutes les contraintes ci-dessus.`;

    // Génération de réponse
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    // Analyser la réponse pour détecter les urgences
    const isEmergency = responseText.includes("🚨 URGENCE DÉTECTÉE 🚨");
    const containsWarning =
      responseText.toLowerCase().includes("consulter") ||
      responseText.toLowerCase().includes("médecin") ||
      responseText.toLowerCase().includes("professionnel");

    // Déterminer le type de réponse
    let responseType: "text" | "warning" | "emergency" = "text";
    if (isEmergency) {
      responseType = "emergency";
    } else if (containsWarning) {
      responseType = "warning";
    }

    // Suggérer des actions selon le type de réponse
    let suggestedActions: string[] = [];
    if (isEmergency) {
      suggestedActions = [
        "Appeler le 15 (SAMU)",
        "Appeler le 112",
        "Se rendre aux urgences",
      ];
    } else {
      suggestedActions = [
        "Consulter votre médecin",
        "Prendre rendez-vous",
        "En savoir plus",
      ];
    }

    return {
      success: true,
      message: responseText,
      type: responseType,
      requiresDisclaimer: true,
      suggestedActions,
      generationTime: Date.now(),
    };
  } catch (error: any) {
    console.error("Erreur lors de la génération de réponse de santé:", error);

    return {
      success: false,
      error: error.message || "Erreur lors de la génération de réponse",
      message:
        "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants. En cas de problème médical urgent, contactez votre médecin ou les services d'urgence.",
      type: "warning",
      requiresDisclaimer: true,
      suggestedActions: ["Réessayer plus tard", "Contacter un professionnel"],
    };
  }
});

/**
 * Simulation de réponse pour les cas où l'API Google n'est pas configurée
 */
function simulateHealthChatResponse(message: string) {
  const lowerMessage = message.toLowerCase();

  // Détection d'urgence
  const emergencyKeywords = [
    "urgence",
    "douleur intense",
    "difficultés respiratoires",
    "crise cardiaque",
    "saignement",
    "perte de conscience",
    "overdose",
    "suicide",
    "ne peux plus respirer",
  ];

  const isEmergency = emergencyKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  if (isEmergency) {
    return {
      success: true,
      message:
        "🚨 URGENCE DÉTECTÉE 🚨\n\nSi vous ressentez des symptômes graves ou si votre vie est en danger, contactez immédiatement :\n\n• Le 15 (SAMU)\n• Le 112 (numéro d'urgence européen)\n• Rendez-vous aux urgences les plus proches\n\nCe chatbot ne peut pas gérer les situations d'urgence médicale.",
      type: "emergency",
      requiresDisclaimer: true,
      suggestedActions: [
        "Appeler le 15 (SAMU)",
        "Appeler le 112",
        "Se rendre aux urgences",
      ],
    };
  }

  // Réponses simulées pour différents types de questions
  const responses = [
    {
      message:
        "Merci pour votre question sur la santé. Pour maintenir une bonne santé générale, il est important d'adopter un mode de vie équilibré incluant une alimentation variée, une activité physique régulière et un sommeil suffisant. Cependant, pour des conseils personnalisés adaptés à votre situation spécifique, je vous recommande de consulter votre médecin traitant ou un professionnel de santé qualifié.",
      type: "text" as const,
      suggestedActions: ["Consulter votre médecin", "Prendre rendez-vous"],
    },
    {
      message:
        "C'est une excellente question sur le bien-être. La prévention est effectivement un pilier important de la santé. Les recommandations générales incluent une hydratation adéquate, une alimentation riche en fruits et légumes, et la pratique régulière d'exercice physique. Pour des conseils adaptés à votre profil de santé personnel, n'hésitez pas à consulter un professionnel de santé.",
      type: "text" as const,
      suggestedActions: ["En savoir plus", "Consulter un spécialiste"],
    },
    {
      message:
        "Votre question porte sur un aspect important de la santé. Il est toujours recommandé de maintenir un dialogue ouvert avec votre équipe soignante concernant vos préoccupations de santé. Les professionnels de santé sont les mieux placés pour vous fournir des informations précises et adaptées à votre situation personnelle. N'hésitez pas à prendre rendez-vous pour discuter de vos questions.",
      type: "warning" as const,
      suggestedActions: [
        "Consulter votre médecin",
        "Poser vos questions à un professionnel",
      ],
    },
  ];

  const selectedResponse =
    responses[Math.floor(Math.random() * responses.length)];

  return {
    success: true,
    message: selectedResponse.message,
    type: selectedResponse.type,
    requiresDisclaimer: true,
    suggestedActions: selectedResponse.suggestedActions,
  };
}
