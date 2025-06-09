import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@pinia/nuxt",
    "shadcn-nuxt",
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    // Private keys are only available on the server
    googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,
    googleVisionProjectId: process.env.GOOGLE_VISION_PROJECT_ID,
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
    // Clé secrète pour CSRF protection
    csrfSecret:
      process.env.NUXT_CSRF_SECRET || "default-secret-change-in-production",

    // Public keys that are exposed to the client
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || "Suivi Santé IA",
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      // Suppression des indicateurs d'API pour éviter l'exposition d'informations sensibles
      // Les fonctionnalités seront détectées côté serveur uniquement
    },
  },

  css: ["~/assets/css/tailwind.css", "~/assets/css/app.css"],

  app: {
    head: {
      title: "Suivi Santé IA",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Suivi Santé IA - Votre assistant santé intelligent",
        },
        // Content Security Policy pour la sécurité
        {
          "http-equiv": "Content-Security-Policy",
          content:
            "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://*.supabase.in https://vision.googleapis.com https://generativelanguage.googleapis.com; frame-ancestors 'none';",
        },
        // Headers de sécurité additionnels
        { "http-equiv": "X-Content-Type-Options", content: "nosniff" },
        { "http-equiv": "X-Frame-Options", content: "DENY" },
        { "http-equiv": "X-XSS-Protection", content: "1; mode=block" },
        {
          "http-equiv": "Referrer-Policy",
          content: "strict-origin-when-cross-origin",
        },
        {
          "http-equiv": "Permissions-Policy",
          content: "camera=(), microphone=(), geolocation=()",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    },
  },
});
