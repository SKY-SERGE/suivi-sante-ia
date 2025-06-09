<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center">
          <Icon name="lucide:heart-pulse" class="h-12 w-12 text-blue-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Nouveau mot de passe
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Saisissez votre nouveau mot de passe ci-dessous.
        </p>
      </div>

      <!-- Messages de succès/erreur -->
      <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
        <div class="flex">
          <Icon name="lucide:check-circle" class="h-5 w-5 text-green-400" />
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">
              {{ successMessage }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <Icon name="lucide:alert-circle" class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="resetPassword" class="mt-8 space-y-6">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Nouveau mot de passe
          </label>
          <div class="mt-1 relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-300': errors.password }"
              placeholder="Nouveau mot de passe"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Icon
                :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                class="h-5 w-5 text-gray-400"
              />
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">
            {{ errors.password }}
          </p>
          <p class="mt-1 text-sm text-gray-500">
            Le mot de passe doit contenir au moins 8 caractères.
          </p>
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-700"
          >
            Confirmer le mot de passe
          </label>
          <div class="mt-1 relative">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-300': errors.confirmPassword }"
              placeholder="Confirmer le mot de passe"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Icon
                :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'"
                class="h-5 w-5 text-gray-400"
              />
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <div>
          <Button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Icon
              v-if="isLoading"
              name="lucide:loader-2"
              class="h-4 w-4 mr-2 animate-spin"
            />
            {{ isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe" }}
          </Button>
        </div>

        <div class="text-center">
          <NuxtLink
            to="/auth/login"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            Retour à la connexion
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

// Middleware et meta
definePageMeta({
  title: "Nouveau mot de passe",
  middleware: "guest",
});

// Composables
const { supabase } = useSupabaseUser();
const route = useRoute();
const router = useRouter();

// État réactif
const isLoading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errors = reactive<Record<string, string>>({});

// Formulaire
const form = reactive({
  password: "",
  confirmPassword: "",
});

// Validation du formulaire
const validateForm = (): boolean => {
  // Reset des erreurs
  Object.keys(errors).forEach((key) => delete errors[key]);

  let isValid = true;

  // Validation du mot de passe
  if (!form.password) {
    errors.password = "Le mot de passe est requis";
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    isValid = false;
  }

  // Validation de la confirmation
  if (!form.confirmPassword) {
    errors.confirmPassword = "La confirmation du mot de passe est requise";
    isValid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
    isValid = false;
  }

  return isValid;
};

// Réinitialiser le mot de passe
const resetPassword = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { error } = await supabase.auth.updateUser({
      password: form.password,
    });

    if (error) {
      errorMessage.value =
        "Erreur lors de la mise à jour du mot de passe: " + error.message;
    } else {
      successMessage.value = "Mot de passe mis à jour avec succès !";

      // Redirection après un délai
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
  } catch (error: any) {
    errorMessage.value = "Une erreur inattendue est survenue: " + error.message;
  } finally {
    isLoading.value = false;
  }
};

// Vérifier la session au montage
onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Pas de session, rediriger vers la connexion
    await router.push("/auth/login");
  }
});
</script>
