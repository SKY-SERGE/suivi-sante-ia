<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <!-- Contenu centré pour les pages d'authentification -->
    <div class="w-full max-w-md">
      <slot />
    </div>

    <!-- Logo en bas -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <NuxtLink to="/" class="flex items-center text-gray-500">
        <Icon name="lucide:heart-pulse" class="h-6 w-6 text-blue-600" />
        <span class="ml-2 text-sm">{{ config.public.appName }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
</script>
