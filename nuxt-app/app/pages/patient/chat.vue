<template>
  <div class="container mx-auto p-6">
    <Alert variant="default">
      <AlertTriangle class="w-4 h-4" />
      <AlertTitle>Maintenance</AlertTitle>
      <AlertDescription>
        Cette fonctionnalité est actuellement en cours de développement.
      </AlertDescription>
    </Alert>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from "lucide-vue-next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Configuration de la page
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
  auth: true,
  roles: ["patient"],
});

onMounted(() => {
  navigateTo("/patient/chatbot", {
    replace: true,
  });
});
</script>
