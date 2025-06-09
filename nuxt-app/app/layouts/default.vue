<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <BaseAppHeader />

    <!-- Contenu principal -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <BaseAppFooter />

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
// Ce layout est utilisé pour les pages publiques (accueil, marketing, etc.)
const { notifications, removeNotification } = useNotifications();
</script>
