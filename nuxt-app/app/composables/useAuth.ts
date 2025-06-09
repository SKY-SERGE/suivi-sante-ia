export type UserRole = "patient" | "doctor" | "admin";

export const useAuth = () => {
  const { user, isAuthenticated, setUser } = useSupabaseUser();
  const { userProfile, loadUserProfile: loadProfile } = useUserProfile();

  // Ref computed pour le rôle utilisateur
  const userRole = computed<UserRole | null>(() => {
    return (userProfile.value?.role as UserRole) || null;
  });

  // Charger le profil utilisateur avec son rôle
  const loadUserProfile = async () => {
    if (!user.value) return null;
    await loadProfile();
    return { data: userProfile.value, error: null };
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: UserRole): boolean => {
    return userRole.value === role;
  };

  // Vérifier si l'utilisateur a l'un des rôles spécifiés
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userRole.value ? roles.includes(userRole.value) : false;
  };

  // Vérifier si l'utilisateur est un patient
  const isPatient = computed(() => hasRole("patient"));

  // Vérifier si l'utilisateur est un médecin
  const isDoctor = computed(() => hasRole("doctor"));

  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = computed(() => hasRole("admin")); // Rediriger vers la page appropriée selon le rôle
  const redirectToDashboard = async () => {
    console.log("Début de redirectToDashboard");
    console.log("isAuthenticated:", isAuthenticated.value);
    console.log("user:", user.value?.email);
    console.log("userRole:", userRole.value);

    // Attendre un maximum de 5 secondes que l'utilisateur soit authentifié
    let attempts = 0;
    const maxAttempts = 50; // 5 secondes avec 100ms d'intervalle

    while (!isAuthenticated.value && attempts < maxAttempts) {
      console.log(
        `Attente authentification... tentative ${attempts + 1}/${maxAttempts}`
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    // S'assurer que l'utilisateur est connecté
    if (!isAuthenticated.value || !user.value) {
      console.warn(
        "Tentative de redirection sans utilisateur authentifié après délai d'attente"
      );
      await navigateTo("/auth/login");
      return;
    }

    console.log("Utilisateur authentifié confirmé, chargement du profil...");

    // Si le profil n'est pas encore chargé, le charger et attendre
    if (!userRole.value) {
      console.log("Profil non trouvé, chargement en cours...");
      await loadUserProfile();

      // Attendre un peu que le profil soit chargé
      let profileAttempts = 0;
      const maxProfileAttempts = 30; // 3 secondes

      while (!userRole.value && profileAttempts < maxProfileAttempts) {
        console.log(
          `Attente profil... tentative ${
            profileAttempts + 1
          }/${maxProfileAttempts}`
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        profileAttempts++;
      }
    }

    console.log("Rôle final après chargement:", userRole.value);

    // Si après le chargement du profil on n'a toujours pas de rôle, rediriger vers le profil
    if (!userRole.value) {
      console.warn(
        "Aucun rôle trouvé pour l'utilisateur, redirection vers le profil"
      );
      await navigateTo("/profile");
      return;
    }

    console.log("Redirection vers le dashboard pour le rôle:", userRole.value);

    // Rediriger selon le rôle
    switch (userRole.value) {
      case "admin":
        await navigateTo("/admin/dashboard");
        break;
      case "doctor":
        await navigateTo("/doctor/dashboard");
        break;
      case "patient":
      default:
        await navigateTo("/espace");
        break;
    }
  };

  // Vérifier l'accès à une ressource
  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!isAuthenticated.value || !userRole.value) return false;
    return requiredRoles.includes(userRole.value);
  };
  const signIn = async (
    email: string,
    password: string,
    role: UserRole = "patient"
  ) => {
    try {
      const supabase = useSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data.user && !error) {
        setUser(data.user);

        // Attendre que l'état d'authentification soit mis à jour
        await nextTick();

        // Attendre que le profil soit chargé
        await loadUserProfile();

        console.log("Utilisateur connecté:", data.user.email);
        console.log("État d'authentification:", isAuthenticated.value);
        console.log("Profil utilisateur:", userProfile.value);
      }

      return { data, error };
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return { data: null, error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const supabase = useSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      }); // Si l'inscription réussit et que nous avons des métadonnées, créer le profil
      if (data.user && !error && metadata) {
        const { createProfile } = useUserProfile();
        await createProfile(data.user.id, {
          email,
          ...metadata,
        });
      }

      return { data, error };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const supabase = useSupabase();
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        await navigateTo("/auth/login");
      }
      return { error };
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      return { error };
    }
  };

  // Déconnexion sécurisée
  const logout = async () => {
    await signOut();
    // Les valeurs userProfile et userRole seront automatiquement réinitialisées
    // par les watchers dans useUserProfile quand user devient null
  };

  return {
    user: readonly(user),
    userProfile: readonly(userProfile),
    userRole: readonly(userRole),
    isAuthenticated,
    isPatient,
    isDoctor,
    isAdmin,
    loadUserProfile,
    hasRole,
    hasAnyRole,
    canAccess,
    redirectToDashboard,
    signIn,
    signUp,
    logout,
  };
};
