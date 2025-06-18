export type UserRole = "patient" | "doctor" | "admin";

interface AuthState {
  isLoading: boolean;
  error: string | null;
}

// Configuration des timeouts
const AUTH_CONFIG = {
  MAX_AUTH_ATTEMPTS: 50,
  MAX_PROFILE_ATTEMPTS: 30,
  RETRY_DELAY: 100,
  isDev: process.env.NODE_ENV === "development",
} as const;

export const useAuth = () => {
  const supabaseClient = useSupabaseClient();
  const { userProfile, loadUserProfile, userRole } = useUserProfile();
  const user = useSupabaseUser();

  // État de chargement
  const authState = ref<AuthState>({
    isLoading: false,
    error: null,
  });

  const isAuthenticated = computed(() => !!user.value);

  // Vérifier l'accès à une ressource
  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!isAuthenticated.value || !userRole.value) return false;
    return requiredRoles.includes(userRole.value);
  };

  // Fonction utilitaire pour les retry avec timeout
  const waitForCondition = async (
    condition: () => boolean,
    maxAttempts: number,
    delay: number = AUTH_CONFIG.RETRY_DELAY,
    description: string = ""
  ): Promise<boolean> => {
    let attempts = 0;

    while (!condition() && attempts < maxAttempts) {
      if (AUTH_CONFIG.isDev && description) {
        console.log(
          `Attente ${description}... tentative ${attempts + 1}/${maxAttempts}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
    }

    return condition();
  };

  // Logger conditionnel
  const log = (message: string, ...args: any[]) => {
    if (AUTH_CONFIG.isDev) {
      console.log(message, ...args);
    }
  };

  // Redirection simplifiée vers le dashboard
  const redirectToDashboard = async () => {
    try {
      authState.value.isLoading = true;
      authState.value.error = null;

      log("Début de redirectToDashboard");
      log("isAuthenticated:", isAuthenticated.value);
      log("user:", user.value);

      // Attendre l'authentification
      const isAuthSuccess = await waitForCondition(
        () => isAuthenticated.value && !!user.value,
        AUTH_CONFIG.MAX_AUTH_ATTEMPTS,
        AUTH_CONFIG.RETRY_DELAY,
        "authentification"
      );

      if (!isAuthSuccess) {
        log("Timeout d'authentification, redirection vers login");
        await navigateTo("/auth/login");
        return;
      }

      log("Utilisateur authentifié confirmé, chargement du profil...");

      // Charger le profil si nécessaire
      if (!userRole.value) {
        log("Profil non trouvé, chargement en cours...");
        await loadUserProfile();

        // Attendre que le profil soit chargé
        const isProfileSuccess = await waitForCondition(
          () => !!userRole.value,
          AUTH_CONFIG.MAX_PROFILE_ATTEMPTS,
          AUTH_CONFIG.RETRY_DELAY,
          "profil"
        );

        if (!isProfileSuccess) {
          log("Aucun rôle trouvé après timeout, redirection vers profil");
          await navigateTo("/profile");
          return;
        }
      }

      log("Redirection vers le dashboard pour le rôle:", userRole.value);

      // Rediriger selon le rôle
      const dashboardRoutes: Record<UserRole, string> = {
        admin: "/admin/dashboard",
        doctor: "/doctor/dashboard",
        patient: "/patient/dashboard",
      };

      const route = dashboardRoutes[userRole.value!] || "/dashboard";
      await navigateTo(route);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la redirection";
      authState.value.error = errorMessage;
      console.error("Erreur dans redirectToDashboard:", error);
    } finally {
      authState.value.isLoading = false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      authState.value.isLoading = true;
      authState.value.error = null;

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
        options: {
          // @ts-expect-error - Supabase types are not fully compatible with Nuxt
          emailRedirectTo: "http://localhost:3000/auth/confirm",
        },
      });

      if (error) {
        authState.value.error = error.message;
        return { data: null, error };
      }

      if (data.user) {
        await nextTick();
        await loadUserProfile();
        log("Utilisateur connecté:", data.user.email);
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de la connexion";
      authState.value.error = errorMessage;
      console.error("Erreur lors de la connexion:", error);
      return { data: null, error: errorMessage };
    } finally {
      authState.value.isLoading = false;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    authState.value.isLoading = true;
    authState.value.error = null;
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        authState.value.error = error.message;
        return { data: null, error };
      }

      // Créer le profil si l'inscription réussit
      if (data.user && metadata) {
        const { createProfile } = useUserProfile();
        await createProfile(data.user.id, {
          email,
          ...metadata,
        });
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'inscription";
      authState.value.error = errorMessage;
      console.error("Erreur lors de l'inscription:", error);
      return { data: null, error: errorMessage };
    } finally {
      authState.value.isLoading = false;
    }
  };

  const signOut = async () => {
    authState.value.isLoading = true;
    authState.value.error = null;
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        authState.value.error = error.message;
        return { error };
      }
      // automatically redirect to login after sign out
      return { error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la déconnexion";
      authState.value.error = errorMessage;
      console.error("Erreur lors de la déconnexion:", error);
      return { error: errorMessage };
    } finally {
      authState.value.isLoading = false;
    }
  };

  // Réinitialiser les erreurs
  const clearError = () => {
    authState.value.error = null;
  };

  return {
    // État
    userProfile: readonly(userProfile),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(computed(() => authState.value.isLoading)),
    error: readonly(computed(() => authState.value.error)),

    // Méthodes
    loadUserProfile,
    canAccess,
    redirectToDashboard,
    signIn,
    signUp,
    signOut,
    clearError,
  };
};
