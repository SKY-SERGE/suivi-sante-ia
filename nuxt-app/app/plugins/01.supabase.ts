import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Vérifier que les variables d'environnement sont définies
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    console.error(
      "Configuration Supabase manquante. Vérifiez vos variables d'environnement:"
    );
    console.error("- NUXT_PUBLIC_SUPABASE_URL:", !!config.public.supabaseUrl);
    console.error(
      "- NUXT_PUBLIC_SUPABASE_ANON_KEY:",
      !!config.public.supabaseAnonKey
    );

    throw new Error("Configuration Supabase manquante");
  }

  const isClient = import.meta.client;

  const supabase = createClient<Database>(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
    {
      auth: {
        persistSession: isClient, // Persister seulement côté client
        autoRefreshToken: isClient,
        detectSessionInUrl: isClient,
        flowType: "pkce", // PKCE pour plus de sécurité
        storageKey: "supabase.auth.token",
        storage: isClient
          ? {
              getItem: (key: string) => {
                try {
                  return localStorage.getItem(key);
                } catch {
                  return null;
                }
              },
              setItem: (key: string, value: string) => {
                try {
                  localStorage.setItem(key, value);
                } catch {
                  // Échec silencieux si localStorage n'est pas disponible
                }
              },
              removeItem: (key: string) => {
                try {
                  localStorage.removeItem(key);
                } catch {
                  // Échec silencieux
                }
              },
            }
          : undefined,
      },
      global: {
        headers: {
          "x-client-info": "suivi-sante-ia-web",
        },
      },
      db: {
        schema: "public",
      },
    }
  );

  return {
    provide: {
      supabase,
    },
  };
});
