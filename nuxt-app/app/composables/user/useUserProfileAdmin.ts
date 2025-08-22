// Composable pour les opérations administratives de profil utilisateur
// Date: 2025-06-18

export const useUserProfileAdmin = () => {
  const supabaseClient = useSupabaseClient();
  const user = useSupabaseUser();

  // Fonction pour créer un profil directement via RPC
  const createProfileDirectRPC = async (profileData: any) => {
    if (!user.value) {
      throw new Error("Utilisateur non authentifié");
    }

    try {
      console.log("Tentative de création de profil via RPC direct:", {
        userId: user.value.id,
        email: profileData.email,
      });

      // Appeler la fonction RPC directement depuis le client
      const { data, error } = await (supabaseClient as any).rpc(
        "create_user_profile",
        {
          p_id: user.value.id,
          p_email: profileData.email,
          p_first_name: profileData.first_name || "",
          p_last_name: profileData.last_name || "",
          p_role: profileData.role || "patient",
        }
      );

      if (error) {
        console.error("Erreur RPC create_user_profile (client):", error);
        throw error;
      }

      console.log("Profil créé avec succès via RPC client:", data);
      return { data, error: null };
    } catch (err: any) {
      console.error("Erreur lors de la création de profil RPC:", err);
      return { data: null, error: err };
    }
  };

  // Fonction pour tester les politiques RLS
  const testRLSPolicies = async () => {
    if (!user.value) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = user.value.id;
    console.log("Test des politiques RLS pour l'utilisateur:", userId);

    try {
      // Tester la lecture
      console.log("1. Test de lecture...");
      const { data: readData, error: readError } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", userId);

      console.log("Résultat lecture:", { readData, readError });

      // Tester l'insertion directe (devrait échouer avec RLS)
      console.log("2. Test d'insertion directe...");
      const { data: insertData, error: insertError } = await supabaseClient
        .from("users")
        .insert({
          id: userId,
          email: user.value.email || "test@example.com",
          first_name: "Test",
          last_name: "User",
          role: "patient",
        } as any)
        .select();

      console.log("Résultat insertion:", { insertData, insertError });

      return {
        readTest: { data: readData, error: readError },
        insertTest: { data: insertData, error: insertError },
      };
    } catch (err: any) {
      console.error("Erreur lors du test RLS:", err);
      return { error: err };
    }
  };

  // Fonction pour vérifier l'état d'authentification détaillé
  const checkAuthenticationState = async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabaseClient.auth.getUser();
      const {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();

      console.log("=== État d'authentification détaillé ===");
      console.log("Composable user:", user.value);
      console.log("Auth getUser():", { user: authUser, error: authError });
      console.log("Auth getSession():", { session, error: sessionError });
      console.log("Session access_token présent:", !!session?.access_token);
      console.log(
        "Session expire à:",
        session?.expires_at ? new Date(session.expires_at * 1000) : "N/A"
      );
      console.log("===========================================");

      return {
        composableUser: user.value,
        authUser,
        session,
        authError,
        sessionError,
        isAuthenticated: !!authUser && !!session?.access_token,
      };
    } catch (err: any) {
      console.error(
        "Erreur lors de la vérification de l'état d'authentification:",
        err
      );
      return { error: err };
    }
  };

  return {
    createProfileDirectRPC,
    testRLSPolicies,
    checkAuthenticationState,
  };
};
