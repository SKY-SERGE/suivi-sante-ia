import type { Database } from "@/types/database";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

// État global partagé
const globalUserProfile = ref<UserProfile | null>(null);
const globalIsLoading = ref(false);
const globalError = ref<string | null>(null);

export const useUserProfile = () => {
  const supabaseClient = useSupabaseClient();
  const user = useSupabaseUser();

  // Ref computed pour le rôle utilisateur
  const userRole = computed<UserRole | null>(() => {
    return (globalUserProfile.value?.role as UserRole) || null;
  });

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: UserRole): boolean => {
    return userRole.value === role;
  };

  // Vérifier si l'utilisateur a l'un des rôles spécifiés
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userRole.value ? roles.includes(userRole.value) : false;
  };

  // Computed properties pour les rôles spécifiques
  const isPatient = computed(() => hasRole("patient"));
  const isDoctor = computed(() => hasRole("doctor"));
  const isAdmin = computed(() => hasRole("admin"));

  // Charger le profil utilisateur
  const loadUserProfile = async () => {
    // console.trace("loadUserProfile called");
    if (!user.value) {
      globalUserProfile.value = null;
      return;
    }

    globalIsLoading.value = true;
    globalError.value = null;

    try {
      const { data, error: profileError } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", user.value.id)
        .single();
      if (profileError && profileError.code === "PGRST116") {
        // L'utilisateur n'existe pas dans la table users, le créer automatiquement
        console.log(
          "Utilisateur non trouvé dans la table users, création automatique..."
        );

        const userMetadata = user.value.user_metadata || {};

        // Utiliser le composable de création robuste
        const { createProfile: createRobustProfile } = useUserProfileCreation();

        const createResult = await createRobustProfile({
          email: user.value.email,
          first_name: userMetadata.first_name || "",
          last_name: userMetadata.last_name || "",
          role: userMetadata.role || "patient",
        });

        if (createResult.success) {
          globalUserProfile.value = createResult.data;
          console.log(
            `Profil créé automatiquement via ${createResult.method}:`,
            createResult.data
          );
        } else {
          console.error(
            "Erreur lors de la création automatique du profil:",
            createResult.error
          );
          globalError.value = createResult.error;
          globalUserProfile.value = null;
        }
      } else if (profileError) {
        console.error("Erreur lors du chargement du profil:", profileError);
        globalError.value = profileError.message;
        globalUserProfile.value = null;
      } else {
        globalUserProfile.value = data;
        console.log("Profil chargé:", data?.email);
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement du profil:", err);
      globalError.value = err.message;
      globalUserProfile.value = null;
    } finally {
      globalIsLoading.value = false;
    }
  };

  // Watcher pour charger le profil quand l'utilisateur change
  watch(
    user,
    async (newUser) => {
      if (newUser) {
        await loadUserProfile();
      } else {
        globalUserProfile.value = null;
        globalError.value = null;
      }
    },
    { immediate: true }
  );

  // Fonction utilitaire pour obtenir le label du rôle
  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      patient: "Patient",
      doctor: "Médecin",
      admin: "Administrateur",
    };
    return labels[role] || role;
  };

  // Fonction de débogage pour vérifier l'état d'authentification
  const debugAuthState = async () => {
    const {
      data: { user: authUser },
    } = await supabaseClient.auth.getUser();

    console.log("=== DEBUG AUTH STATE ===");
    console.log("Composable user:", user.value);
    console.log("Supabase auth user:", authUser);
    console.log("Auth user ID:", authUser?.id);
    console.log("Composable user ID:", user.value?.id);
    console.log("IDs match:", authUser?.id === user.value?.id);
    console.log("========================");

    return {
      composableUser: user.value,
      authUser,
      idsMatch: authUser?.id === user.value?.id,
    };
  };

  // Créer un profil utilisateur
  const createProfile = async (userId: string, profileData: any) => {
    globalIsLoading.value = true;
    globalError.value = null;

    try {
      // Vérifier que l'utilisateur est authentifié
      const {
        data: { user: authUser },
      } = await supabaseClient.auth.getUser();

      if (!authUser || authUser.id !== userId) {
        throw new Error("Utilisateur non authentifié ou ID non correspondant");
      }

      // Utiliser insert pour créer un nouveau profil avec l'ID spécifique
      const { data, error: createError } = await supabaseClient
        .from("users")
        .insert({
          id: userId, // Utiliser l'ID de Supabase Auth
          email: profileData.email,
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          role: profileData.role || "patient",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Erreur lors de la création du profil:", createError);
        globalError.value = createError.message;
        return { data: null, error: createError };
      }

      globalUserProfile.value = data;
      return { data, error: null };
    } catch (err: any) {
      console.error("Erreur lors de la création du profil:", err);
      globalError.value = err.message;
      return { data: null, error: err };
    } finally {
      globalIsLoading.value = false;
    }
  };

  // Alternative: Créer un profil via une API route (contourne RLS)
  const createProfileViaAPI = async (userId: string, profileData: any) => {
    globalIsLoading.value = true;
    globalError.value = null;

    try {
      const response = (await $fetch("/api/user/create-profile", {
        method: "POST",
        body: {
          userId,
          profileData,
        },
      })) as { success: boolean; data?: any; error?: string };

      if (response.success) {
        globalUserProfile.value = response.data;
        return { data: response.data, error: null };
      } else {
        throw new Error(
          response.error || "Erreur lors de la création du profil"
        );
      }
    } catch (err: any) {
      console.error("Erreur lors de la création du profil via API:", err);
      globalError.value = err.message;
      return { data: null, error: err };
    } finally {
      globalIsLoading.value = false;
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value)
      return { data: null, error: "Utilisateur non authentifié" };

    globalIsLoading.value = true;
    globalError.value = null;

    try {
      const { data, error: updateError } = await supabaseClient
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.value.id)
        .select()
        .single();

      if (updateError) {
        globalError.value = updateError.message;
        return { data: null, error: updateError };
      }

      globalUserProfile.value = data;
      return { data, error: null };
    } catch (err: any) {
      globalError.value = err.message;
      return { data: null, error: err };
    } finally {
      globalIsLoading.value = false;
    }
  };

  const updatePassword = async (email: string) => {
    if (!email) return;

    globalIsLoading.value = true;
    globalError.value = null;
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        globalError.value = error.message;
        return { data: null, error: error };
      }
      return {
        data: true,
        error: null,
        success:
          "Email de réinitialisation envoyé ! Vérifiez votre boîte mail.",
      };
    } catch (err: any) {
      globalError.value = err.message;
      return { data: null, error: err };
    } finally {
      globalIsLoading.value = false;
    }
  };

  return {
    userProfile: readonly(globalUserProfile),
    userRole: readonly(userRole),
    isLoading: readonly(globalIsLoading),
    error: readonly(globalError),

    // Rôles
    isPatient,
    isDoctor,
    isAdmin,

    // Méthodes
    hasRole,
    hasAnyRole,
    loadUserProfile,
    createProfile,
    createProfileViaAPI,
    updateProfile,
    updatePassword,
    getRoleLabel,
    debugAuthState,
  };
};
