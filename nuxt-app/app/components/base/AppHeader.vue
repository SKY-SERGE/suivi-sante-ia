<template>
  <header class="bg-white shadow-sm border-b sticky top-0 z-50" role="banner">
    <nav
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div class="flex justify-between h-16">
        <!-- Logo et titre -->
        <div class="flex items-center">
          <NuxtLink
            to="/"
            class="flex items-center"
            aria-label="Accueil - Suivi Santé IA"
          >
            <Icon
              name="lucide:heart-pulse"
              class="h-8 w-8 text-blue-600"
              aria-hidden="true"
            />
            <span class="ml-2 text-xl font-bold text-gray-900">
              Suivi Santé IA
            </span>
          </NuxtLink>
        </div>

        <!-- Navigation principale -->
        <div class="hidden md:flex items-center space-x-6" role="menubar">
          <template v-if="!user">
            <!-- Navigation publique -->
            <NuxtLink
              to="/#features"
              class="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
              role="menuitem"
              aria-describedby="features-description"
            >
              Fonctionnalités
            </NuxtLink>
            <span id="features-description" class="sr-only">
              Découvrir les fonctionnalités de l'application
            </span>

            <NuxtLink
              to="/#about"
              class="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
              role="menuitem"
              aria-describedby="about-description"
            >
              À propos
            </NuxtLink>
            <span id="about-description" class="sr-only">
              En savoir plus sur notre mission
            </span>
          </template>

          <template v-else>
            <!-- Navigation authentifiée -->
            <NuxtLink
              to="/dashboard"
              class="text-gray-600 hover:text-gray-900 transition-colors"
              :class="{
                'text-blue-600 font-medium': $route.path === '/dashboard',
              }"
            >
              Tableau de bord
            </NuxtLink>

            <!-- Navigation spécifique au rôle -->
            <template v-if="userProfile?.role === 'doctor'">
              <NuxtLink
                to="/doctor/dashboard"
                class="text-gray-600 hover:text-gray-900 transition-colors"
                :class="{
                  'text-blue-600 font-medium':
                    $route.path.startsWith('/doctor'),
                }"
              >
                Mes Patients
              </NuxtLink>
            </template>

            <template v-if="userProfile?.role === 'admin'">
              <NuxtLink
                to="/admin/dashboard"
                class="text-gray-600 hover:text-gray-900 transition-colors"
                :class="{
                  'text-blue-600 font-medium': $route.path.startsWith('/admin'),
                }"
              >
                Administration
              </NuxtLink>
            </template>

            <NuxtLink
              to="/consents"
              class="text-gray-600 hover:text-gray-900 transition-colors"
              :class="{
                'text-blue-600 font-medium': $route.path === '/consents',
              }"
            >
              Consentements
            </NuxtLink>
          </template>
        </div>

        <!-- Actions utilisateur -->
        <div class="flex items-center space-x-4">
          <template v-if="!isAuthenticated">
            <!-- Boutons d'authentification -->
            <NuxtLink to="/auth/login">
              <Button variant="outline" size="sm">
                <Icon name="lucide:log-in" class="h-4 w-4 mr-2" />
                Se connecter
              </Button>
            </NuxtLink>
            <NuxtLink to="/auth/register">
              <Button size="sm" class="bg-blue-600 hover:bg-blue-700">
                <Icon name="lucide:user-plus" class="h-4 w-4 mr-2" />
                S'inscrire
              </Button>
            </NuxtLink>
          </template>

          <template v-else>
            <!-- Menu utilisateur authentifié -->
            <div class="flex items-center space-x-3">
              <span class="text-sm text-gray-700 hidden sm:block">
                Bonjour,
                {{
                  userProfile?.first_name ||
                  user?.user_metadata?.first_name ||
                  "Utilisateur"
                }}
                <span
                  v-if="userProfile?.role"
                  class="text-xs text-gray-500 block"
                >
                  {{ getRoleLabel(userProfile.role) }}
                </span>
              </span>

              <NuxtLink to="/profile">
                <Button variant="outline" size="sm">
                  <Icon name="lucide:user" class="h-4 w-4 mr-2" />
                  <span class="hidden sm:inline">Profil</span>
                </Button>
              </NuxtLink>

              <Button @click="handleSignOut" variant="outline" size="sm">
                <Icon name="lucide:log-out" class="h-4 w-4 mr-2" />
                <span class="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </template>

          <!-- Menu mobile -->
          <div class="md:hidden">
            <Button @click="toggleMobileMenu" variant="ghost" size="sm">
              <Icon name="lucide:menu" class="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Menu mobile -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-gray-200 py-4"
      >
        <div class="flex flex-col space-y-3">
          <template v-if="!isAuthenticated">
            <NuxtLink
              to="/#features"
              class="text-gray-600 hover:text-gray-900 px-2 py-1"
              @click="closeMobileMenu"
            >
              Fonctionnalités
            </NuxtLink>
            <NuxtLink
              to="/#about"
              class="text-gray-600 hover:text-gray-900 px-2 py-1"
              @click="closeMobileMenu"
            >
              À propos
            </NuxtLink>
          </template>

          <template v-else>
            <NuxtLink
              to="/espace"
              class="text-gray-600 hover:text-gray-900 px-2 py-1"
              @click="closeMobileMenu"
            >
              Espace Personnel
            </NuxtLink>

            <template v-if="userProfile?.role === 'doctor'">
              <NuxtLink
                to="/doctor/dashboard"
                class="text-gray-600 hover:text-gray-900 px-2 py-1"
                @click="closeMobileMenu"
              >
                Mes Patients
              </NuxtLink>
            </template>

            <template v-if="userProfile?.role === 'admin'">
              <NuxtLink
                to="/admin/dashboard"
                class="text-gray-600 hover:text-gray-900 px-2 py-1"
                @click="closeMobileMenu"
              >
                Administration
              </NuxtLink>
            </template>

            <NuxtLink
              to="/consents"
              class="text-gray-600 hover:text-gray-900 px-2 py-1"
              @click="closeMobileMenu"
            >
              Consentements
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";

const { user, isAuthenticated } = useSupabaseUser();
const { userProfile, getRoleLabel } = useUserProfile();
const toast = useToastStore();
const supabase = useSupabase();

// État du menu mobile
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Gestion de la déconnexion
const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    toast.success("Vous avez été déconnecté avec succès");
    await navigateTo("/auth/login");
  } catch (error: any) {
    console.error("Erreur lors de la déconnexion:", error);
    toast.error("Erreur lors de la déconnexion: " + error.message);
  }
};

// Fermer le menu mobile lors du changement de route
watch(
  () => useRoute().path,
  () => {
    closeMobileMenu();
  }
);
</script>
