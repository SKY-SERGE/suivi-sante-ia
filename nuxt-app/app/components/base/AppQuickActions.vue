<template>
  <!-- Overlay pour fermer le menu -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-20 z-40"
    @click="closeMenu"
  />

  <!-- Menu flottant -->
  <div
    v-if="isOpen"
    class="fixed bottom-20 right-6 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4"
    role="dialog"
    aria-label="Menu d'actions rapides"
    aria-modal="true"
  >
    <h3 class="text-sm font-semibold text-gray-900 mb-3">Actions rapides</h3>

    <div class="space-y-2">
      <template v-for="action in availableActions" :key="action.key">
        <button
          @click="executeAction(action)"
          class="w-full flex items-center p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          :class="action.danger ? 'hover:bg-red-50 hover:text-red-700' : ''"
        >
          <Icon
            :name="action.icon"
            class="h-4 w-4 mr-3"
            :class="action.danger ? 'text-red-500' : 'text-gray-500'"
          />
          <div>
            <div class="font-medium">{{ action.title }}</div>
            <div v-if="action.description" class="text-xs text-gray-500">
              {{ action.description }}
            </div>
          </div>
          <div v-if="action.shortcut" class="ml-auto text-xs text-gray-400">
            {{ action.shortcut }}
          </div>
        </button>
      </template>
    </div>
  </div>

  <!-- Bouton flottant -->
  <button
    @click="toggleMenu"
    class="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 z-30 flex items-center justify-center"
    :class="isOpen ? 'rotate-45' : 'hover:scale-105'"
    aria-label="Menu d'actions rapides"
    :aria-expanded="isOpen"
  >
    <Icon name="lucide:plus" class="h-6 w-6" />
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface QuickAction {
  key: string;
  title: string;
  description?: string;
  icon: string;
  action: () => void;
  shortcut?: string;
  danger?: boolean;
}

const isOpen = ref(false);
const route = useRoute();
const router = useRouter();
const { userProfile } = useUserProfile();

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const executeAction = (action: QuickAction) => {
  action.action();
  closeMenu();
};

// Actions disponibles selon le contexte et le rôle
const availableActions = computed<QuickAction[]>(() => {
  const role = userProfile.value?.role || "patient";
  const currentPath = route.path;

  const commonActions: QuickAction[] = [
    {
      key: "profile",
      title: "Mon profil",
      description: "Voir et modifier mon profil",
      icon: "lucide:user",
      action: () => router.push("/profile"),
      shortcut: "Ctrl+P",
    },
    {
      key: "messages",
      title: "Messages",
      description: "Accéder à la messagerie",
      icon: "lucide:message-square",
      action: () => router.push(`/${role}/messages`),
      shortcut: "Ctrl+M",
    },
  ];

  if (role === "patient") {
    const patientActions: QuickAction[] = [
      {
        key: "add-health-data",
        title: "Saisir données",
        description: "Ajouter des données de santé",
        icon: "lucide:plus-circle",
        action: () => router.push("/patient/health-data?mode=add"),
        shortcut: "Ctrl+N",
      },
      {
        key: "take-photo",
        title: "Photo de repas",
        description: "Analyser un repas par photo",
        icon: "lucide:camera",
        action: () => router.push("/patient/meals?mode=photo"),
      },
      {
        key: "chat-ai",
        title: "Assistant IA",
        description: "Poser une question à l'IA",
        icon: "lucide:bot",
        action: () => router.push("/patient/chat"),
        shortcut: "Ctrl+I",
      },
      {
        key: "dashboard",
        title: "Tableau de bord",
        description: "Retour au dashboard",
        icon: "lucide:home",
        action: () => router.push("/patient/dashboard"),
        shortcut: "Ctrl+H",
      },
    ];

    return [...patientActions, ...commonActions];
  }

  if (role === "doctor") {
    const doctorActions: QuickAction[] = [
      {
        key: "patients",
        title: "Mes patients",
        description: "Liste de mes patients",
        icon: "lucide:users",
        action: () => router.push("/doctor/patients"),
        shortcut: "Ctrl+U",
      },
      {
        key: "appointments",
        title: "Rendez-vous",
        description: "Gérer les rendez-vous",
        icon: "lucide:calendar",
        action: () => router.push("/doctor/appointments"),
      },
      {
        key: "dashboard",
        title: "Tableau de bord",
        description: "Retour au dashboard",
        icon: "lucide:home",
        action: () => router.push("/doctor/dashboard"),
        shortcut: "Ctrl+H",
      },
    ];

    return [...doctorActions, ...commonActions];
  }

  if (role === "admin") {
    const adminActions: QuickAction[] = [
      {
        key: "users-management",
        title: "Gestion utilisateurs",
        description: "Gérer les utilisateurs",
        icon: "lucide:users",
        action: () => router.push("/admin/users"),
        shortcut: "Ctrl+U",
      },
      {
        key: "system-settings",
        title: "Paramètres système",
        description: "Configuration système",
        icon: "lucide:settings",
        action: () => router.push("/admin/system"),
      },
      {
        key: "security",
        title: "Sécurité",
        description: "Paramètres de sécurité",
        icon: "lucide:shield",
        action: () => router.push("/admin/security"),
      },
      {
        key: "dashboard",
        title: "Tableau de bord",
        description: "Retour au dashboard",
        icon: "lucide:home",
        action: () => router.push("/admin/dashboard"),
        shortcut: "Ctrl+H",
      },
    ];

    return [...adminActions, ...commonActions];
  }

  return commonActions;
});

// Gestion des raccourcis clavier
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    const action = availableActions.value.find(
      (a) => a.shortcut === `Ctrl+${event.key.toUpperCase()}`
    );

    if (action) {
      event.preventDefault();
      executeAction(action);
    }
  }

  // Escape pour fermer le menu
  if (event.key === "Escape") {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
