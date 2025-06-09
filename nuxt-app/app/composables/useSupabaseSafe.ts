import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database";

// Version sécurisée du composable Supabase avec initialisation lazy
export const useSupabaseSafe = () => {
  const nuxtApp = useNuxtApp();

  // Si le plugin est déjà initialisé, l'utiliser
  if (nuxtApp.$supabase) {
    return nuxtApp.$supabase as ReturnType<typeof createClient<Database>>;
  }

  // Sinon, créer une instance directement
  const config = useRuntimeConfig();

  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw new Error(
      "Configuration Supabase manquante dans les variables d'environnement"
    );
  }

  console.warn("🔄 Initialisation directe de Supabase (plugin non disponible)");

  const supabase = createClient<Database>(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return supabase;
};
