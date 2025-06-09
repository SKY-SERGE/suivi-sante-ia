<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Contenu principal -->
    <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="space-y-8">
        <!-- En-tête -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p class="mt-2 text-gray-600">
            Gérez vos informations personnelles et préférences de compte.
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

        <!-- Formulaire de profil -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">
              Informations personnelles
            </h2>
          </div>

          <form @submit.prevent="updateProfile" class="px-6 py-4 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Prénom -->
              <div>
                <label
                  for="firstName"
                  class="block text-sm font-medium text-gray-700"
                >
                  Prénom
                </label>
                <input
                  id="firstName"
                  v-model="profileForm.first_name"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.first_name }"
                />
                <p v-if="errors.first_name" class="mt-1 text-sm text-red-600">
                  {{ errors.first_name }}
                </p>
              </div>

              <!-- Nom -->
              <div>
                <label
                  for="lastName"
                  class="block text-sm font-medium text-gray-700"
                >
                  Nom
                </label>
                <input
                  id="lastName"
                  v-model="profileForm.last_name"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.last_name }"
                />
                <p v-if="errors.last_name" class="mt-1 text-sm text-red-600">
                  {{ errors.last_name }}
                </p>
              </div>

              <!-- Email (lecture seule) -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  :value="user?.email"
                  type="email"
                  readonly
                  class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm cursor-not-allowed"
                />
                <p class="mt-1 text-sm text-gray-500">
                  L'email ne peut pas être modifié depuis cette interface.
                </p>
              </div>

              <!-- Téléphone -->
              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-gray-700"
                >
                  Téléphone
                </label>
                <input
                  id="phone"
                  v-model="profileForm.phone"
                  type="tel"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.phone }"
                />
                <p v-if="errors.phone" class="mt-1 text-sm text-red-600">
                  {{ errors.phone }}
                </p>
              </div>

              <!-- Date de naissance -->
              <div>
                <label
                  for="birthDate"
                  class="block text-sm font-medium text-gray-700"
                >
                  Date de naissance
                </label>
                <input
                  id="birthDate"
                  v-model="profileForm.date_of_birth"
                  type="date"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.date_of_birth }"
                />
                <p
                  v-if="errors.date_of_birth"
                  class="mt-1 text-sm text-red-600"
                >
                  {{ errors.date_of_birth }}
                </p>
              </div>
            </div>

            <!-- Informations spécifiques au rôle -->
            <div v-if="userRole === 'doctor'" class="space-y-6">
              <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-medium text-gray-900">
                  Informations professionnelles
                </h3>
                <p class="text-sm text-gray-500">
                  Informations spécifiques aux médecins
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Spécialité -->
                <div>
                  <label
                    for="specialty"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Spécialité
                  </label>
                  <input
                    id="specialty"
                    v-model="profileForm.specialization"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <!-- Numéro de licence -->
                <div>
                  <label
                    for="licenseNumber"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Numéro de licence
                  </label>
                  <input
                    id="licenseNumber"
                    v-model="profileForm.medical_license"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div
              class="flex justify-end space-x-3 pt-6 border-t border-gray-200"
            >
              <Button
                type="button"
                variant="outline"
                @click="resetForm"
                :disabled="isLoading"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                :disabled="isLoading"
                class="flex items-center"
              >
                <Icon
                  v-if="isLoading"
                  name="lucide:loader-2"
                  class="h-4 w-4 mr-2 animate-spin"
                />
                {{ isLoading ? "Enregistrement..." : "Enregistrer" }}
              </Button>
            </div>
          </form>
        </div>

        <!-- Section changement de mot de passe -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Sécurité</h2>
          </div>

          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Mot de passe</h3>
                <p class="text-sm text-gray-500">
                  Modifiez votre mot de passe pour sécuriser votre compte.
                </p>
              </div>
              <Button @click="changePassword" variant="outline">
                Changer le mot de passe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

// Middleware et meta
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
  title: "Mon profil",
});

// Composables
const { user, userProfile, userRole, loadUserProfile } = useAuth();
const { updateProfile: updateUserProfile } = useUserProfile();
const supabase = useSupabase();

// État réactif
const isLoading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const errors = reactive<Record<string, string>>({});

// Formulaire de profil
const profileForm = reactive({
  first_name: "",
  last_name: "",
  phone: "",
  date_of_birth: "",
  // Champs spécifiques aux médecins
  specialization: "",
  medical_license: "",
});

// Initialiser le formulaire avec les données existantes
const initializeForm = () => {
  if (userProfile.value) {
    Object.assign(profileForm, {
      first_name: userProfile.value.first_name || "",
      last_name: userProfile.value.last_name || "",
      phone: userProfile.value.phone || "",
      date_of_birth: userProfile.value.date_of_birth || "",
      specialization: userProfile.value.specialization || "",
      medical_license: userProfile.value.medical_license || "",
    });
  }
};

// Validation du formulaire
const validateForm = (): boolean => {
  // Reset des erreurs
  Object.keys(errors).forEach((key) => delete errors[key]);

  let isValid = true;

  // Validation des champs requis
  if (!profileForm.first_name.trim()) {
    errors.first_name = "Le prénom est requis";
    isValid = false;
  }

  if (!profileForm.last_name.trim()) {
    errors.last_name = "Le nom est requis";
    isValid = false;
  }

  // Validation du téléphone (format français)
  if (
    profileForm.phone &&
    !/^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(profileForm.phone.replace(/\s/g, ""))
  ) {
    errors.phone = "Format de téléphone invalide";
    isValid = false;
  }
  // Validation de la date de naissance
  if (profileForm.date_of_birth) {
    const birthDate = new Date(profileForm.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 0 || age > 150) {
      errors.date_of_birth = "Date de naissance invalide";
      isValid = false;
    }
  }

  return isValid;
};

// Mettre à jour le profil
const updateProfile = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { error } = await updateUserProfile(profileForm);

    if (error) {
      errorMessage.value =
        "Erreur lors de la mise à jour du profil: " + error.message;
    } else {
      successMessage.value = "Profil mis à jour avec succès !";
      await loadUserProfile();
    }
  } catch (error: any) {
    errorMessage.value = "Une erreur inattendue est survenue: " + error.message;
  } finally {
    isLoading.value = false;
  }
};

// Réinitialiser le formulaire
const resetForm = () => {
  initializeForm();
  Object.keys(errors).forEach((key) => delete errors[key]);
  errorMessage.value = "";
  successMessage.value = "";
};

// Changer le mot de passe
const changePassword = async () => {
  if (!user.value?.email) return;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      user.value.email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      }
    );

    if (error) {
      errorMessage.value =
        "Erreur lors de l'envoi de l'email: " + error.message;
    } else {
      successMessage.value =
        "Email de réinitialisation envoyé ! Vérifiez votre boîte mail.";
    }
  } catch (error: any) {
    errorMessage.value = "Une erreur inattendue est survenue: " + error.message;
  }
};

// Initialisation
onMounted(async () => {
  await loadUserProfile();
  initializeForm();
});

// Watcher pour réinitialiser le formulaire quand le profil change
watch(
  () => userProfile.value,
  () => {
    if (userProfile.value) {
      initializeForm();
    }
  }
);
</script>
