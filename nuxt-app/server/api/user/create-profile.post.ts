import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const user = await serverSupabaseUser(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Utilisateur non authentifié",
      });
    }

    console.log("Utilisateur authentifié côté serveur:", user.id);

    const supabaseClient = await serverSupabaseClient(event);

    // Récupération des données de la requête
    const body = await readBody(event);
    const { userId, profileData } = body;

    console.log("Données reçues:", { userId, profileData });

    if (!userId || !profileData) {
      throw createError({
        statusCode: 400,
        statusMessage: "userId et profileData sont requis",
      });
    }

    // Vérifier que l'utilisateur authentifié correspond à celui qu'on veut créer
    if (user.id !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: "Accès non autorisé - ID utilisateur ne correspond pas",
      });
    }

    console.log(
      "Tentative de création du profil via fonction RPC pour l'utilisateur:",
      userId
    );

    // Utiliser la fonction RPC avec un cast de type approprié
    const { data, error } = await (supabaseClient as any).rpc(
      "create_user_profile",
      {
        p_id: userId,
        p_email: profileData.email,
        p_first_name: profileData.first_name || "",
        p_last_name: profileData.last_name || "",
        p_role: profileData.role || "patient",
      }
    );

    if (error) {
      console.error("Erreur RPC create_user_profile:", error);
      throw createError({
        statusCode: 500,
        statusMessage: `Erreur lors de la création du profil: ${error.message}`,
      });
    }

    console.log("Profil créé avec succès via RPC:", data);

    return {
      success: true,
      data,
      message: "Profil créé avec succès",
    };
  } catch (error: any) {
    console.error("Erreur dans create-profile API:", error);

    // Si c'est déjà une erreur HTTP, la relancer
    if (error.statusCode) {
      throw error;
    }

    // Sinon, créer une erreur générique
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Erreur serveur interne",
    });
  }
});
