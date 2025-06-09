<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo et description -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center mb-4">
            <Icon name="lucide:heart-pulse" class="h-8 w-8 text-blue-400" />
            <span class="ml-2 text-xl font-bold">Suivi Santé IA</span>
          </div>
          <p class="text-gray-400 mb-4">
            Une plateforme intelligente pour le suivi de santé personnalisé,
            facilitant la communication entre patients et médecins grâce à l'IA.
          </p>
          <p class="text-sm text-gray-500">
            Projet de fin d'études en Master IA - Démonstration technique
          </p>
        </div>

        <!-- Liens rapides -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Liens rapides</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                to="/"
                class="text-gray-400 hover:text-white transition-colors"
              >
                Accueil
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/#features"
                class="text-gray-400 hover:text-white transition-colors"
              >
                Fonctionnalités
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/#about"
                class="text-gray-400 hover:text-white transition-colors"
              >
                À propos
              </NuxtLink>
            </li>
            <li v-if="!user">
              <NuxtLink
                to="/auth/register"
                class="text-gray-400 hover:text-white transition-colors"
              >
                S'inscrire
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Support</h3>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-white transition-colors"
                @click.prevent="showContactInfo"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-white transition-colors"
                @click.prevent="showPrivacyInfo"
              >
                Confidentialité
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-white transition-colors"
                @click.prevent="showTermsInfo"
              >
                Conditions d'utilisation
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-white transition-colors"
                @click.prevent="showHelpInfo"
              >
                Aide
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Séparateur -->
      <div class="border-t border-gray-800 mt-8 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-400 text-sm">
            © {{ currentYear }} Suivi Santé IA. Tous droits réservés.
          </p>
          <div class="flex items-center space-x-4 mt-4 md:mt-0">
            <span class="text-sm text-gray-500">
              Propulsé par
              <span class="text-blue-400">Nuxt</span> et
              <span class="text-green-400">Supabase</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { user } = useSupabaseUser();
const toast = useToastStore();

// Année courante
const currentYear = new Date().getFullYear();

// Fonctions pour afficher les informations (placeholders)
const showContactInfo = () => {
  toast.info("Fonctionnalité de contact en cours de développement");
};

const showPrivacyInfo = () => {
  toast.info("Politique de confidentialité en cours de rédaction");
};

const showTermsInfo = () => {
  toast.info("Conditions d'utilisation en cours de rédaction");
};

const showHelpInfo = () => {
  toast.info("Centre d'aide en cours de développement");
};
</script>
