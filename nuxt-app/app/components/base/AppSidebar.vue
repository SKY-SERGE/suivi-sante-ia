<template>
  <aside
    class="bg-white shadow-sm border-r border-gray-200 h-full"
    :class="{
      'w-64': !isCollapsed,
      'w-16': isCollapsed,
    }"
  >
    <!-- Header de la sidebar -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div v-if="!isCollapsed" class="flex items-center">
          <Icon name="lucide:layout-dashboard" class="h-6 w-6 text-blue-600" />
          <span class="ml-2 font-semibold text-gray-900">Navigation</span>
        </div>
        <Button @click="toggleCollapse" variant="ghost" size="sm" class="p-2">
          <Icon
            :name="isCollapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'"
            class="h-4 w-4"
          />
        </Button>
      </div>
    </div>

    <!-- Menu de navigation -->
    <nav class="p-4">
      <ul class="space-y-2">
        <!-- Navigation commune -->
        <li>
          <NuxtLink
            to="/dashboard"
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="getNavLinkClass('/dashboard')"
          >
            <Icon name="lucide:home" class="h-5 w-5" />
            <span v-if="!isCollapsed" class="ml-3">Tableau de bord</span>
          </NuxtLink>
        </li>

        <!-- Navigation spécifique au patient -->
        <template v-if="userProfile?.role === 'patient'">
          <li>
            <NuxtLink
              to="/patient/health-data"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/patient/health-data')"
            >
              <Icon name="lucide:activity" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Mes Données</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/patient/goals"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/patient/goals')"
            >
              <Icon name="lucide:target" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Mes Objectifs</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/patient/meals"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/patient/meals')"
            >
              <Icon name="lucide:utensils" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Mes Repas</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/patient/chat"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/patient/chat')"
            >
              <Icon name="lucide:message-circle" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Chat IA</span>
            </NuxtLink>
          </li>
        </template>

        <!-- Navigation spécifique au médecin -->
        <template v-if="userProfile?.role === 'doctor'">
          <li>
            <NuxtLink
              to="/doctor/dashboard"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/doctor/dashboard')"
            >
              <Icon name="lucide:stethoscope" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Mes Patients</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/doctor/messages"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/doctor/messages')"
            >
              <Icon name="lucide:mail" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Messages</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/doctor/consents"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/doctor/consents')"
            >
              <Icon name="lucide:shield-check" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Consentements</span>
            </NuxtLink>
          </li>
        </template>

        <!-- Navigation spécifique à l'admin -->
        <template v-if="userProfile?.role === 'admin'">
          <li>
            <NuxtLink
              to="/admin/dashboard"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/admin/dashboard')"
            >
              <Icon name="lucide:settings" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Administration</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/admin/users"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/admin/users')"
            >
              <Icon name="lucide:users" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Utilisateurs</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/admin/statistics"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="getNavLinkClass('/admin/statistics')"
            >
              <Icon name="lucide:bar-chart" class="h-5 w-5" />
              <span v-if="!isCollapsed" class="ml-3">Statistiques</span>
            </NuxtLink>
          </li>
        </template>

        <!-- Séparateur -->
        <li class="pt-4 border-t border-gray-200">
          <NuxtLink
            to="/consents"
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="getNavLinkClass('/consents')"
          >
            <Icon name="lucide:file-check" class="h-5 w-5" />
            <span v-if="!isCollapsed" class="ml-3">Consentements</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/profile"
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="getNavLinkClass('/profile')"
          >
            <Icon name="lucide:user" class="h-5 w-5" />
            <span v-if="!isCollapsed" class="ml-3">Mon Profil</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Footer de la sidebar -->
    <div class="absolute bottom-4 left-4 right-4" v-if="!isCollapsed">
      <div class="bg-blue-50 rounded-lg p-3">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Icon name="lucide:lightbulb" class="h-5 w-5 text-blue-600" />
          </div>
          <div class="ml-3">
            <p class="text-xs text-blue-800">
              Astuce: Utilisez l'IA pour analyser vos habitudes alimentaires !
            </p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";

const { userProfile } = useUserProfile();
const route = useRoute();

// État de collapse de la sidebar
const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Fonction pour obtenir les classes CSS du lien de navigation
const getNavLinkClass = (path: string) => {
  const isActive =
    route.path === path ||
    (path !== "/dashboard" && route.path.startsWith(path));

  return isActive
    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
};

// Persister l'état de collapse dans le localStorage
onMounted(() => {
  const saved = localStorage.getItem("sidebar-collapsed");
  if (saved !== null) {
    isCollapsed.value = JSON.parse(saved);
  }
});

watch(isCollapsed, (newValue) => {
  localStorage.setItem("sidebar-collapsed", JSON.stringify(newValue));
});
</script>

<style scoped>
aside {
  transition: width 0.2s ease-in-out;
}
</style>
