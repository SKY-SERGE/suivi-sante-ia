<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <BaseAppHeader />

    <!-- Contenu principal avec sidebar -->
    <div class="flex h-full">
      <!-- Sidebar -->
      <BaseAppSidebar />

      <!-- Zone de contenu principal -->
      <main class="flex-1 overflow-auto">
        <!-- Breadcrumbs -->
        <BaseAppBreadcrumbs>
          <template #actions>
            <slot name="breadcrumb-actions" />
          </template>
        </BaseAppBreadcrumbs>

        <!-- Contenu de la page -->
        <div class="h-full">
          <slot />
        </div>
      </main>
    </div>

    <!-- Actions rapides flottantes -->
    <BaseAppQuickActions />

    <!-- Système de notifications -->
    <BaseAppNotification
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @dismiss="removeNotification"
    />
  </div>
</template>

<script setup lang="ts">
// Ce layout est utilisé pour les pages de dashboard avec navigation latérale
const { notifications, removeNotification } = useNotifications();
</script>
