<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <UiButton class="justify-start h-auto p-4" variant="outline">
      <div class="text-left">
        <Icon name="lucide:users" class="h-5 w-5 mb-2" />
        <div class="font-medium">Mes patients</div>
        <div class="text-sm text-gray-500">Gérer vos patients</div>
      </div>
    </UiButton>

    <UiButton class="justify-start h-auto p-4" variant="outline">
      <div class="text-left">
        <Icon name="lucide:chart-line" class="h-5 w-5 mb-2" />
        <div class="font-medium">Analyses</div>
        <div class="text-sm text-gray-500">Consulter les données patients</div>
      </div>
    </UiButton>

    <UiButton class="justify-start h-auto p-4" variant="outline">
      <div class="text-left">
        <Icon name="lucide:message-circle" class="h-5 w-5 mb-2" />
        <div class="font-medium">Messages</div>
        <div class="text-sm text-gray-500">Communiquer avec vos patients</div>
      </div>
    </UiButton>
  </div>
</template>
