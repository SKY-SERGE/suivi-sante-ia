<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-4xl">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Gestion des Consentements
        </h1>
        <p class="mt-2 text-gray-600">
          Gérez l'accès de vos médecins à vos données de santé
        </p>
      </div>

      <!-- Statistiques -->
      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <span class="text-blue-600 font-semibold text-sm">{{
                  stats.total
                }}</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total</p>
              <p class="text-xs text-gray-500">Consentements</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
              >
                <span class="text-green-600 font-semibold text-sm">{{
                  stats.granted
                }}</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Accordés</p>
              <p class="text-xs text-gray-500">Actifs</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"
              >
                <span class="text-yellow-600 font-semibold text-sm">{{
                  stats.pending
                }}</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">En attente</p>
              <p class="text-xs text-gray-500">À traiter</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"
              >
                <span class="text-red-600 font-semibold text-sm">{{
                  stats.revoked
                }}</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Révoqués</p>
              <p class="text-xs text-gray-500">Annulés</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="mb-8 flex flex-col sm:flex-row gap-4">
        <button
          @click="showRequestModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Demander un Consentement
        </button>

        <button
          @click="refreshConsents"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualiser
        </button>
      </div>

      <!-- Liste des consentements -->
      <div class="bg-white shadow-sm rounded-lg border">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Mes Consentements</h2>
        </div>

        <div v-if="loading" class="p-6 text-center">
          <div class="inline-flex items-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Chargement...
          </div>
        </div>

        <div
          v-else-if="consents.length === 0"
          class="p-6 text-center text-gray-500"
        >
          <div class="mb-4">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p class="text-lg font-medium">Aucun consentement</p>
          <p class="mt-1">
            Vous n'avez encore accordé aucun consentement à des médecins.
          </p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="consent in consents"
            :key="consent.id"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div
                      class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-blue-600 font-medium text-sm">
                        {{
                          getInitials(
                            consent.doctor?.first_name,
                            consent.doctor?.last_name
                          )
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">
                      Dr. {{ consent.doctor?.first_name }}
                      {{ consent.doctor?.last_name }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{
                        consent.doctor?.specialization || "Médecin généraliste"
                      }}
                    </p>
                    <p class="text-xs text-gray-400">
                      {{ consent.doctor?.email }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <!-- Statut -->
                <div class="flex items-center">
                  <span
                    :class="getStatusBadgeClass(consent.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ getStatusText(consent.status) }}
                  </span>
                </div>

                <!-- Date -->
                <div class="text-sm text-gray-500">
                  <p>{{ formatDate(consent.created_at) }}</p>
                  <p v-if="consent.granted_at" class="text-xs">
                    Accordé: {{ formatDate(consent.granted_at) }}
                  </p>
                  <p v-if="consent.expires_at" class="text-xs">
                    Expire: {{ formatDate(consent.expires_at) }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <button
                    v-if="consent.status === 'pending'"
                    @click="grantConsentAction(consent.id)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Accepter
                  </button>

                  <button
                    v-if="consent.status === 'granted'"
                    @click="revokeConsentAction(consent.id)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Révoquer
                  </button>

                  <button class="text-gray-400 hover:text-gray-600">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="consent.notes" class="mt-3 ml-14">
              <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <span class="font-medium">Note:</span> {{ consent.notes }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de demande de consentement -->
    <div
      v-if="showRequestModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showRequestModal = false"
        ></div>

        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        >
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Demander un Consentement
            </h3>

            <form @submit.prevent="submitConsentRequest">
              <!-- Recherche de médecin -->
              <div class="mb-4">
                <label
                  for="doctor-search"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rechercher un médecin
                </label>
                <input
                  id="doctor-search"
                  v-model="searchTerm"
                  @input="searchDoctors"
                  type="text"
                  placeholder="Nom, prénom ou spécialisation..."
                  class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Liste des médecins -->
              <div
                v-if="doctors.length > 0"
                class="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg"
              >
                <div
                  v-for="doctor in doctors"
                  :key="doctor.id"
                  @click="selectedDoctor = doctor"
                  :class="
                    selectedDoctor?.id === doctor.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  "
                  class="p-3 border-b border-gray-100 cursor-pointer last:border-b-0"
                >
                  <div class="flex items-center">
                    <div
                      class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3"
                    >
                      <span class="text-blue-600 font-medium text-xs">
                        {{ getInitials(doctor.first_name, doctor.last_name) }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        Dr. {{ doctor.first_name }} {{ doctor.last_name }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ doctor.specialization || "Médecin généraliste" }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Note -->
              <div class="mb-4">
                <label
                  for="notes"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Note (optionnelle)
                </label>
                <textarea
                  id="notes"
                  v-model="requestNotes"
                  rows="3"
                  placeholder="Précisez la raison de cette demande..."
                  class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  @click="showRequestModal = false"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="!selectedDoctor || submitting"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <svg
                    v-if="submitting"
                    class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Envoyer la Demande
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
  title: "Consentements - Patient",
});

const {
  getPatientConsents,
  requestConsent,
  grantConsent,
  revokeConsent,
  searchDoctors: searchDoctorsAPI,
  getConsentStats,
} = useConsent();

// État réactif
const consents = ref<any[]>([]);
const stats = ref({
  total: 0,
  pending: 0,
  granted: 0,
  revoked: 0,
  expired: 0,
});
const loading = ref(true);
const showRequestModal = ref(false);
const submitting = ref(false);

// Modal de demande
const searchTerm = ref("");
const doctors = ref<any[]>([]);
const selectedDoctor = ref<any>(null);
const requestNotes = ref("");

// Méthodes utilitaires
const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return "??";
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return first + last;
};

const getStatusText = (status: string) => {
  const statusMap = {
    pending: "En attente",
    granted: "Accordé",
    revoked: "Révoqué",
    expired: "Expiré",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classMap = {
    pending: "bg-yellow-100 text-yellow-800",
    granted: "bg-green-100 text-green-800",
    revoked: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };
  return (
    classMap[status as keyof typeof classMap] || "bg-gray-100 text-gray-800"
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Actions
const loadConsents = async () => {
  loading.value = true;
  try {
    const [consentsData, statsData] = await Promise.all([
      getPatientConsents(),
      getConsentStats(),
    ]);
    consents.value = consentsData;
    stats.value = statsData;
  } catch (error) {
    console.error("Erreur lors du chargement des consentements:", error);
    // TODO: Afficher une notification d'erreur
  } finally {
    loading.value = false;
  }
};

const refreshConsents = () => {
  loadConsents();
};

const searchDoctors = async () => {
  if (searchTerm.value.length < 2) {
    doctors.value = [];
    return;
  }

  try {
    const results = await searchDoctorsAPI(searchTerm.value);
    doctors.value = results || [];
  } catch (error) {
    console.error("Erreur lors de la recherche de médecins:", error);
    doctors.value = [];
  }
};

const submitConsentRequest = async () => {
  if (!selectedDoctor.value) return;

  submitting.value = true;
  try {
    await requestConsent(
      selectedDoctor.value.id,
      requestNotes.value || undefined
    );

    // Réinitialiser le modal
    showRequestModal.value = false;
    selectedDoctor.value = null;
    requestNotes.value = "";
    searchTerm.value = "";
    doctors.value = [];

    // Recharger les données
    await loadConsents();

    // TODO: Afficher une notification de succès
  } catch (error) {
    console.error("Erreur lors de la demande de consentement:", error);
    // TODO: Afficher une notification d'erreur
  } finally {
    submitting.value = false;
  }
};

const grantConsentAction = async (consentId: string) => {
  try {
    // Par défaut, le consentement expire dans 1 an
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await grantConsent(consentId, expiresAt.toISOString());
    await loadConsents();

    // TODO: Afficher une notification de succès
  } catch (error) {
    console.error("Erreur lors de l'accord du consentement:", error);
    // TODO: Afficher une notification d'erreur
  }
};

const revokeConsentAction = async (consentId: string) => {
  if (
    !confirm(
      "Êtes-vous sûr de vouloir révoquer ce consentement ? Le médecin n'aura plus accès à vos données."
    )
  ) {
    return;
  }

  try {
    await revokeConsent(consentId);
    await loadConsents();

    // TODO: Afficher une notification de succès
  } catch (error) {
    console.error("Erreur lors de la révocation du consentement:", error);
    // TODO: Afficher une notification d'erreur
  }
};

// Charger les données au montage
onMounted(() => {
  loadConsents();
});

// Métadonnées de la page
useHead({
  title: "Gestion des Consentements - Suivi Santé IA",
  meta: [
    {
      name: "description",
      content: "Gérez l'accès de vos médecins à vos données de santé",
    },
  ],
});
</script>
