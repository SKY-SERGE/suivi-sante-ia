<template>
  <div class="container mx-auto p-6">
    <!-- En-tête -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Historique de santé</h1>
          <p class="mt-2 text-gray-600">
            Vue chronologique de toutes vos données de santé
          </p>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/patient/health-data">
            <Button variant="outline" class="flex items-center gap-2">
              <Icon name="lucide:plus" class="h-4 w-4" />
              Ajouter des données
            </Button>
          </NuxtLink>
          <NuxtLink to="/patient/dashboard">
            <Button class="flex items-center gap-2">
              <Icon name="lucide:arrow-left" class="h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Navigation rapide -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/patient/health-overview">
          <Button variant="ghost" size="sm" class="flex items-center gap-2">
            <Icon name="lucide:bar-chart-3" class="h-4 w-4" />
            Vue d'ensemble
          </Button>
        </NuxtLink>
        <NuxtLink to="/patient/dashboard">
          <Button variant="ghost" size="sm" class="flex items-center gap-2">
            <Icon name="lucide:gauge" class="h-4 w-4" />
            Tableau de bord
          </Button>
        </NuxtLink>
        <Button
          variant="ghost"
          size="sm"
          class="flex items-center gap-2 bg-blue-50 text-blue-700"
        >
          <Icon name="lucide:clock" class="h-4 w-4" />
          Historique chronologique
        </Button>
        <NuxtLink to="/patient/goals">
          <Button variant="ghost" size="sm" class="flex items-center gap-2">
            <Icon name="lucide:target" class="h-4 w-4" />
            Objectifs
          </Button>
        </NuxtLink>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card class="p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <Icon name="lucide:calendar" class="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Entrées totales</p>
            <p class="text-xl font-semibold text-gray-900">
              {{ totalEntries }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
          >
            <Icon name="lucide:trending-up" class="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Cette semaine</p>
            <p class="text-xl font-semibold text-gray-900">{{ weekEntries }}</p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
          >
            <Icon name="lucide:activity" class="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Types de données</p>
            <p class="text-xl font-semibold text-gray-900">
              {{ uniqueMetrics }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
          >
            <Icon name="lucide:calendar-days" class="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Dernière entrée</p>
            <p class="text-xl font-semibold text-gray-900">
              {{ lastEntryDays }}
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Composant Timeline -->
    <Card class="p-6">
      <HealthTimeline />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { HealthTimeline } from "#components";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
});

const { $supabase } = useNuxtApp();

// État réactif pour les statistiques
const totalEntries = ref(0);
const weekEntries = ref(0);
const uniqueMetrics = ref(0);
const lastEntryDays = ref("N/A");

// Chargement des statistiques
const loadStats = async () => {
  try {
    const user = await $supabase.auth.getUser();
    if (!user.data.user) return;

    // Total des entrées
    const { count: total } = await $supabase
      .from("health_data")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.data.user.id);

    totalEntries.value = total || 0;

    // Entrées de cette semaine
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { count: week } = await $supabase
      .from("health_data")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.data.user.id)
      .gte("recorded_at", weekAgo.toISOString());

    weekEntries.value = week || 0;

    // Types de métriques uniques
    const { data: metrics } = await $supabase
      .from("health_data")
      .select("metric_type")
      .eq("user_id", user.data.user.id);

    if (metrics) {
      const unique = new Set(metrics.map((m) => m.metric_type));
      uniqueMetrics.value = unique.size;
    }

    // Dernière entrée
    const { data: lastEntry } = await $supabase
      .from("health_data")
      .select("recorded_at")
      .eq("user_id", user.data.user.id)
      .order("recorded_at", { ascending: false })
      .limit(1);

    if (lastEntry && lastEntry.length > 0 && lastEntry[0]) {
      const lastDate = new Date(lastEntry[0].recorded_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        lastEntryDays.value = "Hier";
      } else if (diffDays === 0) {
        lastEntryDays.value = "Aujourd'hui";
      } else {
        lastEntryDays.value = `Il y a ${diffDays}j`;
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
  }
};

// Lifecycle
onMounted(() => {
  loadStats();
});
</script>
