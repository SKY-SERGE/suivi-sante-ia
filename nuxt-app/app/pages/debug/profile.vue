<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic - Création de Profil Utilisateur</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- État d'authentification -->
          <div>
            <h3 class="text-lg font-semibold mb-2">État d'authentification</h3>
            <Button @click="checkAuth" variant="outline">
              Vérifier l'authentification
            </Button>
            <div v-if="authState" class="mt-2 p-3 bg-gray-100 rounded text-sm">
              <pre>{{ JSON.stringify(authState, null, 2) }}</pre>
            </div>
          </div>

          <!-- Test des politiques RLS -->
          <div>
            <h3 class="text-lg font-semibold mb-2">Test des politiques RLS</h3>
            <Button @click="testRLS" variant="outline">
              Tester les politiques RLS
            </Button>
            <div v-if="rlsResults" class="mt-2 p-3 bg-gray-100 rounded text-sm">
              <pre>{{ JSON.stringify(rlsResults, null, 2) }}</pre>
            </div>
          </div>

          <!-- Création de profil via RPC -->
          <div>
            <h3 class="text-lg font-semibold mb-2">
              Création de profil via RPC
            </h3>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Prénom</Label>
                <Input v-model="testProfile.first_name" placeholder="Prénom" />
              </div>
              <div>
                <Label>Nom</Label>
                <Input v-model="testProfile.last_name" placeholder="Nom" />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  v-model="testProfile.email"
                  placeholder="Email"
                  type="email"
                />
              </div>
              <div>
                <Label>Rôle</Label>
                <select
                  v-model="testProfile.role"
                  class="w-full p-2 border rounded"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Médecin</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>
            <Button @click="createProfileRPC" :disabled="isCreating">
              <Icon
                v-if="isCreating"
                name="lucide:loader-2"
                class="w-4 h-4 mr-2 animate-spin"
              />
              Créer profil via RPC
            </Button>
            <div
              v-if="rpcResult"
              class="mt-2 p-3 rounded text-sm"
              :class="
                rpcResult.error
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              "
            >
              <pre>{{ JSON.stringify(rpcResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Création de profil via API -->
          <div>
            <h3 class="text-lg font-semibold mb-2">
              Création de profil via API
            </h3>
            <Button @click="createProfileAPI" :disabled="isCreatingAPI">
              <Icon
                v-if="isCreatingAPI"
                name="lucide:loader-2"
                class="w-4 h-4 mr-2 animate-spin"
              />
              Créer profil via API
            </Button>
            <div
              v-if="apiResult"
              class="mt-2 p-3 rounded text-sm"
              :class="
                apiResult.error
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              "
            >
              <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Logs -->
          <div>
            <h3 class="text-lg font-semibold mb-2">Logs</h3>
            <Button @click="clearLogs" variant="outline" size="sm">
              Effacer les logs
            </Button>
            <div
              class="mt-2 p-3 bg-black text-green-400 rounded text-sm font-mono h-48 overflow-y-auto"
            >
              <div v-for="(log, index) in logs" :key="index" class="mb-1">
                [{{ log.timestamp }}] {{ log.message }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
  title: "Diagnostic - Profil Utilisateur",
});

// Composables
const { user } = useUser();
const { checkAuthenticationState, testRLSPolicies, createProfileDirectRPC } =
  useUserProfileAdmin();

// État réactif
const authState = ref(null);
const rlsResults = ref(null);
const rpcResult = ref(null);
const apiResult = ref(null);
const isCreating = ref(false);
const isCreatingAPI = ref(false);
const logs = ref<Array<{ timestamp: string; message: string }>>([]);

// Données de test pour le profil
const testProfile = ref({
  first_name: "Test",
  last_name: "User",
  email: user.value?.email || "test@example.com",
  role: "patient",
});

// Fonction utilitaire pour ajouter des logs
const addLog = (message: string) => {
  logs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    message,
  });
};

// Vérifier l'authentification
const checkAuth = async () => {
  addLog("Vérification de l'état d'authentification...");
  try {
    authState.value = await checkAuthenticationState();
    addLog("État d'authentification récupéré");
  } catch (error: any) {
    addLog(`Erreur lors de la vérification: ${error.message}`);
  }
};

// Tester les politiques RLS
const testRLS = async () => {
  addLog("Test des politiques RLS...");
  try {
    rlsResults.value = await testRLSPolicies();
    addLog("Test RLS terminé");
  } catch (error: any) {
    addLog(`Erreur lors du test RLS: ${error.message}`);
  }
};

// Créer un profil via RPC
const createProfileRPC = async () => {
  addLog("Création de profil via RPC...");
  isCreating.value = true;
  rpcResult.value = null;

  try {
    const result = await createProfileDirectRPC(testProfile.value);
    rpcResult.value = result;

    if (result.error) {
      addLog(`Erreur RPC: ${result.error.message}`);
    } else {
      addLog("Profil créé avec succès via RPC");
    }
  } catch (error: any) {
    addLog(`Erreur lors de la création RPC: ${error.message}`);
    rpcResult.value = { error: error.message };
  } finally {
    isCreating.value = false;
  }
};

// Créer un profil via API
const createProfileAPI = async () => {
  addLog("Création de profil via API...");
  isCreatingAPI.value = true;
  apiResult.value = null;

  try {
    const response = await $fetch("/api/user/create-profile", {
      method: "POST",
      body: {
        userId: user.value?.id,
        profileData: testProfile.value,
      },
    });

    apiResult.value = { data: response, error: null };
    addLog("Profil créé avec succès via API");
  } catch (error: any) {
    addLog(`Erreur lors de la création API: ${error.message}`);
    apiResult.value = { data: null, error: error.message };
  } finally {
    isCreatingAPI.value = false;
  }
};

// Effacer les logs
const clearLogs = () => {
  logs.value = [];
  addLog("Logs effacés");
};

// Initialisation
onMounted(() => {
  addLog("Page de diagnostic chargée");
  if (user.value) {
    testProfile.value.email = user.value.email || "test@example.com";
  }
});
</script>
