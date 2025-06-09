<template>
  <div class="p-6">
    <!-- Titre de bienvenue -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Mon espace personnel</h1>
      <p class="mt-2 text-gray-600">
        Bienvenue dans votre espace personnel de suivi de santé
      </p>
    </div>

    <!-- Messages selon le rôle -->
    <Card v-if="userProfile" class="mb-6">
      <CardHeader>
        <CardTitle class="flex items-center">
          <Icon
            :name="getRoleIcon(userProfile.role)"
            class="h-5 w-5 mr-2 text-blue-600"
          />
          Espace {{ getRoleLabel(userProfile.role) }}
        </CardTitle>
        <CardDescription>
          {{ getRoleDescription(userProfile.role) }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Fonctionnalités selon le rôle -->
          <EspacePatient v-if="userProfile.role === 'patient'"></EspacePatient>
          <EspaceDoctor
            v-else-if="userProfile.role === 'doctor'"
          ></EspaceDoctor>
          <EspaceAdmin v-else-if="userProfile.role === 'admin'"></EspaceAdmin>
        </div>
      </CardContent>
    </Card>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">
            Dernière connexion
          </CardTitle>
          <Icon name="lucide:clock" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">Aujourd'hui</div>
          <p class="text-xs text-muted-foreground">
            {{ formatDate(new Date()) }}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium"> Statut du compte </CardTitle>
          <Icon name="lucide:check-circle" class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">Actif</div>
          <p class="text-xs text-muted-foreground">
            Compte vérifié et opérationnel
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium"> Type de compte </CardTitle>
          <Icon
            :name="getRoleIcon(userProfile?.role)"
            class="h-4 w-4 text-blue-600"
          />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ getRoleLabel(userProfile?.role) }}
          </div>
          <p class="text-xs text-muted-foreground">
            Accès aux fonctionnalités {{ userProfile?.role }}
          </p>
        </CardContent>
      </Card>
    </div>
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

// Composables
const { user, userProfile, logout } = useAuth();

// Gestion de la déconnexion
const handleSignOut = async () => {
  await logout();
};

// Meta données de la page
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
  title: "Tableau de bord",
});
</script>
