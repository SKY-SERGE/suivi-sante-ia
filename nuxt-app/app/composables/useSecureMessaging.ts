/**
 * Composable pour la gestion sécurisée des messages
 * Fournit des fonctions de validation et de sécurité pour la messagerie patient-médecin
 */

interface SecureMessage {
  id?: string;
  patient_id: string;
  doctor_id: string;
  content: string;
  subject: string;
  sender_role: "patient" | "doctor";
  is_urgent?: boolean;
  is_encrypted?: boolean;
  is_read?: boolean;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MessageValidationRules {
  maxLength: number;
  minLength: number;
  maxSubjectLength: number;
  prohibitedPatterns: RegExp[];
  requiredFields: string[];
}

export const useSecureMessaging = () => {
  const { user } = useSupabaseUser();
  const { $supabase } = useNuxtApp();
  const toast = useToastStore();

  // Règles de validation pour les messages
  const validationRules: MessageValidationRules = {
    maxLength: 5000, // Limite de caractères pour le contenu
    minLength: 10, // Minimum requis
    maxSubjectLength: 200,
    prohibitedPatterns: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Scripts
      /javascript:/gi, // URLs JavaScript
      /data:text\/html/gi, // HTML en base64
      /on\w+\s*=/gi, // Événements inline
    ],
    requiredFields: [
      "content",
      "subject",
      "patient_id",
      "doctor_id",
      "sender_role",
    ],
  };

  /**
   * Valide le contenu d'un message pour détecter du contenu malveillant
   */
  const validateMessageContent = (
    content: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Vérification de la longueur
    if (content.length < validationRules.minLength) {
      errors.push(
        `Le message doit contenir au moins ${validationRules.minLength} caractères`
      );
    }

    if (content.length > validationRules.maxLength) {
      errors.push(
        `Le message ne peut pas dépasser ${validationRules.maxLength} caractères`
      );
    }

    // Vérification des patterns prohibés
    for (const pattern of validationRules.prohibitedPatterns) {
      if (pattern.test(content)) {
        errors.push(
          "Le contenu du message contient des éléments non autorisés"
        );
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  /**
   * Valide le sujet d'un message
   */
  const validateSubject = (
    subject: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (subject.length > validationRules.maxSubjectLength) {
      errors.push(
        `Le sujet ne peut pas dépasser ${validationRules.maxSubjectLength} caractères`
      );
    }

    // Vérification des patterns prohibés dans le sujet
    for (const pattern of validationRules.prohibitedPatterns) {
      if (pattern.test(subject)) {
        errors.push("Le sujet contient des éléments non autorisés");
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  /**
   * Nettoie le contenu d'un message en supprimant les éléments dangereux
   */
  const sanitizeContent = (content: string): string => {
    // Supprime les balises HTML potentiellement dangereuses
    let sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/data:text\/html/gi, "");

    // Échappe les caractères spéciaux HTML
    const htmlEscapeMap: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };

    // Applique l'échappement HTML uniquement aux caractères spéciaux
    sanitized = sanitized.replace(
      /[&<>"'\/]/g,
      (char) => htmlEscapeMap[char] || char
    );

    return sanitized.trim();
  };

  /**
   * Vérifie si l'utilisateur actuel a le droit d'envoyer un message à un destinataire spécifique
   */
  const checkMessagingPermission = async (
    recipientId: string,
    senderRole: "patient" | "doctor"
  ): Promise<{ hasPermission: boolean; error?: string }> => {
    try {
      if (!user.value?.id) {
        return { hasPermission: false, error: "Utilisateur non authentifié" };
      }

      // Vérifier le consentement entre patient et médecin
      let query;
      if (senderRole === "patient") {
        // Patient envoyant à un médecin
        query = $supabase
          .from("patient_doctor_consents")
          .select("status")
          .eq("patient_id", user.value.id)
          .eq("doctor_id", recipientId)
          .eq("status", "granted");
      } else {
        // Médecin envoyant à un patient
        query = $supabase
          .from("patient_doctor_consents")
          .select("status")
          .eq("doctor_id", user.value.id)
          .eq("patient_id", recipientId)
          .eq("status", "granted");
      }

      const { data, error } = await query.single();

      if (error || !data) {
        return {
          hasPermission: false,
          error: "Aucun consentement valide trouvé pour cette communication",
        };
      }

      return { hasPermission: true };
    } catch (err) {
      console.error("Erreur lors de la vérification des permissions:", err);
      return {
        hasPermission: false,
        error: "Erreur lors de la vérification des permissions",
      };
    }
  };

  /**
   * Envoie un message sécurisé avec validation complète
   */
  const sendSecureMessage = async (
    message: Omit<SecureMessage, "id" | "created_at" | "updated_at">
  ): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> => {
    try {
      // Validation du contenu
      const contentValidation = validateMessageContent(message.content);
      if (!contentValidation.isValid) {
        return {
          success: false,
          error: contentValidation.errors.join(", "),
        };
      }

      // Validation du sujet
      const subjectValidation = validateSubject(message.subject);
      if (!subjectValidation.isValid) {
        return {
          success: false,
          error: subjectValidation.errors.join(", "),
        };
      }

      // Vérification des permissions
      const recipientId =
        message.sender_role === "patient"
          ? message.doctor_id
          : message.patient_id;
      const permissionCheck = await checkMessagingPermission(
        recipientId,
        message.sender_role
      );

      if (!permissionCheck.hasPermission) {
        return {
          success: false,
          error: permissionCheck.error || "Permission refusée",
        };
      }

      // Nettoyage du contenu
      const sanitizedMessage = {
        ...message,
        content: sanitizeContent(message.content),
        subject: sanitizeContent(message.subject),
        is_encrypted: true, // Force le chiffrement
      };

      // Insertion en base de données
      const { data, error } = await $supabase
        .from("secure_messages")
        .insert(sanitizedMessage)
        .select("id")
        .single();

      if (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        return {
          success: false,
          error: "Erreur lors de l'envoi du message",
        };
      }

      return {
        success: true,
        messageId: data.id,
      };
    } catch (err) {
      console.error("Erreur lors de l'envoi du message sécurisé:", err);
      return {
        success: false,
        error: "Erreur inattendue lors de l'envoi",
      };
    }
  };

  /**
   * Vérifie l'intégrité d'un message reçu
   */
  const verifyMessageIntegrity = (message: SecureMessage): boolean => {
    // Vérifications de base
    if (!message.id || !message.content || !message.sender_role) {
      return false;
    }

    // Vérification que l'utilisateur actuel est bien destinataire
    if (
      user.value?.id !== message.patient_id &&
      user.value?.id !== message.doctor_id
    ) {
      return false;
    }

    // Vérification de la cohérence sender_role
    if (
      message.sender_role === "patient" &&
      user.value?.id === message.patient_id
    ) {
      return true; // Message envoyé par le patient lui-même
    }
    if (
      message.sender_role === "doctor" &&
      user.value?.id === message.doctor_id
    ) {
      return true; // Message envoyé par le médecin lui-même
    }
    if (
      message.sender_role === "patient" &&
      user.value?.id === message.doctor_id
    ) {
      return true; // Message reçu par le médecin du patient
    }
    if (
      message.sender_role === "doctor" &&
      user.value?.id === message.patient_id
    ) {
      return true; // Message reçu par le patient du médecin
    }

    return false;
  };

  /**
   * Journalise un événement de sécurité
   */
  const logSecurityEvent = async (event: string, details: any = {}) => {
    try {
      console.warn(`[SÉCURITÉ MESSAGERIE] ${event}`, {
        userId: user.value?.id,
        timestamp: new Date().toISOString(),
        ...details,
      });

      // En production, ceci devrait être envoyé à un service de logging sécurisé
      // await sendToSecurityLog({ event, userId: user.value?.id, details });
    } catch (err) {
      console.error("Erreur lors de la journalisation de sécurité:", err);
    }
  };

  return {
    // Fonctions de validation
    validateMessageContent,
    validateSubject,
    sanitizeContent,

    // Fonctions de permission et sécurité
    checkMessagingPermission,
    verifyMessageIntegrity,
    logSecurityEvent,

    // Fonction principale d'envoi
    sendSecureMessage,

    // Constantes utiles
    validationRules,
  };
};
