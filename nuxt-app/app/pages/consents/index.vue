<template>
  <main class="p-6">
    <div class="space-y-8">
      <!-- En-tête -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Consentements</h1>
          <p class="mt-2 text-gray-600">
            Gérez l'accès de vos médecins à vos données de santé.
          </p>
        </div>

        <div class="flex space-x-3">
          <NuxtLink to="/consents/revoke">
            <Button
              variant="outline"
              class="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Icon name="lucide:x-circle" class="h-4 w-4 mr-2" />
              Révoquer consentements
            </Button>
          </NuxtLink>
          <Button
            @click="showCreateModal = true"
            class="bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
            Nouveau consentement
          </Button>
        </div>
      </div>

      <!-- Messages -->
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

      <!-- Statistiques -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="lucide:users" class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.total }}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="lucide:clock" class="h-8 w-8 text-yellow-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    En attente
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.pending }}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="lucide:check" class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Accordés
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.granted }}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="lucide:x" class="h-8 w-8 text-red-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Révoqués
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.revoked }}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Liste des consentements -->
      <Card>
        <CardHeader>
          <CardTitle>Mes consentements</CardTitle>
          <CardDescription>
            Liste de tous vos consentements avec les médecins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="flex justify-center py-8">
            <Icon
              name="lucide:loader-2"
              class="h-8 w-8 animate-spin text-blue-600"
            />
          </div>

          <div
            v-else-if="!consents || consents.length === 0"
            class="text-center py-8"
          >
            <Icon
              name="lucide:shield-check"
              class="h-12 w-12 text-gray-400 mx-auto mb-4"
            />
            <p class="text-gray-500">Aucun consentement trouvé.</p>
            <p class="text-sm text-gray-400 mt-1">
              Créez votre premier consentement pour permettre à un médecin
              d'accéder à vos données.
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="consent in consents"
              :key="consent.id"
              class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div
                        class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"
                      >
                        <Icon
                          name="lucide:user-md"
                          class="h-5 w-5 text-blue-600"
                        />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900">
                        Dr. {{ consent.doctor?.first_name }}
                        {{ consent.doctor?.last_name }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ consent.doctor?.email }}
                      </p>
                      <p
                        v-if="consent.doctor?.specialty"
                        class="text-xs text-gray-400"
                      >
                        {{ consent.doctor.specialty }}
                      </p>
                    </div>
                  </div>

                  <div
                    class="mt-2 flex items-center space-x-4 text-xs text-gray-500"
                  >
                    <span>Créé le {{ formatDate(consent.created_at) }}</span>
                    <span v-if="consent.granted_at"
                      >Accordé le {{ formatDate(consent.granted_at) }}</span
                    >
                    <span v-if="consent.revoked_at"
                      >Révoqué le {{ formatDate(consent.revoked_at) }}</span
                    >
                    <span v-if="consent.expires_at"
                      >Expire le {{ formatDate(consent.expires_at) }}</span
                    >
                  </div>

                  <p v-if="consent.notes" class="mt-1 text-sm text-gray-600">
                    {{ consent.notes }}
                  </p>
                </div>

                <div class="flex items-center space-x-3">
                  <!-- Badge de statut -->
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusBadgeClass(consent.status)"
                  >
                    {{ getStatusLabel(consent.status) }}
                  </span>

                  <!-- Actions -->
                  <div class="flex space-x-2">
                    <Button
                      v-if="consent.status === 'pending'"
                      @click="approveConsent(consent.id)"
                      size="sm"
                      class="bg-green-600 hover:bg-green-700"
                    >
                      Approuver
                    </Button>

                    <Button
                      v-if="consent.status === 'pending'"
                      @click="denyConsent(consent.id)"
                      size="sm"
                      variant="outline"
                      class="text-red-600 hover:text-red-700"
                    >
                      Refuser
                    </Button>

                    <Button
                      v-if="consent.status === 'granted'"
                      @click="revokeConsent(consent.id)"
                      size="sm"
                      variant="outline"
                      class="text-red-600 hover:text-red-700"
                    >
                      Révoquer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modal de création de consentement -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Nouveau consentement
            </h3>
            <Button @click="showCreateModal = false" variant="ghost" size="sm">
              <Icon name="lucide:x" class="h-4 w-4" />
            </Button>
          </div>

          <form @submit.prevent="createConsent" class="space-y-4">
            <!-- Recherche de médecin -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Rechercher un médecin
              </label>
              <input
                v-model="doctorSearch"
                @input="searchDoctors"
                type="text"
                placeholder="Nom, email ou spécialité..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />

              <!-- Résultats de recherche -->
              <div
                v-if="searchResults.length > 0"
                class="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md"
              >
                <div
                  v-for="doctor in searchResults"
                  :key="doctor.id"
                  @click="selectDoctor(doctor)"
                  class="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <p class="text-sm font-medium">
                    Dr. {{ doctor.first_name }} {{ doctor.last_name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ doctor.email }}</p>
                  <p v-if="doctor.specialty" class="text-xs text-gray-400">
                    {{ doctor.specialty }}
                  </p>
                </div>
              </div>

              <!-- Médecin sélectionné -->
              <div v-if="selectedDoctor" class="mt-2 p-2 bg-blue-50 rounded-md">
                <p class="text-sm font-medium text-blue-900">
                  Dr. {{ selectedDoctor.first_name }}
                  {{ selectedDoctor.last_name }}
                </p>
                <p class="text-xs text-blue-700">{{ selectedDoctor.email }}</p>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                v-model="consentForm.notes"
                rows="3"
                placeholder="Raison du consentement, informations supplémentaires..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <!-- Date d'expiration -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Date d'expiration (optionnel)
              </label>
              <input
                v-model="consentForm.expires_at"
                type="date"
                :min="new Date().toISOString().split('T')[0]"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Boutons -->
            <div class="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                @click="showCreateModal = false"
                variant="outline"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                :disabled="!selectedDoctor || isSubmitting"
                class="bg-blue-600 hover:bg-blue-700"
              >
                <Icon
                  v-if="isSubmitting"
                  name="lucide:loader-2"
                  class="h-4 w-4 mr-2 animate-spin"
                />
                Créer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { Consent } from "~/composables/useConsent";

// Middleware et meta
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
  title: "Consentements",
});

// Composables
const { userProfile, signOut } = useAuth();
const {
  getPatientConsents,
  getPatientConsentStats,
  searchDoctors: searchDoctorsAPI,
  createConsentRequest,
  grantConsent,
  revokeConsent: revokeConsentAPI,
  denyConsent: denyConsentAPI,
} = useConsent();

// État réactif
const isLoading = ref(true);
const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const consents = ref<Consent[]>([]);
const stats = ref<any>(null);

// Modal et formulaire
const showCreateModal = ref(false);
const doctorSearch = ref("");
const searchResults = ref<any[]>([]);
const selectedDoctor = ref<any>(null);
const consentForm = reactive({
  notes: "",
  expires_at: "",
});

// Charger les données
const loadData = async () => {
  isLoading.value = true;
  try {
    // Charger les consentements
    const { data: consentsData, error: consentsError } =
      await getPatientConsents();
    if (consentsError) {
      errorMessage.value =
        "Erreur lors du chargement des consentements: " + consentsError.message;
    } else {
      consents.value = consentsData || [];
    }

    // Charger les statistiques
    const { data: statsData, error: statsError } =
      await getPatientConsentStats();
    if (!statsError && statsData) {
      stats.value = statsData;
    }
  } catch (error: any) {
    errorMessage.value = "Erreur lors du chargement: " + error.message;
  } finally {
    isLoading.value = false;
  }
};

// Rechercher des médecins
const searchDoctors = async () => {
  if (doctorSearch.value.length < 2) {
    searchResults.value = [];
    return;
  }

  try {
    const { data, error } = await searchDoctorsAPI(doctorSearch.value);
    if (error) {
      console.error("Erreur de recherche:", error);
    } else {
      searchResults.value = data || [];
    }
  } catch (error) {
    console.error("Erreur de recherche:", error);
  }
};

// Sélectionner un médecin
const selectDoctor = (doctor: any) => {
  selectedDoctor.value = doctor;
  doctorSearch.value = `Dr. ${doctor.first_name} ${doctor.last_name}`;
  searchResults.value = [];
};

// Créer un consentement
const createConsent = async () => {
  if (!selectedDoctor.value) return;

  isSubmitting.value = true;
  try {
    const { data, error } = await createConsentRequest({
      patient_id: userProfile.value?.id,
      doctor_id: selectedDoctor.value.id,
      notes: consentForm.notes || undefined,
      expires_at: consentForm.expires_at || undefined,
    });

    if (error) {
      errorMessage.value = "Erreur lors de la création: " + error.message;
    } else {
      successMessage.value = "Demande de consentement créée avec succès !";
      showCreateModal.value = false;
      resetForm();
      await loadData();
    }
  } catch (error: any) {
    errorMessage.value = "Erreur inattendue: " + error.message;
  } finally {
    isSubmitting.value = false;
  }
};

// Approuver un consentement
const approveConsent = async (consentId: string) => {
  try {
    const { error } = await grantConsent(consentId);
    if (error) {
      errorMessage.value = "Erreur lors de l'approbation: " + error.message;
    } else {
      successMessage.value = "Consentement approuvé avec succès !";
      await loadData();
    }
  } catch (error: any) {
    errorMessage.value = "Erreur inattendue: " + error.message;
  }
};

// Révoquer un consentement
const revokeConsent = async (consentId: string) => {
  if (!confirm("Êtes-vous sûr de vouloir révoquer ce consentement ?")) return;

  try {
    const { error } = await revokeConsentAPI(consentId);
    if (error) {
      errorMessage.value = "Erreur lors de la révocation: " + error.message;
    } else {
      successMessage.value = "Consentement révoqué avec succès !";
      await loadData();
    }
  } catch (error: any) {
    errorMessage.value = "Erreur inattendue: " + error.message;
  }
};

// Refuser un consentement
const denyConsent = async (consentId: string) => {
  if (!confirm("Êtes-vous sûr de vouloir refuser ce consentement ?")) return;

  try {
    const { error } = await denyConsentAPI(consentId);
    if (error) {
      errorMessage.value = "Erreur lors du refus: " + error.message;
    } else {
      successMessage.value = "Consentement refusé !";
      await loadData();
    }
  } catch (error: any) {
    errorMessage.value = "Erreur inattendue: " + error.message;
  }
};

// Utilitaires
const resetForm = () => {
  consentForm.notes = "";
  consentForm.expires_at = "";
  selectedDoctor.value = null;
  doctorSearch.value = "";
  searchResults.value = [];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR");
};

const getStatusLabel = (status: string) => {
  const labels = {
    pending: "En attente",
    granted: "Accordé",
    revoked: "Révoqué",
    expired: "Expiré",
  };
  return labels[status as keyof typeof labels] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    granted: "bg-green-100 text-green-800",
    revoked: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };
  return classes[status as keyof typeof classes] || "bg-gray-100 text-gray-800";
};

// Initialisation
onMounted(async () => {
  await loadData();
});

// Effacer les messages après 5 secondes
watch([successMessage, errorMessage], () => {
  setTimeout(() => {
    successMessage.value = "";
    errorMessage.value = "";
  }, 5000);
});
</script>
