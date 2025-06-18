<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <NuxtLink to="/patient/health-overview" class="block">
      <UiButton class="justify-start h-auto p-4 w-full" variant="outline">
        <div class="text-left">
          <Icon name="lucide:bar-chart-3" class="h-5 w-5 mb-2" />
          <div class="font-medium">Vue d'ensemble</div>
          <div class="text-sm text-gray-500">Graphiques et tendances</div>
        </div>
      </UiButton>
    </NuxtLink>

    <NuxtLink to="/patient/dashboard" class="block">
      <UiButton class="justify-start h-auto p-4 w-full" variant="outline">
        <div class="text-left">
          <Icon name="lucide:gauge" class="h-5 w-5 mb-2" />
          <div class="font-medium">Tableau de bord complet</div>
          <div class="text-sm text-gray-500">Analyses avancées et insights</div>
        </div>
      </UiButton>
    </NuxtLink>

    <NuxtLink to="/patient/health-data" class="block">
      <UiButton class="justify-start h-auto p-4 w-full" variant="outline">
        <div class="text-left">
          <Icon name="lucide:plus" class="h-5 w-5 mb-2" />
          <div class="font-medium">Saisir des données</div>
          <div class="text-sm text-gray-500">Humeur, sommeil, activité...</div>
        </div>
      </UiButton>
    </NuxtLink>
    <NuxtLink to="/patient/goals" class="block">
      <UiButton class="justify-start h-auto p-4 w-full" variant="outline">
        <div class="text-left">
          <Icon name="lucide:target" class="h-5 w-5 mb-2" />
          <div class="font-medium">Mes objectifs</div>
          <div class="text-sm text-gray-500">
            Définir et suivre vos objectifs
          </div>
        </div>
      </UiButton>
    </NuxtLink>
    <NuxtLink to="/patient/meals" class="block">
      <UiButton class="justify-start h-auto p-4 w-full" variant="outline">
        <div class="text-left">
          <Icon name="lucide:camera" class="h-5 w-5 mb-2" />
          <div class="font-medium">Photo repas</div>
          <div class="text-sm text-gray-500">Analyser vos repas par IA</div>
        </div>
      </UiButton>
    </NuxtLink>

    <NuxtLink to="/consents" class="block">
      <UiButton class="justify-start h-auto p-4 w-full" variant="outline">
        <div class="text-left">
          <Icon name="lucide:shield-check" class="h-5 w-5 mb-2" />
          <div class="font-medium">Mes consentements</div>
          <div class="text-sm text-gray-500">Gérer l'accès à mes données</div>
        </div>
      </UiButton>
    </NuxtLink>
  </div>
</template>
