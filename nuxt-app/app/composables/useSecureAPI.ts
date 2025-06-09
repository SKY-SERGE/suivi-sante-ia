/**
 * Composable pour la gestion sécurisée des requêtes API avec protection CSRF
 */

export const useSecureAPI = () => {
  const csrfToken = ref<string | null>(null);
  const isCSRFReady = ref(false);

  /**
   * Initialise le token CSRF au premier appel
   */
  const initializeCSRF = async (): Promise<void> => {
    if (csrfToken.value && isCSRFReady.value) {
      return;
    }

    try {
      const response = await $fetch<{ csrfToken: string }>(
        "/api/auth/csrf-token"
      );
      csrfToken.value = response.csrfToken;
      isCSRFReady.value = true;

      // Stocker le token dans un cookie pour les requêtes futures
      const cookie = useCookie("csrf-token", {
        default: () => "",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600, // 1 heure
      });
      cookie.value = response.csrfToken;
    } catch (error) {
      console.error("Erreur lors de l'initialisation du token CSRF:", error);
      throw new Error("Impossible d'initialiser la sécurité");
    }
  };

  /**
   * Effectue une requête sécurisée avec protection CSRF
   */
  const secureRequest = async <T>(
    url: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> => {
    // S'assurer que le CSRF est initialisé pour les requêtes non-GET
    if (options.method && options.method !== "GET") {
      await initializeCSRF();
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Ajouter le token CSRF pour les requêtes sensibles
    if (options.method && options.method !== "GET" && csrfToken.value) {
      headers["x-csrf-token"] = csrfToken.value;
    }

    try {
      const response = await $fetch<T>(url, {
        method: options.method || "GET",
        body: options.body,
        headers,
        retry: 1,
        retryStatusCodes: [429], // Retry en cas de rate limiting
        onResponseError({ request, response, options }) {
          // Gérer les erreurs spécifiques de sécurité
          if (
            response.status === 403 &&
            response._data?.statusMessage?.includes("Token")
          ) {
            // Token CSRF invalide, réinitialiser
            csrfToken.value = null;
            isCSRFReady.value = false;
            console.warn("Token CSRF invalide, réinitialisation nécessaire");
          }
        },
      });

      return response;
    } catch (error: any) {
      // Si erreur CSRF, tenter une nouvelle requête avec un token frais
      if (error.status === 403 && options.method !== "GET") {
        csrfToken.value = null;
        isCSRFReady.value = false;

        // Nouvelle tentative avec token frais
        await initializeCSRF();
        headers["x-csrf-token"] = csrfToken.value!;

        return await $fetch<T>(url, {
          method: options.method || "GET",
          body: options.body,
          headers,
        });
      }

      throw error;
    }
  };

  /**
   * Upload sécurisé de fichier avec validation
   */
  const secureFileUpload = async (
    url: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<any> => {
    await initializeCSRF();

    // Validation côté client du fichier
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (file.size > maxSize) {
      throw new Error(
        `Fichier trop volumineux. Taille maximale: ${maxSize / (1024 * 1024)}MB`
      );
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(
          ", "
        )}`
      );
    }

    const formData = new FormData();
    formData.append("image", file);

    // Ajouter des données additionnelles si fournies
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }

    const headers: Record<string, string> = {};
    if (csrfToken.value) {
      headers["x-csrf-token"] = csrfToken.value;
    }

    return await $fetch(url, {
      method: "POST",
      body: formData,
      headers,
    });
  };

  /**
   * Méthodes de commodité pour les requêtes communes
   */
  const secureGet = <T>(url: string, headers?: Record<string, string>) =>
    secureRequest<T>(url, { method: "GET", headers });

  const securePost = <T>(
    url: string,
    body: any,
    headers?: Record<string, string>
  ) => secureRequest<T>(url, { method: "POST", body, headers });

  const securePut = <T>(
    url: string,
    body: any,
    headers?: Record<string, string>
  ) => secureRequest<T>(url, { method: "PUT", body, headers });

  const secureDelete = <T>(url: string, headers?: Record<string, string>) =>
    secureRequest<T>(url, { method: "DELETE", headers });

  // Initialiser automatiquement au montage du composable (côté client uniquement)
  if (process.client) {
    onMounted(() => {
      initializeCSRF().catch(console.error);
    });
  }

  return {
    csrfToken: readonly(csrfToken),
    isCSRFReady: readonly(isCSRFReady),
    initializeCSRF,
    secureRequest,
    secureFileUpload,
    secureGet,
    securePost,
    securePut,
    secureDelete,
  };
};
