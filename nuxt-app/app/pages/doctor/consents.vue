<template>
  <Container>
    <!-- Breadcrumb navigation -->
    <nav class="mb-6" aria-label="Fil d'Ariane">
      <ol class="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <NuxtLink
            to="/doctor/dashboard"
            class="hover:text-gray-700 focus:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          >
            Dashboard
          </NuxtLink>
        </li>
        <Icon name="lucide:chevron-right" class="h-4 w-4" aria-hidden="true" />
        <li class="text-gray-900 font-medium" aria-current="page">
          Consentements Patients
        </li>
      </ol>
    </nav>

    <!-- En-tête de page -->
    <header class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Consentements Patients
          </h1>
          <p class="mt-2 text-gray-600">
            Gérez les consentements de vos patients pour accéder à leurs données
            de santé.
          </p>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/doctor/dashboard">
            <Button variant="outline" class="flex items-center gap-2">
              <Icon name="lucide:arrow-left" class="h-4 w-4" />
              Retour au dashboard
            </Button>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="space-y-8">
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
                    Total Patients
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
                    Actifs
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

      <!-- Filtres -->
      <Card>
        <CardContent class="p-4">
          <div class="flex space-x-4">
            <div class="flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un patient..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              v-model="statusFilter"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="granted">Accordés</option>
              <option value="revoked">Révoqués</option>
              <option value="expired">Expirés</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <!-- Liste des consentements -->
      <Card>
        <CardHeader>
          <CardTitle>Consentements reçus</CardTitle>
          <CardDescription>
            Liste de tous les consentements accordés par vos patients.
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
            v-else-if="!filteredConsents || filteredConsents.length === 0"
            class="text-center py-8"
          >
            <Icon
              name="lucide:users"
              class="h-12 w-12 text-gray-400 mx-auto mb-4"
            />
            <p class="text-gray-500">Aucun consentement trouvé.</p>
            <p class="text-sm text-gray-400 mt-1">
              Les patients peuvent vous accorder l'accès à leurs données depuis
              leur interface.
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="consent in filteredConsents"
              :key="consent.id"
              class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div
                        class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"
                      >
                        <Icon
                          name="lucide:user"
                          class="h-5 w-5 text-green-600"
                        />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900">
                        {{ consent.patient?.first_name }}
                        {{ consent.patient?.last_name }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ consent.patient?.email }}
                      </p>
                      <p
                        v-if="consent.patient?.phone"
                        class="text-xs text-gray-400"
                      >
                        {{ consent.patient.phone }}
                      </p>
                    </div>
                  </div>

                  <div
                    class="mt-2 flex items-center space-x-4 text-xs text-gray-500"
                  >
                    <span>Demandé le {{ formatDate(consent.created_at) }}</span>
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
                      v-if="consent.status === 'granted'"
                      @click="viewPatientData(consent.patient_id)"
                      size="sm"
                      class="bg-blue-600 hover:bg-blue-700"
                    >
                      <Icon name="lucide:eye" class="h-4 w-4 mr-1" />
                      Voir données
                    </Button>

                    <Button
                      v-if="consent.status === 'granted'"
                      @click="sendMessage(consent.patient_id)"
                      size="sm"
                      variant="outline"
                    >
                      <Icon name="lucide:message-circle" class="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  </Container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

// Types
interface Consent {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: "pending" | "granted" | "revoked" | "expired";
  granted_at?: string;
  revoked_at?: string;
  expires_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

// Middleware et meta
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
  title: "Consentements Patients",
});

// Composables
const { userProfile } = useAuth();

// État réactif
const isLoading = ref(true);
const successMessage = ref("");
const errorMessage = ref("");
const consents = ref<Consent[]>([]);
const stats = ref<any>(null);
const searchQuery = ref("");
const statusFilter = ref("");

// Computed
const filteredConsents = computed(() => {
  let filtered = consents.value;

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (consent) =>
        consent.patient?.first_name?.toLowerCase().includes(query) ||
        consent.patient?.last_name?.toLowerCase().includes(query) ||
        consent.patient?.email?.toLowerCase().includes(query)
    );
  }

  // Filtrer par statut
  if (statusFilter.value) {
    filtered = filtered.filter(
      (consent) => consent.status === statusFilter.value
    );
  }

  return filtered;
});

// Charger les données
const loadData = async () => {
  isLoading.value = true;
  try {
    // Charger les consentements
    const { data: consentsData, error: consentsError } =
      await getDoctorConsents();
    if (consentsError) {
      errorMessage.value =
        "Erreur lors du chargement des consentements: " + consentsError.message;
    } else {
      consents.value = consentsData || [];
    }

    // Charger les statistiques
    const { data: statsData, error: statsError } =
      await getDoctorConsentStats();
    if (!statsError && statsData) {
      stats.value = statsData;
    }
  } catch (error: any) {
    errorMessage.value = "Erreur lors du chargement: " + error.message;
  } finally {
    isLoading.value = false;
  }
};

// Actions
const viewPatientData = (patientId: string) => {
  // Rediriger vers la page des données du patient
  navigateTo(`/doctor/patients/${patientId}`);
};

const sendMessage = (patientId: string) => {
  // Rediriger vers la messagerie avec le patient
  navigateTo(`/doctor/messages?patient=${patientId}`);
};

// Utilitaires
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

// Déconnexion
const handleSignOut = async () => {
  await logout();
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
