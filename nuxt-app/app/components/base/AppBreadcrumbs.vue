<template>
  <nav
    class="flex px-4 py-3 bg-white border-b border-gray-200"
    aria-label="Fil d'Ariane"
    role="navigation"
  >
    <ol class="flex items-center space-x-2 text-sm">
      <li class="flex items-center">
        <NuxtLink
          to="/"
          class="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Retour à l'accueil"
        >
          <Icon name="lucide:home" class="h-4 w-4" />
        </NuxtLink>
      </li>

      <template
        v-for="(breadcrumb, index) in breadcrumbs"
        :key="breadcrumb.path"
      >
        <li class="flex items-center">
          <Icon
            name="lucide:chevron-right"
            class="h-4 w-4 text-gray-400 mx-2"
          />

          <NuxtLink
            v-if="index < breadcrumbs.length - 1"
            :to="breadcrumb.path"
            class="text-gray-500 hover:text-gray-700 transition-colors"
            :aria-label="`Aller à ${breadcrumb.title}`"
          >
            {{ breadcrumb.title }}
          </NuxtLink>

          <span v-else class="text-gray-900 font-medium" aria-current="page">
            {{ breadcrumb.title }}
          </span>
        </li>
      </template>
    </ol>

    <!-- Actions rapides -->
    <div class="ml-auto flex items-center space-x-2">
      <slot name="actions" />
    </div>
  </nav>
</template>

<script setup lang="ts">
interface Breadcrumb {
  title: string;
  path: string;
}

interface Props {
  items?: Breadcrumb[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

const route = useRoute();
const { userProfile } = useUserProfile();

// Génération automatique des breadcrumbs basés sur la route
const breadcrumbs = computed<Breadcrumb[]>(() => {
  if (props.items.length > 0) {
    return props.items;
  }

  const segments = route.path.split("/").filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [];

  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Mapping des segments vers des titres compréhensibles
    const titleMap: Record<string, string> = {
      patient: "Patient",
      doctor: "Médecin",
      admin: "Administration",
      dashboard: "Tableau de bord",
      "health-data": "Données de santé",
      meals: "Mes repas",
      goals: "Mes objectifs",
      chat: "Assistant IA",
      messages: "Messages",
      consents: "Consentements",
      users: "Utilisateurs",
      statistics: "Statistiques",
      profile: "Mon profil",
      auth: "Authentification",
      login: "Connexion",
      register: "Inscription",
      "security-tests": "Tests de sécurité",
    };

    const title =
      titleMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    breadcrumbs.push({
      title,
      path: currentPath,
    });
  }

  return breadcrumbs;
});
</script>
