<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/dashboard" class="flex items-center">
              <Icon name="lucide:heart-pulse" class="h-8 w-8 text-blue-600" />
              <span class="ml-2 text-xl font-bold text-gray-900"
                >Suivi Santé IA</span
              >
            </NuxtLink>
            <nav class="ml-8 flex space-x-4">
              <NuxtLink
                to="/consents"
                class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Mes consentements
              </NuxtLink>
              <span class="text-gray-400 px-3 py-2 text-sm font-medium">
                Révoquer consentements
              </span>
            </nav>
          </div>

          <div class="flex items-center space-x-4">
            <span class="text-gray-700">
              {{ userProfile?.first_name || "Utilisateur" }}
              {{ userProfile?.last_name || "" }}
            </span>
            <Button @click="handleSignOut" variant="outline">
              <Icon name="lucide:log-out" class="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="space-y-8">
        <!-- En-tête -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Révoquer un consentement
          </h1>
          <p class="mt-2 text-gray-600">
            Retirez l'autorisation d'accès à vos données de santé pour un
            médecin spécifique.
          </p>
        </div>

        <!-- Avertissement -->
        <Card class="border-amber-200 bg-amber-50">
          <CardContent class="p-6">
            <div class="flex">
              <Icon
                name="lucide:alert-triangle"
                class="h-5 w-5 text-amber-400 flex-shrink-0"
              />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-amber-800">
                  Important à savoir
                </h3>
                <div class="mt-2 text-sm text-amber-700">
                  <ul class="list-disc pl-5 space-y-1">
                    <li>
                      La révocation d'un consentement est définitive et
                      immédiate
                    </li>
                    <li>
                      Le médecin perdra immédiatement l'accès à vos données de
                      santé
                    </li>
                    <li>
                      Cette action peut affecter votre suivi médical en cours
                    </li>
                    <li>
                      Vous pourrez toujours accorder un nouveau consentement
                      ultérieurement
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

        <!-- Liste des consentements actifs -->
        <Card>
          <CardHeader>
            <CardTitle>Consentements actifs</CardTitle>
            <CardDescription>
              Sélectionnez le consentement que vous souhaitez révoquer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="loading" class="flex justify-center py-8">
              <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin" />
            </div>

            <div v-else-if="!activeConsents?.length" class="text-center py-8">
              <Icon
                name="lucide:shield-x"
                class="h-12 w-12 mx-auto mb-4 text-gray-300"
              />
              <p class="text-gray-500">Aucun consentement actif trouvé</p>
              <NuxtLink to="/consents">
                <Button class="mt-4" variant="outline">
                  Retour aux consentements
                </Button>
              </NuxtLink>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="consent in activeConsents"
                :key="consent.id"
                class="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center">
                      <Icon
                        name="lucide:user-check"
                        class="h-5 w-5 text-green-600 mr-2"
                      />
                      <h3 class="text-lg font-medium text-gray-900">
                        Dr. {{ consent.doctor.first_name }}
                        {{ consent.doctor.last_name }}
                      </h3>
                    </div>

                    <div class="mt-2 space-y-1">
                      <p class="text-sm text-gray-600">
                        <Icon name="lucide:mail" class="h-4 w-4 inline mr-1" />
                        {{ consent.doctor.email }}
                      </p>
                      <p
                        v-if="consent.doctor.specialty"
                        class="text-sm text-gray-600"
                      >
                        <Icon
                          name="lucide:stethoscope"
                          class="h-4 w-4 inline mr-1"
                        />
                        {{ consent.doctor.specialty }}
                      </p>
                      <p class="text-sm text-gray-600">
                        <Icon
                          name="lucide:calendar"
                          class="h-4 w-4 inline mr-1"
                        />
                        Accordé le {{ formatDate(consent.granted_at) }}
                      </p>
                      <p
                        v-if="consent.expires_at"
                        class="text-sm text-gray-600"
                      >
                        <Icon name="lucide:clock" class="h-4 w-4 inline mr-1" />
                        Expire le {{ formatDate(consent.expires_at) }}
                      </p>
                      <p
                        v-if="consent.notes"
                        class="text-sm text-gray-600 mt-2"
                      >
                        <Icon
                          name="lucide:sticky-note"
                          class="h-4 w-4 inline mr-1"
                        />
                        {{ consent.notes }}
                      </p>
                    </div>
                  </div>

                  <Button
                    @click="showRevokeConfirmation(consent)"
                    variant="destructive"
                    class="ml-4"
                  >
                    <Icon name="lucide:x-circle" class="h-4 w-4 mr-2" />
                    Révoquer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>

    <!-- Modal de confirmation -->
    <Dialog v-model:open="showConfirmModal">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="flex items-center">
            <Icon
              name="lucide:alert-triangle"
              class="h-5 w-5 text-red-500 mr-2"
            />
            Confirmer la révocation
          </DialogTitle>
          <DialogDescription>
            Êtes-vous certain de vouloir révoquer ce consentement ?
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedConsent" class="py-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900">
              Dr. {{ selectedConsent.doctor.first_name }}
              {{ selectedConsent.doctor.last_name }}
            </h4>
            <p class="text-sm text-gray-600">
              {{ selectedConsent.doctor.email }}
            </p>
            <p
              v-if="selectedConsent.doctor.specialty"
              class="text-sm text-gray-600"
            >
              {{ selectedConsent.doctor.specialty }}
            </p>
          </div>

          <div class="mt-4">
            <Label for="revocation-reason"
              >Motif de la révocation (optionnel)</Label
            >
            <Textarea
              id="revocation-reason"
              v-model="revocationReason"
              placeholder="Expliquez pourquoi vous souhaitez révoquer ce consentement..."
              class="mt-1"
              rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button @click="showConfirmModal = false" variant="outline">
            Annuler
          </Button>
          <Button
            @click="confirmRevocation"
            variant="destructive"
            :disabled="isRevoking"
          >
            <Icon
              v-if="isRevoking"
              name="lucide:loader-2"
              class="h-4 w-4 mr-2 animate-spin"
            />
            <Icon v-else name="lucide:x-circle" class="h-4 w-4 mr-2" />
            Révoquer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Consent } from "~/composables/useConsents";

// Middleware d'authentification
definePageMeta({
  middleware: ["auth", "role"],
  role: "patient",
});

// État du composant
const { user, userProfile, signOut } = useAuth();
const { getPatientConsents, revokeConsent } = useConsents();

// État réactif
const loading = ref(true);
const activeConsents = ref<Consent[]>([]);
const successMessage = ref("");
const errorMessage = ref("");
const showConfirmModal = ref(false);
const selectedConsent = ref<Consent | null>(null);
const revocationReason = ref("");
const isRevoking = ref(false);

// Charger les consentements actifs
const loadActiveConsents = async () => {
  try {
    loading.value = true;
    errorMessage.value = "";

    const { data, error } = await getPatientConsents();

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    // Filtrer seulement les consentements actifs (granted)
    activeConsents.value =
      data?.filter((consent) => consent.status === "granted") || [];
  } catch (error) {
    errorMessage.value = "Erreur lors du chargement des consentements";
    console.error("Erreur:", error);
  } finally {
    loading.value = false;
  }
};

// Afficher la confirmation de révocation
const showRevokeConfirmation = (consent: Consent) => {
  selectedConsent.value = consent;
  revocationReason.value = "";
  showConfirmModal.value = true;
};

// Confirmer la révocation
const confirmRevocation = async () => {
  if (!selectedConsent.value) return;

  try {
    isRevoking.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const { error } = await revokeConsent(
      selectedConsent.value.id,
      revocationReason.value
    );

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    successMessage.value = `Consentement révoqué avec succès pour Dr. ${selectedConsent.value.doctor.first_name} ${selectedConsent.value.doctor.last_name}`;
    showConfirmModal.value = false;
    selectedConsent.value = null;
    revocationReason.value = "";

    // Recharger la liste
    await loadActiveConsents();

    // Rediriger après 3 secondes
    setTimeout(() => {
      navigateTo("/consents");
    }, 3000);
  } catch (error) {
    errorMessage.value = "Erreur lors de la révocation du consentement";
    console.error("Erreur:", error);
  } finally {
    isRevoking.value = false;
  }
};

// Gestion de la déconnexion
const handleSignOut = async () => {
  await signOut();
  navigateTo("/auth/login");
};

// Formatage des dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Charger les données au montage
onMounted(() => {
  loadActiveConsents();
});

// Réinitialiser les messages après un délai
watch([successMessage, errorMessage], () => {
  if (successMessage.value || errorMessage.value) {
    setTimeout(() => {
      successMessage.value = "";
      errorMessage.value = "";
    }, 5000);
  }
});
</script>
