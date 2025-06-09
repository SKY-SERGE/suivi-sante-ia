<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <UiButton class="justify-start h-auto p-4" variant="outline">
      <div class="text-left">
        <Icon name="lucide:settings" class="h-5 w-5 mb-2" />
        <div class="font-medium">Gestion utilisateurs</div>
        <div class="text-sm text-gray-500">Administrer les comptes</div>
      </div>
    </UiButton>

    <UiButton class="justify-start h-auto p-4" variant="outline">
      <div class="text-left">
        <Icon name="lucide:bar-chart" class="h-5 w-5 mb-2" />
        <div class="font-medium">Statistiques</div>
        <div class="text-sm text-gray-500">Tableau de bord plateforme</div>
      </div>
    </UiButton>

    <UiButton class="justify-start h-auto p-4" variant="outline">
      <div class="text-left">
        <Icon name="lucide:shield" class="h-5 w-5 mb-2" />
        <div class="font-medium">Sécurité</div>
        <div class="text-sm text-gray-500">Monitoring et alertes</div>
      </div>
    </UiButton>
  </div>
</template>
