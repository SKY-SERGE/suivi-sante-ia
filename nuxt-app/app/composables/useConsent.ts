import type { Database } from "../types/database";

type ConsentRow = Database["public"]["Tables"]["consents"]["Row"];
type ConsentInsert = Database["public"]["Tables"]["consents"]["Insert"];
type ConsentUpdate = Database["public"]["Tables"]["consents"]["Update"];

export const useConsent = () => {
  const supabaseClient = useSupabaseClient();
  const { user, userId } = useUser();

  /**
   * Créer une demande de consentement d'un patient vers un médecin
   */
  const requestConsent = async (doctorId: string, notes?: string) => {
    if (!user.value) {
      throw new Error("Utilisateur non authentifié");
    }

    const consentData: ConsentInsert = {
      patient_id: userId.value,
      doctor_id: doctorId,
      status: "pending",
      notes,
    };

    const { data, error } = await supabaseClient
      .from("consents")
      .insert(consentData)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erreur lors de la création de la demande de consentement: ${error.message}`
      );
    }

    return data;
  };

  /**
   * Accorder un consentement (par le patient)
   */
  const grantConsent = async (consentId: string, expiresAt?: string) => {
    const updateData: ConsentUpdate = {
      status: "granted",
      granted_at: new Date().toISOString(),
      expires_at: expiresAt,
    };

    const { data, error } = await supabaseClient
      .from("consents")
      .update(updateData)
      .eq("id", consentId)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erreur lors de l'accord du consentement: ${error.message}`
      );
    }

    return data;
  };

  /**
   * Révoquer un consentement (par le patient)
   */
  const revokeConsent = async (consentId: string) => {
    const updateData: ConsentUpdate = {
      status: "revoked",
      revoked_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from("consents")
      .update(updateData)
      .eq("id", consentId)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erreur lors de la révocation du consentement: ${error.message}`
      );
    }

    return data;
  };

  /**
   * Obtenir tous les consentements d'un patient
   */
  const getPatientConsents = async (patientId?: string) => {
    if (!user.value) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = patientId || userId.value;

    const { data, error } = await supabaseClient
      .from("consents")
      .select(
        `
        *,
        doctor:doctor_id (
          id,
          first_name,
          last_name,
          email,
          specialization
        )
      `
      )
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Erreur lors de la récupération des consentements: ${error.message}`
      );
    }

    return data;
  };

  /**
   * Obtenir tous les consentements pour un médecin
   */
  const getDoctorConsents = async (doctorId?: string) => {
    if (!user.value) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = doctorId || userId.value;

    const { data, error } = await supabaseClient
      .from("consents")
      .select(
        `
        *,
        patient:patient_id (
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .eq("doctor_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Erreur lors de la récupération des consentements: ${error.message}`
      );
    }

    return data;
  };

  /**
   * Vérifier si un consentement existe et est actif entre un patient et un médecin
   */
  const checkConsentStatus = async (patientId: string, doctorId: string) => {
    const { data, error } = await supabaseClient
      .from("consents")
      .select("*")
      .eq("patient_id", patientId)
      .eq("doctor_id", doctorId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(
        `Erreur lors de la vérification du consentement: ${error.message}`
      );
    }

    if (!data) {
      return { exists: false, status: null, consent: null };
    }

    // Vérifier si le consentement a expiré
    const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
    const actualStatus = isExpired ? "expired" : data.status;

    return {
      exists: true,
      status: actualStatus,
      consent: data,
      isActive: actualStatus === "granted",
    };
  };

  /**
   * Rechercher des médecins disponibles pour demander un consentement
   */
  const searchDoctors = async (searchTerm?: string) => {
    let query = supabaseClient
      .from("users")
      .select("id, first_name, last_name, email, specialization")
      .eq("role", "doctor")
      .eq("is_active", true);

    if (searchTerm) {
      query = query.or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query.order("last_name");

    if (error) {
      throw new Error(
        `Erreur lors de la recherche de médecins: ${error.message}`
      );
    }

    return data;
  };

  /**
   * Obtenir les statistiques de consentement pour un utilisateur
   */
  const getConsentStats = async () => {
    if (!user.value) {
      throw new Error("Utilisateur non authentifié");
    }

    // Obtenir le profil utilisateur pour connaître son rôle
    const { data: profile } = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", userId.value)
      .single();

    if (!profile) {
      throw new Error("Profil utilisateur non trouvé");
    }

    let query;
    if (profile.role === "patient") {
      query = supabaseClient
        .from("consents")
        .select("status")
        .eq("patient_id", userId.value);
    } else if (profile.role === "doctor") {
      query = supabaseClient
        .from("consents")
        .select("status")
        .eq("doctor_id", userId.value);
    } else {
      // Admin peut voir tous les consentements
      query = supabaseClient.from("consents").select("status");
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Erreur lors de la récupération des statistiques: ${error.message}`
      );
    }

    const stats = {
      total: data.length,
      pending: data.filter((c: { status: string }) => c.status === "pending")
        .length,
      granted: data.filter((c: { status: string }) => c.status === "granted")
        .length,
      revoked: data.filter((c: { status: string }) => c.status === "revoked")
        .length,
      expired: data.filter((c: { status: string }) => c.status === "expired")
        .length,
    };

    return stats;
  };

  return {
    requestConsent,
    grantConsent,
    revokeConsent,
    getPatientConsents,
    getDoctorConsents,
    checkConsentStatus,
    searchDoctors,
    getConsentStats,
  };
};
