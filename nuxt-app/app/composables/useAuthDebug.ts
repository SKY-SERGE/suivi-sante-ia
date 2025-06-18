// Composable pour tester et déboguer les problèmes RLS
export const useAuthDebug = () => {
  const user = useSupabaseUser();
  const supabaseClient = useSupabaseClient();

  // Test de création de profil direct
  const testCreateProfile = async () => {
    if (!user.value) {
      console.error("Aucun utilisateur connecté");
      return { success: false, error: "Aucun utilisateur connecté" };
    }

    try {
      // Récupérer les informations d'authentification actuelles
      const {
        data: { user: authUser },
      } = await supabaseClient.auth.getUser();

      console.log("=== TEST CREATE PROFILE ===");
      console.log("User from composable:", user.value);
      console.log("User from auth:", authUser);
      console.log("IDs match:", user.value.id === authUser?.id);

      // Tentative de création directe
      const { data, error } = await supabaseClient
        .from("users")
        .insert({
          id: user.value.id,
          email: user.value.email || "test@example.com",
          first_name: "Test",
          last_name: "User",
          role: "patient",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur RLS:", error);
        return { success: false, error };
      }

      console.log("Profil créé avec succès:", data);
      return { success: true, data };
    } catch (error) {
      console.error("Erreur lors du test:", error);
      return { success: false, error };
    }
  };

  // Test via l'API route
  const testCreateProfileViaAPI = async () => {
    if (!user.value) {
      console.error("Aucun utilisateur connecté");
      return { success: false, error: "Aucun utilisateur connecté" };
    }

    try {
      console.log("=== TEST CREATE PROFILE VIA API ===");

      const response = await $fetch("/api/user/create-profile", {
        method: "POST",
        body: {
          userId: user.value.id,
          profileData: {
            email: user.value.email || "test@example.com",
            first_name: "Test",
            last_name: "User",
            role: "patient",
          },
        },
      });

      console.log("Réponse API:", response);
      return { success: true, data: response };
    } catch (error) {
      console.error("Erreur API:", error);
      return { success: false, error };
    }
  };

  // Vérifier les politiques RLS actuelles
  const checkRLSPolicies = async () => {
    try {
      // Cette requête peut échouer selon les permissions
      const { data, error } = await supabaseClient.rpc("get_table_policies", {
        table_name: "users",
      });

      if (error) {
        console.error("Impossible de récupérer les politiques RLS:", error);
        return { success: false, error };
      }

      console.log("Politiques RLS pour la table users:", data);
      return { success: true, data };
    } catch (error) {
      console.error("Erreur lors de la vérification RLS:", error);
      return { success: false, error };
    }
  };

  // Test de lecture du profil
  const testReadProfile = async () => {
    if (!user.value) {
      console.error("Aucun utilisateur connecté");
      return { success: false, error: "Aucun utilisateur connecté" };
    }

    try {
      const supabase = useSupabase();

      console.log("=== TEST READ PROFILE ===");

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.value.id)
        .single();

      if (error) {
        console.error("Erreur lors de la lecture:", error);
        return { success: false, error };
      }

      console.log("Profil lu avec succès:", data);
      return { success: true, data };
    } catch (error) {
      console.error("Erreur lors du test de lecture:", error);
      return { success: false, error };
    }
  };

  return {
    testCreateProfile,
    testCreateProfileViaAPI,
    checkRLSPolicies,
    testReadProfile,
  };
};
