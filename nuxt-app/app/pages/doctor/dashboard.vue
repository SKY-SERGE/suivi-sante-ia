<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Titre de bienvenue -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Dashboard Médecin</h1>
          <p class="mt-2 text-gray-600">
            Gérez vos patients et consultez leurs données de santé
          </p>
        </div>

        <!-- Statistiques rapides -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent class="p-6">
              <div class="flex items-center">
                <Icon name="lucide:users" class="h-8 w-8 text-blue-600" />
                <div class="ml-4">
                  <div class="text-2xl font-bold">{{ patientsCount }}</div>
                  <div class="text-gray-600">Patients actifs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6">
              <div class="flex items-center">
                <Icon
                  name="lucide:check-circle"
                  class="h-8 w-8 text-green-600"
                />
                <div class="ml-4">
                  <div class="text-2xl font-bold">{{ consentsCount }}</div>
                  <div class="text-gray-600">Consentements accordés</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6">
              <div class="flex items-center">
                <Icon
                  name="lucide:message-circle"
                  class="h-8 w-8 text-purple-600"
                />
                <div class="ml-4">
                  <div class="text-2xl font-bold">{{ messagesCount }}</div>
                  <div class="text-gray-600">Messages non lus</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Actions rapides -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <NuxtLink to="/doctor/consents" class="block">
            <Card class="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent class="p-6">
                <div class="flex items-center">
                  <Icon
                    name="lucide:shield-check"
                    class="h-8 w-8 text-blue-600"
                  />
                  <div class="ml-4">
                    <div class="font-medium">Gérer les consentements</div>
                    <div class="text-sm text-gray-600">
                      Consulter tous les consentements
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </NuxtLink>

          <Card class="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent class="p-6">
              <div class="flex items-center">
                <Icon name="lucide:chart-line" class="h-8 w-8 text-green-600" />
                <div class="ml-4">
                  <div class="font-medium">Analyses et rapports</div>
                  <div class="text-sm text-gray-600">
                    Consulter les données patients
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <NuxtLink to="/doctor/messages" class="block">
            <Card class="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent class="p-6">
                <div class="flex items-center">
                  <Icon
                    name="lucide:message-circle"
                    class="h-8 w-8 text-purple-600"
                  />
                  <div class="ml-4">
                    <div class="font-medium">Messagerie</div>
                    <div class="text-sm text-gray-600">
                      Communiquer avec vos patients
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </NuxtLink>
        </div>
        <!-- Liste des patients -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <div class="flex items-center">
                <Icon name="lucide:users" class="h-5 w-5 mr-2" />
                Mes Patients
              </div>
              <div class="text-sm font-normal text-gray-500">
                {{ filteredPatients.length }} patient(s)
              </div>
            </CardTitle>
            <CardDescription>
              Gérez vos patients et leur statut de consentement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <!-- Filtres et recherche -->
            <div class="mb-6 space-y-4">
              <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                  <div class="relative">
                    <Icon
                      name="lucide:search"
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    />
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Rechercher un patient (nom, email, téléphone)..."
                      class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div class="flex gap-2">
                  <select
                    v-model="selectedConsentFilter"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="granted">Consentement accordé</option>
                    <option value="pending">En attente</option>
                    <option value="revoked">Révoqué</option>
                  </select>
                  <select
                    v-model="selectedActivityFilter"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Toute activité</option>
                    <option value="recent">Actif récemment</option>
                    <option value="inactive">Inactif 7+ jours</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="refreshPatientData"
                    :disabled="loading"
                  >
                    <Icon
                      name="lucide:refresh-cw"
                      class="h-4 w-4"
                      :class="{ 'animate-spin': loading }"
                    />
                  </Button>
                </div>
              </div>

              <!-- Statistiques de filtrage rapides -->
              <div
                class="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-200 pt-4"
              >
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{{ consentsCount }} consentements accordés</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>{{ pendingConsentsCount }} en attente</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{{ revokedConsentsCount }} révoqués</span>
                </div>
                <div class="flex items-center gap-1 ml-auto">
                  <Icon name="lucide:filter" class="h-4 w-4" />
                  <span
                    >{{ filteredPatients.length }} /
                    {{ patients.length }} patients affichés</span
                  >
                </div>
              </div>
            </div>

            <div v-if="loading" class="text-center py-8">
              <Icon
                name="lucide:loader-2"
                class="h-8 w-8 animate-spin mx-auto"
              />
              <p class="mt-2">Chargement des patients...</p>
            </div>

            <div
              v-else-if="filteredPatients.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <Icon
                name="lucide:users"
                class="h-12 w-12 mx-auto mb-4 text-gray-300"
              />
              <p v-if="searchQuery">
                Aucun patient trouvé pour "{{ searchQuery }}"
              </p>
              <p v-else>Aucun patient trouvé</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="patient in filteredPatients"
                :key="patient.id"
                class="group p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center flex-1">
                    <div
                      class="h-12 w-12 rounded-full flex items-center justify-center"
                      :class="getPatientAvatarClass(patient.consent_status)"
                    >
                      <Icon name="lucide:user" class="h-6 w-6" />
                    </div>
                    <div class="ml-4 flex-1">
                      <div class="flex items-center gap-3">
                        <div class="font-medium text-gray-900">
                          {{ patient.first_name }} {{ patient.last_name }}
                        </div>
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getConsentStatusClass(patient.consent_status)"
                        >
                          <Icon
                            :name="getConsentStatusIcon(patient.consent_status)"
                            class="h-3 w-3 mr-1"
                          />
                          {{ getConsentStatusText(patient.consent_status) }}
                        </span>
                      </div>
                      <div
                        class="mt-1 flex items-center gap-4 text-sm text-gray-500"
                      >
                        <span>{{ patient.email }}</span>
                        <span v-if="patient.phone">{{ patient.phone }}</span>
                        <span v-if="patient.consent_granted_at">
                          Consentement le
                          {{ formatDate(patient.consent_granted_at) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <span
                      v-if="patient.last_activity"
                      class="text-xs text-gray-400"
                    >
                      Dernière activité:
                      {{ formatRelativeDate(patient.last_activity) }}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="viewPatientData(patient)"
                      :disabled="patient.consent_status !== 'granted'"
                      class="group-hover:shadow-sm"
                    >
                      <Icon name="lucide:eye" class="h-4 w-4 mr-2" />
                      Voir les données
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="showPatientMenu(patient)"
                      class="group-hover:bg-gray-100"
                    >
                      <Icon name="lucide:more-vertical" class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Actions rapides -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center">
                <Icon name="lucide:message-square" class="h-5 w-5 mr-2" />
                Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <Button class="w-full" variant="outline">
                  <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
                  Envoyer un message
                </Button>
                <Button class="w-full" variant="outline">
                  <Icon name="lucide:inbox" class="h-4 w-4 mr-2" />
                  Voir la messagerie
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center">
                <Icon name="lucide:settings" class="h-5 w-5 mr-2" />
                Paramètres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <Button class="w-full" variant="outline">
                  <Icon name="lucide:user" class="h-4 w-4 mr-2" />
                  Mon profil
                </Button>
                <Button class="w-full" variant="outline">
                  <Icon name="lucide:bell" class="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Composables
const { user, userProfile } = useUser();
const supabaseClient = useSupabaseClient();

// Types
interface Patient {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  consent_status: "granted" | "pending" | "revoked";
  consent_granted_at?: string;
  consent_revoked_at?: string;
  last_activity?: string;
}

// États réactifs
const loading = ref(true);
const patients = ref<Patient[]>([]);
const searchQuery = ref("");
const selectedConsentFilter = ref("all");
const selectedActivityFilter = ref("all");
const patientsCount = ref(0);
const consentsCount = ref(0);
const messagesCount = ref(0);

// Computed pour les statistiques
const pendingConsentsCount = computed(
  () => patients.value.filter((p) => p.consent_status === "pending").length
);

const revokedConsentsCount = computed(
  () => patients.value.filter((p) => p.consent_status === "revoked").length
);

// Computed pour le filtrage des patients
const filteredPatients = computed(() => {
  let filtered = patients.value;

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (patient) =>
        patient.first_name?.toLowerCase().includes(query) ||
        patient.last_name?.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.phone?.toLowerCase().includes(query)
    );
  }

  // Filtrer par statut de consentement
  if (selectedConsentFilter.value !== "all") {
    filtered = filtered.filter(
      (patient) => patient.consent_status === selectedConsentFilter.value
    );
  }

  // Filtrer par activité
  if (selectedActivityFilter.value !== "all") {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (selectedActivityFilter.value === "recent") {
      filtered = filtered.filter((patient) => {
        if (!patient.last_activity) return false;
        return new Date(patient.last_activity) > sevenDaysAgo;
      });
    } else if (selectedActivityFilter.value === "inactive") {
      filtered = filtered.filter((patient) => {
        if (!patient.last_activity) return true;
        return new Date(patient.last_activity) <= sevenDaysAgo;
      });
    }
  }

  return filtered;
});

// Charger les données du médecin
const loadDoctorData = async () => {
  if (!user.value) return;

  try {
    // Charger tous les patients avec leurs consentements
    const { data: consents, error: consentsError } = await supabaseClient
      .from("consents")
      .select(
        `
        *,
        patient:users!consents_patient_id_fkey(*)
      `
      )
      .eq("doctor_id", user.value.id);

    if (!consentsError && consents) {
      // Transformer les données pour inclure le statut de consentement
      patients.value = consents.map((consent) => ({
        ...consent.patient,
        consent_status: consent.status,
        consent_granted_at: consent.granted_at,
        consent_revoked_at: consent.revoked_at,
        last_activity: consent.updated_at,
      }));

      patientsCount.value = consents.length;
      consentsCount.value = consents.filter(
        (c) => c.status === "granted"
      ).length;
    }

    // Charger les messages non lus (simulation pour le moment)
    messagesCount.value = 0;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  } finally {
    loading.value = false;
  }
};

// Fonctions utilitaires pour l'affichage
const getConsentStatusClass = (status: string) => {
  switch (status) {
    case "granted":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "revoked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getConsentStatusIcon = (status: string) => {
  switch (status) {
    case "granted":
      return "lucide:check-circle";
    case "pending":
      return "lucide:clock";
    case "revoked":
      return "lucide:x-circle";
    default:
      return "lucide:help-circle";
  }
};

const getConsentStatusText = (status: string) => {
  switch (status) {
    case "granted":
      return "Accordé";
    case "pending":
      return "En attente";
    case "revoked":
      return "Révoqué";
    default:
      return "Inconnu";
  }
};

const getPatientAvatarClass = (status: string) => {
  switch (status) {
    case "granted":
      return "bg-green-100 text-green-600";
    case "pending":
      return "bg-yellow-100 text-yellow-600";
    case "revoked":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// Fonctions utilitaires pour les dates
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatRelativeDate = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
  return formatDate(dateString);
};

// Actions
const refreshPatientData = async () => {
  loading.value = true;
  await loadDoctorData();
};

const viewPatientData = (patient: Patient) => {
  // Navigation vers la page de données du patient
  navigateTo(`/doctor/patients/${patient.id}`);
};

const showPatientMenu = (patient: Patient) => {
  // TODO: Implémenter le menu contextuel
  console.log("Menu pour patient:", patient);
};

// Initialisation
onMounted(async () => {
  await loadDoctorData();
});

// Meta données de la page
definePageMeta({
  layout: "dashboard",
  title: "Dashboard Médecin",
  middleware: ["auth", "role"],
});
</script>
