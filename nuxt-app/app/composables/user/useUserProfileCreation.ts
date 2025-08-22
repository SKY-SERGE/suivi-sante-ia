// Composable pour créer un profil utilisateur avec gestion robuste des erreurs RLS
// Alternative qui fonctionne même si les migrations RLS ne sont pas appliquées
// Date: 2025-06-18

export const useUserProfileCreation = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const createProfile = async (profileData: {
    first_name: string;
    last_name: string;
    email: string;
    role?: "patient" | "doctor" | "admin";
  }) => {
    try {
      if (!user.value) {
        throw new Error("Utilisateur non authentifié");
      }

      console.log("Tentative de création de profil pour:", user.value.id);

      // Méthode 1: Essayer avec la fonction RPC d'abord (la plus sécurisée)
      try {
        console.log("Tentative de création via fonction RPC...");
        const { data: rpcData, error: rpcError } = await (supabase as any).rpc(
          "create_user_profile",
          {
            p_id: user.value.id,
            p_email: profileData.email,
            p_first_name: profileData.first_name,
            p_last_name: profileData.last_name,
            p_role: profileData.role || "patient",
          }
        );

        if (!rpcError && rpcData) {
          console.log("Profil créé avec succès via RPC:", rpcData);
          if (rpcData.success) {
            return {
              success: true,
              data: rpcData.user,
              method: "RPC",
            };
          } else {
            throw new Error(rpcData.error || "Erreur RPC inconnue");
          }
        }
      } catch (rpcError: any) {
        console.warn("Échec de la méthode RPC:", rpcError.message);

        // Si la fonction RPC n'existe pas, continuer avec la méthode suivante
        if (
          !rpcError.message.includes("function") &&
          !rpcError.message.includes("does not exist")
        ) {
          throw rpcError;
        }
      }

      // Méthode 2: Essayer l'insertion directe avec les politiques RLS
      try {
        console.log("Tentative de création via insertion directe...");
        const { data: insertData, error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.value.id,
            email: profileData.email,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            role: profileData.role || "patient",
          })
          .select()
          .single();

        if (!insertError && insertData) {
          console.log(
            "Profil créé avec succès via insertion directe:",
            insertData
          );
          return {
            success: true,
            data: insertData,
            method: "direct_insert",
          };
        }
      } catch (insertError: any) {
        console.warn("Échec de l'insertion directe:", insertError.message);
      }

      // Méthode 3: Utiliser l'API route comme fallback
      try {
        console.log("Tentative de création via API route...");
        const { data: apiData } = await $fetch("/api/user/create-profile", {
          method: "POST",
          body: {
            userId: user.value.id,
            profileData: {
              email: profileData.email,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              role: profileData.role || "patient",
            },
          },
        });

        if (apiData && apiData.success) {
          console.log("Profil créé avec succès via API:", apiData.data);
          return {
            success: true,
            data: apiData.data,
            method: "api_route",
          };
        }
      } catch (apiError: any) {
        console.warn("Échec de l'API route:", apiError.message);
      }

      // Si toutes les méthodes échouent, retourner une erreur détaillée
      throw new Error(
        "Toutes les méthodes de création de profil ont échoué. Veuillez vérifier la configuration RLS de votre base de données."
      );
    } catch (error: any) {
      console.error("Erreur lors de la création du profil:", error);
      return {
        success: false,
        error: error.message,
        method: "failed",
      };
    }
  };

  const checkProfileExists = async (userId?: string) => {
    try {
      const targetUserId = userId || user.value?.id;
      if (!targetUserId) return false;

      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", targetUserId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  };

  const getRLSStatus = async () => {
    try {
      // Tenter de récupérer les informations sur les politiques RLS
      const { data: policies, error } = await supabase
        .from("pg_policies")
        .select("*")
        .eq("tablename", "users");

      const { data: functions, error: funcError } = await supabase
        .from("information_schema.routines")
        .select("routine_name")
        .eq("routine_name", "create_user_profile");

      return {
        policies: policies || [],
        rpcFunctionExists: !funcError && functions && functions.length > 0,
        error: error?.message || funcError?.message,
      };
    } catch (error: any) {
      return {
        policies: [],
        rpcFunctionExists: false,
        error: error.message,
      };
    }
  };

  return {
    createProfile,
    checkProfileExists,
    getRLSStatus,
  };
};
