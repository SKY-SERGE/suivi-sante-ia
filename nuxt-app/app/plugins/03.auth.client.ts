export default defineNuxtPlugin(async () => {
  // Attendre que le DOM et les autres plugins soient prêts
  await nextTick();

  // Attendre un tick supplémentaire pour s'assurer que Supabase est initialisé
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    // Vérifier que Supabase est disponible avant d'initialiser l'auth
    const nuxtApp = useNuxtApp();
    if (!nuxtApp.$supabase) {
      console.warn("Plugin Supabase non disponible, initialisation différée");
      return;
    }

    const toastStore = useToastStore();
    const { loadUserProfile } = useAuth();
    const { initialize, getUser } = useSupabaseUser();

    await initialize();

    const user = await getUser();
    if (user) {
      await loadUserProfile();
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de l'auth:", error);

    // Utiliser nextTick pour s'assurer que le toast store est prêt
    await nextTick();
    try {
      const toastStore = useToastStore();
      toastStore.error(
        "Erreur lors de l'initialisation de l'authentification."
      );
    } catch (toastError) {
      console.warn("Toast store non disponible:", toastError);
    }
  }
});
