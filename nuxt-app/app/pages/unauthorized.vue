<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 text-red-600">
          <svg
            class="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Accès non autorisé
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
      </div>

      <div class="space-y-4">
        <NuxtLink
          to="/dashboard"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Retour au tableau de bord
        </NuxtLink>

        <NuxtLink
          to="/auth/login"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Se reconnecter
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pas de middleware requis pour cette page
const { isAuthenticated } = useAuth();
</script>
