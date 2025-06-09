import type { User } from "@supabase/supabase-js";

// État global partagé
const globalUser = ref<User | null>(null);
const isInitialized = ref(false);

export const useSupabaseUser = () => {
  // Initialiser de façon sécurisée
  const initialize = async () => {
    if (isInitialized.value) return;

    try {
      const supabase = useSupabase();
      await getUser();

      // Écouter les changements d'état d'authentification
      supabase.auth.onAuthStateChange((event, session) => {
        globalUser.value = session?.user || null;
      });

      isInitialized.value = true;
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation de useSupabaseUser:",
        error
      );
      throw error;
    }
  };

  const getUser = async () => {
    try {
      const supabase = useSupabase();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      globalUser.value = currentUser;
      return currentUser;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      globalUser.value = null;
      return null;
    }
  };

  const setUser = (newUser: User | null) => {
    globalUser.value = newUser;
    // Forcer la réactivité
    nextTick();
  };

  const isAuthenticated = computed(() => !!globalUser.value);

  return {
    user: readonly(globalUser),
    isAuthenticated,
    initialize,
    getUser,
    setUser,
  };
};
