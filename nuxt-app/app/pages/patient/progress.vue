<template>
  <div class="container mx-auto p-6">
    <!-- En-tête -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Suivi des progrès</h1>
          <p class="mt-2 text-gray-600">
            Analyse détaillée de vos progrès par rapport à vos objectifs de
            santé
          </p>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/patient/goals">
            <Button variant="outline" class="flex items-center gap-2">
              <Icon name="lucide:target" class="h-4 w-4" />
              Gérer les objectifs
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
        <NuxtLink to="/patient/history">
          <Button variant="ghost" size="sm" class="flex items-center gap-2">
            <Icon name="lucide:clock" class="h-4 w-4" />
            Historique
          </Button>
        </NuxtLink>
        <Button
          variant="ghost"
          size="sm"
          class="flex items-center gap-2 bg-green-50 text-green-700"
        >
          <Icon name="lucide:trending-up" class="h-4 w-4" />
          Suivi des progrès
        </Button>
        <NuxtLink to="/patient/goals">
          <Button variant="ghost" size="sm" class="flex items-center gap-2">
            <Icon name="lucide:target" class="h-4 w-4" />
            Objectifs
          </Button>
        </NuxtLink>
      </div>
    </div>

    <!-- Composant de suivi des progrès -->
    <Card class="p-6">
      <ProgressTracker />
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
});
</script>
