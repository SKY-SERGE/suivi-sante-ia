import { ref, readonly } from "vue";

interface NotificationAction {
  label: string;
  handler: () => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  actions?: NotificationAction[];
  autoDismiss?: number; // en millisecondes
  persistent?: boolean;
}

interface NotificationOptions {
  message?: string;
  actions?: NotificationAction[];
  autoDismiss?: number;
  persistent?: boolean;
}

// État global des notifications
const notifications = ref<Notification[]>([]);

export const useNotifications = () => {
  const addNotification = (
    type: Notification["type"],
    title: string,
    options: NotificationOptions = {}
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`;

    const notification: Notification = {
      id,
      type,
      title,
      message: options.message,
      actions: options.actions,
      autoDismiss:
        options.autoDismiss ??
        (type === "success" ? 4000 : type === "error" ? 8000 : 6000),
      persistent: options.persistent ?? false,
    };

    notifications.value.push(notification);

    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAllNotifications = () => {
    notifications.value = [];
  };

  // Méthodes de convenance
  const success = (title: string, options?: NotificationOptions) => {
    return addNotification("success", title, options);
  };

  const error = (title: string, options?: NotificationOptions) => {
    return addNotification("error", title, {
      autoDismiss: 0, // Les erreurs persistent par défaut
      persistent: true,
      ...options,
    });
  };

  const warning = (title: string, options?: NotificationOptions) => {
    return addNotification("warning", title, options);
  };

  const info = (title: string, options?: NotificationOptions) => {
    return addNotification("info", title, options);
  };

  // Notifications contextuelles pour l'app santé
  const healthDataSaved = (dataType: string) => {
    return success("Données enregistrées", {
      message: `Vos données de ${dataType} ont été sauvegardées avec succès.`,
      autoDismiss: 3000,
    });
  };

  const mealAnalyzed = (confidence: number) => {
    const confidenceText =
      confidence > 0.8 ? "élevée" : confidence > 0.6 ? "moyenne" : "faible";
    return success("Repas analysé", {
      message: `Analyse terminée avec une confiance ${confidenceText} (${Math.round(
        confidence * 100
      )}%)`,
      autoDismiss: 5000,
    });
  };

  const aiResponseReceived = () => {
    return info("Réponse IA reçue", {
      message: "L'assistant IA a analysé votre question.",
      autoDismiss: 2000,
    });
  };

  const goalUpdated = (goalType: string) => {
    return success("Objectif mis à jour", {
      message: `Votre objectif de ${goalType} a été modifié.`,
      autoDismiss: 3000,
    });
  };

  const messageReceived = (senderName: string) => {
    return info("Nouveau message", {
      message: `Message reçu de ${senderName}`,
      actions: [
        {
          label: "Voir",
          handler: () => {
            // Navigation vers les messages
            navigateTo("/patient/messages");
          },
        },
      ],
      autoDismiss: 8000,
    });
  };

  const uploadProgress = (filename: string, progress: number) => {
    if (progress >= 100) {
      return success("Upload terminé", {
        message: `${filename} a été uploadé avec succès.`,
        autoDismiss: 3000,
      });
    } else {
      return info("Upload en cours", {
        message: `${filename} - ${progress}% terminé`,
        persistent: true,
      });
    }
  };

  const networkError = () => {
    return error("Erreur de connexion", {
      message:
        "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
      actions: [
        {
          label: "Réessayer",
          handler: () => {
            window.location.reload();
          },
        },
      ],
    });
  };

  const validationError = (field: string, message: string) => {
    return error(`Erreur de validation: ${field}`, {
      message,
      autoDismiss: 6000,
    });
  };

  const sessionExpired = () => {
    return warning("Session expirée", {
      message:
        "Votre session a expiré. Vous allez être redirigé vers la page de connexion.",
      actions: [
        {
          label: "Se reconnecter",
          handler: () => {
            navigateTo("/auth/login");
          },
        },
      ],
      autoDismiss: 5000,
    });
  };

  return {
    notifications: readonly(notifications),
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info,
    // Méthodes contextuelles
    healthDataSaved,
    mealAnalyzed,
    aiResponseReceived,
    goalUpdated,
    messageReceived,
    uploadProgress,
    networkError,
    validationError,
    sessionExpired,
  };
};
