<template>
  <div class="container mx-auto p-6">
    <!-- Skip link for accessibility -->
    <SkipLink href="#main-content" />

    <!-- En-tête de la page avec structure sémantique -->
    <header class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Tableau de bord de santé
          </h1>
          <p class="mt-2 text-gray-600">
            Vue d'ensemble complète de vos données de santé et objectifs
          </p>
        </div>
        <div class="flex gap-3" role="group" aria-label="Actions rapides">
          <NuxtLink to="/patient/health-data">
            <Button
              variant="outline"
              class="flex items-center gap-2"
              aria-label="Saisir de nouvelles données de santé"
            >
              <Icon name="lucide:plus" class="h-4 w-4" aria-hidden="true" />
              Saisir des données
            </Button>
          </NuxtLink>
          <NuxtLink to="/patient/goals">
            <Button
              class="flex items-center gap-2"
              aria-label="Gérer vos objectifs de santé"
            >
              <Icon name="lucide:target" class="h-4 w-4" aria-hidden="true" />
              Gérer mes objectifs
            </Button>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Navigation rapide avec landmarks -->
    <nav class="mb-6" aria-label="Navigation rapide du tableau de bord">
      <div class="flex flex-wrap gap-3" role="menubar">
        <NuxtLink to="/patient/health-overview">
          <Button
            variant="ghost"
            size="sm"
            class="flex items-center gap-2"
            role="menuitem"
            aria-label="Accéder à la vue d'ensemble de santé"
          >
            <Icon
              name="lucide:bar-chart-3"
              class="h-4 w-4"
              aria-hidden="true"
            />
            Vue d'ensemble
          </Button>
        </NuxtLink>
        <Button
          variant="ghost"
          size="sm"
          class="flex items-center gap-2 bg-blue-50 text-blue-700"
          role="menuitem"
          aria-current="page"
          aria-label="Page actuelle : Tableau de bord complet"
        >
          <Icon name="lucide:gauge" class="h-4 w-4" aria-hidden="true" />
          Tableau de bord complet
        </Button>
        <NuxtLink to="/patient/goals">
          <Button
            variant="ghost"
            size="sm"
            class="flex items-center gap-2"
            role="menuitem"
            aria-label="Gérer vos objectifs de santé"
          >
            <Icon name="lucide:target" class="h-4 w-4" aria-hidden="true" />
            Objectifs
          </Button>
        </NuxtLink>
        <NuxtLink to="/patient/history">
          <Button
            variant="ghost"
            size="sm"
            class="flex items-center gap-2"
            role="menuitem"
            aria-label="Consulter l'historique de santé"
          >
            <Icon name="lucide:clock" class="h-4 w-4" aria-hidden="true" />
            Historique
          </Button>
        </NuxtLink>
        <NuxtLink to="/patient/progress">
          <Button
            variant="ghost"
            size="sm"
            class="flex items-center gap-2"
            role="menuitem"
            aria-label="Suivre vos progrès de santé"
          >
            <Icon
              name="lucide:trending-up"
              class="h-4 w-4"
              aria-hidden="true"
            />
            Suivi des progrès
          </Button>
        </NuxtLink>
        <NuxtLink to="/patient/messages">
          <Button
            variant="ghost"
            size="sm"
            class="flex items-center gap-2"
            role="menuitem"
            aria-label="Consulter vos messages"
          >
            <Icon
              name="lucide:message-circle"
              class="h-4 w-4"
              aria-hidden="true"
            />
            Messages
          </Button>
        </NuxtLink>
        <NuxtLink to="/patient/chatbot">
          <Button
            variant="ghost"
            size="sm"
            class="flex items-center gap-2"
            role="menuitem"
            aria-label="Utiliser l'assistant santé IA"
          >
            <Icon name="lucide:bot" class="h-4 w-4" aria-hidden="true" />
            Assistant Santé IA
          </Button>
        </NuxtLink>
      </div>
    </nav>

    <!-- Contenu principal avec landmark -->
    <main id="main-content" role="main">
      <!-- Message d'état avec meilleure accessibilité -->
      <div
        v-if="pending"
        class="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
      >
        <div class="text-center">
          <Icon
            name="lucide:loader-2"
            class="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600"
            aria-hidden="true"
          />
          <p class="text-gray-600">Chargement de vos données de santé...</p>
        </div>
      </div>

      <div
        v-else-if="error"
        class="text-center py-12"
        role="alert"
        aria-live="assertive"
      >
        <Card class="max-w-md mx-auto">
          <CardContent class="pt-6">
            <Icon
              name="lucide:alert-circle"
              class="h-12 w-12 text-red-500 mx-auto mb-4"
              aria-hidden="true"
            />
            <h2 class="text-lg font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h2>
            <p class="text-gray-600 mb-4">
              Impossible de charger vos données de santé.
            </p>
            <Button @click="refresh()" class="flex items-center gap-2 mx-auto">
              <Icon name="lucide:refresh-cw" class="h-4 w-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Composant principal du tableau de bord -->
      <div v-else>
        <HealthDashboard
          :health-data="healthData"
          :goals="goals"
          @refresh="refresh"
        />
      </div>

      <!-- Actions rapides en bas de page -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink to="/patient/health-data">
            <Button variant="outline" size="sm" class="flex items-center gap-2">
              <Icon name="lucide:activity" class="h-4 w-4" />
              Activité physique
            </Button>
          </NuxtLink>
          <NuxtLink to="/patient/health-data">
            <Button variant="outline" size="sm" class="flex items-center gap-2">
              <Icon name="lucide:moon" class="h-4 w-4" />
              Sommeil
            </Button>
          </NuxtLink>
          <NuxtLink to="/patient/health-data">
            <Button variant="outline" size="sm" class="flex items-center gap-2">
              <Icon name="lucide:smile" class="h-4 w-4" />
              Humeur
            </Button>
          </NuxtLink>
          <NuxtLink to="/patient/health-data">
            <Button variant="outline" size="sm" class="flex items-center gap-2">
              <Icon name="lucide:heart" class="h-4 w-4" />
              Signes vitaux
            </Button>
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Database } from "~/types/database";

// Types
type HealthData = Database["public"]["Tables"]["health_data"]["Row"];
type HealthGoal = Database["public"]["Tables"]["health_goals"]["Row"];

// Configuration de la page
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
  auth: true,
  roles: ["patient"],
});

// Composables
const { $supabase } = useNuxtApp();
const { user } = useSupabaseUser();

// États réactifs
const pending = ref(true);
const error = ref<string | null>(null);
const healthData = ref<HealthData[]>([]);
const goals = ref<HealthGoal[]>([]);

// Fonction de chargement des données
const loadData = async () => {
  try {
    pending.value = true;
    error.value = null;

    const currentUser = unref(user);
    if (!currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    // Charger les données de santé
    const { data: healthDataResponse, error: healthError } = await $supabase
      .from("health_data")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (healthError) {
      throw new Error(
        `Erreur lors du chargement des données de santé: ${healthError.message}`
      );
    }

    // Charger les objectifs
    const { data: goalsResponse, error: goalsError } = await $supabase
      .from("health_goals")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (goalsError) {
      throw new Error(
        `Erreur lors du chargement des objectifs: ${goalsError.message}`
      );
    }

    healthData.value = (healthDataResponse || []) as HealthData[];
    goals.value = (goalsResponse || []) as HealthGoal[];
  } catch (err) {
    console.error("Erreur de chargement:", err);
    error.value =
      err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
  } finally {
    pending.value = false;
  }
};

// Fonction de rafraîchissement
const refresh = () => {
  loadData();
};

// Chargement initial
onMounted(() => {
  loadData();
});

// Actualisation automatique périodique (optionnelle)
const refreshInterval = setInterval(() => {
  if (!pending.value) {
    loadData();
  }
}, 5 * 60 * 1000); // Actualise toutes les 5 minutes

// Nettoyage de l'intervalle
onUnmounted(() => {
  clearInterval(refreshInterval);
});

// Meta informations pour la page
useHead({
  title: "Tableau de bord de santé - Suivi Santé IA",
  meta: [
    {
      name: "description",
      content:
        "Tableau de bord complet pour le suivi de votre santé avec visualisations avancées et suivi des objectifs.",
    },
  ],
});
</script>
