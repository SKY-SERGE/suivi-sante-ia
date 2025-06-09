import type { Database } from "@/types/database";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

// État global partagé
const globalUserProfile = ref<UserProfile | null>(null);
const globalIsLoading = ref(false);
const globalError = ref<string | null>(null);

export const useUserProfile = () => {
  const { user } = useSupabaseUser();
  // Charger le profil utilisateur
  const loadUserProfile = async () => {
    if (!user.value) {
      globalUserProfile.value = null;
      return;
    }

    globalIsLoading.value = true;
    globalError.value = null;

    try {
      const supabase = useSupabase();
      let { data, error: profileError } = await supabase
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
        const createResult = await createProfile(user.value.id, {
          email: user.value.email,
          first_name: userMetadata.first_name || "",
          last_name: userMetadata.last_name || "",
          role: userMetadata.role || "patient",
        });

        if (createResult.error) {
          console.error(
            "Erreur lors de la création automatique du profil:",
            createResult.error
          );
          globalError.value = createResult.error.message;
          globalUserProfile.value = null;
        } else {
          globalUserProfile.value = createResult.data;
          console.log("Profil créé automatiquement:", createResult.data);
        }
      } else if (profileError) {
        console.error("Erreur lors du chargement du profil:", profileError);
        globalError.value = profileError.message;
        globalUserProfile.value = null;
      } else {
        globalUserProfile.value = data;
        console.log("Profil chargé:", data);
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
  // Créer un profil utilisateur
  const createProfile = async (userId: string, profileData: any) => {
    globalIsLoading.value = true;
    globalError.value = null;

    try {
      const supabase = useSupabase();

      // Utiliser insert pour créer un nouveau profil avec l'ID spécifique
      const { data, error: createError } = await supabase
        .from("users")
        .insert({
          id: userId, // Utiliser l'ID de Supabase Auth
          email: profileData.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
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

  // Mettre à jour le profil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value)
      return { data: null, error: "Utilisateur non authentifié" };

    globalIsLoading.value = true;
    globalError.value = null;

    try {
      const supabase = useSupabase();
      const { data, error: updateError } = await supabase
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

  return {
    userProfile: readonly(globalUserProfile),
    isLoading: readonly(globalIsLoading),
    error: readonly(globalError),
    loadUserProfile,
    createProfile,
    updateProfile,
    getRoleLabel,
  };
};
