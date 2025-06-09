<template>
  <div class="container mx-auto py-8">
    <UiCard class="max-w-md mx-auto">
      <UiCardHeader>
        <UiCardTitle>Test Configuration</UiCardTitle>
        <UiCardDescription
          >Vérifiez que tous les services fonctionnent</UiCardDescription
        >
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <UiButton @click="testToast" class="w-full">
          Tester les Toasts
        </UiButton>

        <UiButton @click="testSupabase" class="w-full" variant="outline">
          Tester Supabase
        </UiButton>

        <div v-if="supabaseStatus" class="text-sm p-2 rounded border">
          <strong>Status Supabase:</strong> {{ supabaseStatus }}
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner";

const supabaseStatus = ref("");

const testToast = () => {
  try {
    const toastStore = useToastStore();

    toastStore.addToast({
      title: "Test Toast Store",
      description: "Ceci est un toast via le store",
      variant: "success",
    });

    toastStore.success("Toast store fonctionne !");

    toast.info("Toast direct", {
      description: "Les deux méthodes fonctionnent",
    });
  } catch (error) {
    console.error("Erreur toast:", error);
    toast.error("Erreur", { description: "Problème avec le toast" });
  }
};

const testSupabase = async () => {
  try {
    const supabase = useSupabase();
    supabaseStatus.value = "✅ Connexion réussie";

    // Test simple
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      supabaseStatus.value = `⚠️ Erreur: ${error.message}`;
    } else {
      supabaseStatus.value = "✅ Supabase fonctionne correctement";
    }

    toast.success("Test Supabase", {
      description: "Vérifiez le status ci-dessous",
    });
  } catch (error) {
    console.error("Erreur Supabase:", error);
    supabaseStatus.value = `❌ Erreur: ${
      error instanceof Error ? error.message : "Inconnue"
    }`;
    toast.error("Erreur Supabase", {
      description: "Voir console pour détails",
    });
  }
};
</script>
