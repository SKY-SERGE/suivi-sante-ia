<script setup lang="ts">
const user = useSupabaseUser();
const { redirectToDashboard } = useAuth();

watch(
  user,
  () => {
    if (user.value) {
      // Redirect to dashboard page
      return redirectToDashboard();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>En attente de connexion...</div>
</template>
