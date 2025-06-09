import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database";

export const useSupabase = () => {
  const nuxtApp = useNuxtApp();

  // Vérifier que le plugin supabase est bien initialisé
  if (!nuxtApp.$supabase) {
    // Si on est côté client et que le plugin n'est pas prêt, utiliser la version safe
    if (process.client) {
      return useSupabaseSafe();
    }

    throw new Error(
      "Plugin Supabase non initialisé. Vérifiez votre configuration."
    );
  }

  return nuxtApp.$supabase as ReturnType<typeof createClient<Database>>;
};
