// Script de vérification de la configuration Supabase
export default defineNuxtPlugin(() => {
  if (process.client) {
    const config = useRuntimeConfig();

    console.log("🔧 Vérification de la configuration Supabase:");
    console.log(
      "URL:",
      config.public.supabaseUrl ? "✅ Configurée" : "❌ Manquante"
    );
    console.log(
      "Anon Key:",
      config.public.supabaseAnonKey ? "✅ Configurée" : "❌ Manquante"
    );

    if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
      console.warn(
        "⚠️  Configuration Supabase incomplète. Consultez .env.example"
      );
    }
  }
});
