/**
 * Plugin de sécurité côté client
 * Initialise les protections de sécurité et configure l'intercepteur global
 */

export default defineNuxtPlugin(() => {
  // Uniquement côté client
  if (process.server) return;

  // Configuration de sécurité pour les cookies
  const configureCookieSecurity = () => {
    // Configuration sécurisée pour tous les cookies de l'application
    document.cookie = `Secure; SameSite=Strict; Path=/`;
  };
  // Gestionnaire d'erreurs global pour la sécurité
  const handleSecurityError = (error: any) => {
    if (error.status === 403 && error.data?.statusMessage?.includes("Token")) {
      // Token CSRF invalide - nettoyer le cache
      const csrfCookie = useCookie("csrf-token");
      csrfCookie.value = null;

      console.warn("Session expirée - veuillez recharger la page");
    } else if (error.status === 429) {
      // Rate limiting
      console.warn("Trop de requêtes - veuillez patienter");
    }
  };

  // Intercepteur d'erreurs global
  if (process.client) {
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason?.name === "FetchError") {
        handleSecurityError(event.reason);
      }
    });
  }

  // Appliquer la configuration au montage
  onMounted(() => {
    configureCookieSecurity();
  });

  // Headers de sécurité supplémentaires via meta tags (fallback)
  useHead({
    meta: [
      // Protection supplémentaire contre le clickjacking
      { "http-equiv": "X-Frame-Options", content: "SAMEORIGIN" },
      // Protection contre les attaques MIME
      { "http-equiv": "X-Content-Type-Options", content: "nosniff" },
      // Protection XSS
      { "http-equiv": "X-XSS-Protection", content: "1; mode=block" },
    ],
  });

  // Monitoring de sécurité côté client
  const monitorSecurity = () => {
    if (!process.client) return;

    // Détecter les tentatives de manipulation du DOM suspectes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // Détecter l'injection de scripts suspects
            if (
              element.tagName === "SCRIPT" &&
              !element.hasAttribute("data-app-script")
            ) {
              console.warn("Script non autorisé détecté:", element);
              // En production, on pourrait logger cela vers un service de sécurité
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Nettoyage lors de la destruction
    onBeforeUnmount(() => {
      observer.disconnect();
    });
  };

  // Activer le monitoring en développement et production
  onMounted(() => {
    monitorSecurity();
  });

  // Fournir les utilitaires de sécurité globalement
  return {
    provide: {
      security: {
        handleSecurityError,
      },
    },
  };
});
