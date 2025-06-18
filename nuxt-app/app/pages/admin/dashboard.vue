<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Titre de bienvenue -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Dashboard Administrateur
        </h1>
        <p class="mt-2 text-gray-600">
          Gérez les utilisateurs et surveillez la plateforme
        </p>
      </div>

      <!-- Statistiques système -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <Icon name="lucide:users" class="h-8 w-8 text-blue-600" />
              <div class="ml-4">
                <div class="text-2xl font-bold">{{ stats.totalUsers }}</div>
                <div class="text-gray-600">Utilisateurs totaux</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <Icon name="lucide:user-check" class="h-8 w-8 text-green-600" />
              <div class="ml-4">
                <div class="text-2xl font-bold">{{ stats.patients }}</div>
                <div class="text-gray-600">Patients</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <Icon name="lucide:stethoscope" class="h-8 w-8 text-purple-600" />
              <div class="ml-4">
                <div class="text-2xl font-bold">{{ stats.doctors }}</div>
                <div class="text-gray-600">Médecins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <Icon
                name="lucide:shield-check"
                class="h-8 w-8 text-orange-600"
              />
              <div class="ml-4">
                <div class="text-2xl font-bold">
                  {{ stats.activeConsents }}
                </div>
                <div class="text-gray-600">Consentements actifs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <!-- Gestion des utilisateurs -->
      <Card class="mb-8">
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <div class="flex items-center">
              <Icon name="lucide:users" class="h-5 w-5 mr-2" />
              Gestion des Utilisateurs
            </div>
            <div class="flex items-center space-x-2">
              <Button variant="outline" size="sm" @click="refreshUsers">
                <Icon name="lucide:refresh-cw" class="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button size="sm" @click="openCreateUserDialog">
                <Icon name="lucide:user-plus" class="h-4 w-4 mr-2" />
                Ajouter utilisateur
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Gérez les comptes utilisateurs, leurs rôles et leurs statuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <!-- Filtres et recherche -->
          <div class="mb-6 space-y-4">
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <Input
                  v-model="searchQuery"
                  placeholder="Rechercher par nom, email..."
                  class="w-full"
                />
              </div>
              <div class="flex gap-2">
                <select
                  v-model="selectedRole"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Tous les rôles</option>
                  <option value="patient">Patients</option>
                  <option value="doctor">Médecins</option>
                  <option value="admin">Administrateurs</option>
                </select>
                <select
                  v-model="selectedStatus"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Suspendus</option>
                </select>
              </div>
            </div>

            <!-- Actions groupées -->
            <div
              v-if="selectedUsers.length > 0"
              class="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
            >
              <span class="text-sm text-blue-700">
                {{ selectedUsers.length }} utilisateur(s) sélectionné(s)
              </span>
              <div class="flex gap-2">
                <Button size="sm" variant="outline" @click="bulkActivate">
                  Activer
                </Button>
                <Button size="sm" variant="outline" @click="bulkDeactivate">
                  Suspendre
                </Button>
                <Button size="sm" variant="outline" @click="clearSelection">
                  Annuler
                </Button>
              </div>
            </div>
          </div>

          <div v-if="loading" class="text-center py-8">
            <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin mx-auto" />
            <p class="mt-2">Chargement des utilisateurs...</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-if="filteredUsers.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <Icon
                name="lucide:search-x"
                class="h-12 w-12 mx-auto mb-4 text-gray-300"
              />
              <p>Aucun utilisateur trouvé avec ces critères</p>
            </div>

            <div
              v-for="user in paginatedUsers"
              :key="user.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center">
                <input
                  type="checkbox"
                  :checked="selectedUsers.includes(user.id)"
                  @change="toggleUserSelection(user.id)"
                  class="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <div
                  class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center"
                >
                  <Icon
                    :name="getRoleIcon(user.role)"
                    class="h-5 w-5 text-blue-600"
                  />
                </div>
                <div class="ml-4">
                  <div class="font-medium">
                    {{ user.first_name }} {{ user.last_name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ user.email }} • {{ getRoleLabel(user.role) }}
                  </div>
                  <div class="text-xs text-gray-400">
                    Créé le {{ formatDate(user.created_at) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ user.is_active ? "Actif" : "Suspendu" }}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  @click="openEditUserDialog(user)"
                >
                  <Icon name="lucide:edit" class="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  @click="toggleUserStatus(user)"
                  :class="
                    user.is_active
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  "
                >
                  {{ user.is_active ? "Suspendre" : "Activer" }}
                </Button>
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="filteredUsers.length > usersPerPage"
              class="flex justify-center mt-6"
            >
              <div class="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                >
                  Précédent
                </Button>
                <span class="text-sm text-gray-700">
                  Page {{ currentPage }} sur {{ totalPages }}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Actions d'administration -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Icon name="lucide:activity" class="h-5 w-5 mr-2" />
              Surveillance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <Button class="w-full" variant="outline">
                <Icon name="lucide:bar-chart" class="h-4 w-4 mr-2" />
                Rapports d'activité
              </Button>
              <Button class="w-full" variant="outline">
                <Icon name="lucide:shield-alert" class="h-4 w-4 mr-2" />
                Logs de sécurité
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Icon name="lucide:settings" class="h-5 w-5 mr-2" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <Button class="w-full" variant="outline">
                <Icon name="lucide:database" class="h-4 w-4 mr-2" />
                Base de données
              </Button>
              <Button class="w-full" variant="outline">
                <Icon name="lucide:mail" class="h-4 w-4 mr-2" />
                Paramètres email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Icon name="lucide:help-circle" class="h-5 w-5 mr-2" />
              Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <Button class="w-full" variant="outline">
                <Icon name="lucide:file-text" class="h-4 w-4 mr-2" />
                Documentation
              </Button>
              <Button class="w-full" variant="outline">
                <Icon name="lucide:download" class="h-4 w-4 mr-2" />
                Sauvegarde
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <!-- Dialog de création/édition d'utilisateur -->
  <Dialog v-model:open="userDialogOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ editingUser ? "Modifier l'utilisateur" : "Créer un utilisateur" }}
        </DialogTitle>
        <DialogDescription>
          {{
            editingUser
              ? "Modifiez les informations de l'utilisateur."
              : "Créez un nouveau compte utilisateur."
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="saveUser" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium">Prénom</label>
            <Input
              v-model="userForm.first_name"
              placeholder="Prénom"
              required
            />
          </div>
          <div>
            <label class="text-sm font-medium">Nom</label>
            <Input v-model="userForm.last_name" placeholder="Nom" required />
          </div>
        </div>

        <div>
          <label class="text-sm font-medium">Email</label>
          <Input
            v-model="userForm.email"
            type="email"
            placeholder="email@exemple.com"
            required
          />
        </div>

        <div>
          <label class="text-sm font-medium">Rôle</label>
          <select
            v-model="userForm.role"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            required
          >
            <option value="">Sélectionner un rôle</option>
            <option value="patient">Patient</option>
            <option value="doctor">Médecin</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        <div v-if="!editingUser">
          <label class="text-sm font-medium">Mot de passe temporaire</label>
          <Input
            v-model="userForm.password"
            type="password"
            placeholder="Mot de passe"
            required
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="userForm.is_active"
            id="user-active"
            class="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label for="user-active" class="text-sm font-medium"
            >Compte actif</label
          >
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="closeUserDialog">
            Annuler
          </Button>
          <Button type="submit" :disabled="savingUser">
            <Icon
              v-if="savingUser"
              name="lucide:loader-2"
              class="h-4 w-4 mr-2 animate-spin"
            />
            {{ editingUser ? "Mettre à jour" : "Créer" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <!-- Dialog de confirmation -->
  <Dialog v-model:open="confirmDialogOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ confirmAction.title }}</DialogTitle>
        <DialogDescription>
          {{ confirmAction.message }}
        </DialogDescription>
      </DialogHeader>
      <div>
        <p class="text-sm text-gray-500">
          Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="confirmDialogOpen = false">
          Annuler
        </Button>
        <Button
          @click="executeConfirmAction"
          :variant="confirmAction.variant || 'default'"
        >
          Confirmer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserForm {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  password: string;
  is_active: boolean;
}

interface ConfirmAction {
  title: string;
  message: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  action: () => Promise<void>;
}

// Composables
const { user } = useUser();
const supabaseClient = useSupabaseClient();
const { showToast } = useToast();

// États réactifs
const loading = ref(true);
const users = ref<User[]>([]);
const stats = ref({
  totalUsers: 0,
  patients: 0,
  doctors: 0,
  activeConsents: 0,
});

// États pour la recherche et le filtrage
const searchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");
const currentPage = ref(1);
const usersPerPage = 10;

// États pour la sélection multiple
const selectedUsers = ref<string[]>([]);

// États pour les dialogs
const userDialogOpen = ref(false);
const confirmDialogOpen = ref(false);
const editingUser = ref<User | null>(null);
const savingUser = ref(false);

// Formulaire utilisateur
const userForm = ref<UserForm>({
  first_name: "",
  last_name: "",
  email: "",
  role: "",
  password: "",
  is_active: true,
});

// Action de confirmation
const confirmAction = ref<ConfirmAction>({
  title: "",
  message: "",
  variant: "default",
  action: async () => {},
});

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value;

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }

  // Filtrage par rôle
  if (selectedRole.value) {
    filtered = filtered.filter((user) => user.role === selectedRole.value);
  }

  // Filtrage par statut
  if (selectedStatus.value) {
    const isActive = selectedStatus.value === "active";
    filtered = filtered.filter((user) => user.is_active === isActive);
  }

  return filtered;
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * usersPerPage;
  const end = start + usersPerPage;
  return filteredUsers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / usersPerPage);
});

// Fonctions utilitaires
const getRoleIcon = (role: string) => {
  switch (role) {
    case "patient":
      return "lucide:user";
    case "doctor":
      return "lucide:stethoscope";
    case "admin":
      return "lucide:shield";
    default:
      return "lucide:user";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "patient":
      return "Patient";
    case "doctor":
      return "Médecin";
    case "admin":
      return "Administrateur";
    default:
      return "Utilisateur";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR");
};

// Gestion de la sélection
const toggleUserSelection = (userId: string) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index === -1) {
    selectedUsers.value.push(userId);
  } else {
    selectedUsers.value.splice(index, 1);
  }
};

const clearSelection = () => {
  selectedUsers.value = [];
};

// Actions groupées
const bulkActivate = async () => {
  await bulkUpdateStatus(true);
};

const bulkDeactivate = async () => {
  await bulkUpdateStatus(false);
};

const bulkUpdateStatus = async (isActive: boolean) => {
  try {
    const { error } = await supabaseClient
      .from("users")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .in("id", selectedUsers.value);

    if (!error) {
      // Mettre à jour le state local
      users.value.forEach((user) => {
        if (selectedUsers.value.includes(user.id)) {
          user.is_active = isActive;
        }
      });
      clearSelection();
      showToast({
        title: "Succès",
        description: `${selectedUsers.value.length} utilisateur(s) ${
          isActive ? "activé(s)" : "suspendu(s)"
        }`,
      });
    } else {
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour groupée:", error);
    showToast({
      title: "Erreur",
      description: "Erreur lors de la mise à jour des utilisateurs",
      variant: "error",
    });
  }
};

// Gestion des dialogs
const openCreateUserDialog = () => {
  editingUser.value = null;
  userForm.value = {
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    password: "",
    is_active: true,
  };
  userDialogOpen.value = true;
};

const openEditUserDialog = (user: User) => {
  editingUser.value = user;
  userForm.value = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    password: "",
    is_active: user.is_active,
  };
  userDialogOpen.value = true;
};

const closeUserDialog = () => {
  userDialogOpen.value = false;
  editingUser.value = null;
  savingUser.value = false;
};

// Sauvegarde utilisateur
const saveUser = async () => {
  savingUser.value = true;

  try {
    if (editingUser.value) {
      // Mise à jour
      const { error } = await supabaseClient
        .from("users")
        .update({
          first_name: userForm.value.first_name,
          last_name: userForm.value.last_name,
          email: userForm.value.email,
          role: userForm.value.role,
          is_active: userForm.value.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingUser.value.id);

      if (!error) {
        // Mettre à jour le state local
        const userIndex = users.value.findIndex(
          (u) => u.id === editingUser.value!.id
        );
        if (userIndex !== -1) {
          const user = users.value[userIndex]!;
          user.first_name = userForm.value.first_name;
          user.last_name = userForm.value.last_name;
          user.email = userForm.value.email;
          user.role = userForm.value.role as "patient" | "doctor" | "admin";
          user.is_active = userForm.value.is_active;
          user.updated_at = new Date().toISOString();
        }
        showToast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès",
        });
        closeUserDialog();
      } else {
        throw error;
      }
    } else {
      // Création - ici on devrait utiliser l'API d'authentification supabaseClient
      showToast({
        title: "Information",
        description:
          "La création d'utilisateurs nécessite une implémentation côté serveur",
        variant: "error",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    showToast({
      title: "Erreur",
      description: "Erreur lors de la sauvegarde de l'utilisateur",
      variant: "error",
    });
  } finally {
    savingUser.value = false;
  }
};

// Exécution de l'action de confirmation
const executeConfirmAction = async () => {
  confirmDialogOpen.value = false;
  await confirmAction.value.action();
};

// Charger les données administratives
const loadAdminData = async () => {
  if (!user.value) return;

  try {
    // Charger tous les utilisateurs
    const { data: allUsers, error: usersError } = await supabaseClient
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (!usersError && allUsers) {
      users.value = allUsers as User[];
      stats.value.totalUsers = allUsers.length;
      stats.value.patients = allUsers.filter(
        (u) => u.role === "patient"
      ).length;
      stats.value.doctors = allUsers.filter((u) => u.role === "doctor").length;
    }

    // Charger les consentements actifs
    const { data: consents, error: consentsError } = await supabaseClient
      .from("consents")
      .select("*")
      .eq("status", "granted");

    if (!consentsError && consents) {
      stats.value.activeConsents = consents.length;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    showToast({
      title: "Erreur",
      description: "Erreur lors du chargement des données",
      variant: "error",
    });
  } finally {
    loading.value = false;
  }
};

// Actualiser les données
const refreshUsers = async () => {
  loading.value = true;
  await loadAdminData();
};

// Basculer le statut d'un utilisateur
const toggleUserStatus = async (targetUser: User) => {
  try {
    const { error } = await supabaseClient
      .from("users")
      .update({
        is_active: !targetUser.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUser.id);

    if (!error) {
      targetUser.is_active = !targetUser.is_active;
      showToast({
        title: "Succès",
        description: `Utilisateur ${
          targetUser.is_active ? "activé" : "suspendu"
        } avec succès`,
      });
    } else {
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    showToast({
      title: "Erreur",
      description: "Erreur lors de la mise à jour du statut utilisateur",
      variant: "error",
    });
  }
};

// Gestion de la déconnexion
const handleSignOut = async () => {
  await logout();
};

// Watchers pour réinitialiser la pagination
watch([searchQuery, selectedRole, selectedStatus], () => {
  currentPage.value = 1;
});

// Initialisation
onMounted(async () => {
  await loadAdminData();
});

// Meta données de la page
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
  title: "Administration",
});
</script>
