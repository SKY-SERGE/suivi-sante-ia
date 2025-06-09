import { toast } from "vue-sonner";

export default defineNuxtPlugin(() => {
  if (process.client) {
    // Vérifier que vue-sonner est correctement initialisé
    console.log("🔔 Plugin toast initialisé");

    // Fournir une méthode globale pour tester les toasts
    (globalThis as any).$testToast = () => {
      toast.success("Test", {
        description: "Le système de toast fonctionne !",
      });
    };
  }
});
