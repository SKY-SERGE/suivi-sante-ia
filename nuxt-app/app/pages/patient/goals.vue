<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- En-tête -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Mes objectifs santé</h1>
      <p class="mt-2 text-gray-600">
        Définissez et suivez vos objectifs de santé personnalisés
      </p>
    </div>

    <!-- Actions principales -->
    <div class="flex flex-col sm:flex-row gap-4 mb-8">
      <Button variant="outline" class="border border-blue-600 hover:bg-blue-700" @click="showCreateModal = true">
        <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
        Nouvel objectif
      </Button>

      <Button class="bg-gradient-to-r from-indigo-500 to-blue-600 hover:bg-blue-700" :disabled="loadingSuggestions"
        @click="loadSuggestions">
        <Icon name="lucide:lightbulb" class="h-4 w-4 mr-2" />
        {{ loadingSuggestions ? "Chargement..." : "Suggestions" }}
      </Button>
      <div class="flex gap-2">
        <Button v-for="filter in statusFilters" :key="filter.value"
          :variant="currentFilter === filter.value ? 'default' : 'outline'" size="sm"
          @click="currentFilter = filter.value as | 'all' | 'active' | 'completed' | 'paused'">
          <Icon :name="filter.icon" class="h-4 w-4 mr-1" />
          {{ filter.label }}
        </Button>
      </div>
    </div>

    <!-- Objectifs actifs avec progrès -->
    <div v-if="filteredGoals.length > 0" class="space-y-6">
      <div v-for="goalProgress in filteredGoals" :key="goalProgress.goal.id" class="relative">
        <Card :class="getGoalCardClass(goalProgress.goal.status)">
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <CardTitle class="flex items-center">
                  <Icon :name="getGoalIcon(goalProgress.goal)" class="h-5 w-5 mr-2" />
                  {{ goalProgress.goal.title }}
                  <span :class="getStatusBadgeClass(goalProgress.goal.status)"
                    class="ml-3 px-2 py-1 text-xs font-medium rounded-full">
                    {{ getStatusLabel(goalProgress.goal.status) }}
                  </span>
                </CardTitle>
                <CardDescription class="mt-1">
                  {{ goalProgress.goal.description }}
                </CardDescription>
              </div>

              <!-- Menu d'actions -->
              <div class="flex space-x-2">
                <Button size="sm" variant="ghost" @click="editGoal(goalProgress.goal)">
                  <Icon name="lucide:edit" class="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" @click="toggleGoalStatus(goalProgress.goal)">
                  <Icon :name="goalProgress.goal.status === 'active'
                    ? 'lucide:pause'
                    : 'lucide:play'
                    " class="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" class="text-red-600 hover:text-red-700"
                  @click="deleteGoalConfirm(goalProgress.goal)">
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <!-- Barre de progrès -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progrès: {{ goalProgress.progress.toFixed(1) }}%</span>
                <span>
                  {{ goalProgress.goal.current_value
                  }}{{
                    goalProgress.goal.unit ? " " + goalProgress.goal.unit : ""
                  }}
                  /
                  {{ goalProgress.goal.target_value
                  }}{{
                    goalProgress.goal.unit ? " " + goalProgress.goal.unit : ""
                  }}
                </span>
              </div>

              <div class="w-full bg-gray-200 rounded-full h-3">
                <div :class="getProgressBarClass(goalProgress)" class="h-3 rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min(100, goalProgress.progress)}%` }" />
              </div>
            </div>

            <!-- Informations de suivi -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div class="text-gray-500">Date de début</div>
                <div class="font-medium">
                  {{ formatDate(goalProgress.goal.start_date) }}
                </div>
              </div>

              <div v-if="goalProgress.goal.target_date">
                <div class="text-gray-500">Date cible</div>
                <div class="font-medium">
                  {{ formatDate(goalProgress.goal.target_date) }}
                </div>
              </div>

              <div v-if="goalProgress.daysRemaining !== undefined">
                <div class="text-gray-500">Jours restants</div>
                <div :class="goalProgress.daysRemaining < 7
                  ? 'text-red-600 font-semibold'
                  : 'font-medium'
                  ">
                  {{ goalProgress.daysRemaining }} jours
                </div>
              </div>
            </div>

            <!-- Indicateur de progression -->
            <div v-if="goalProgress.goal.status === 'active'" class="mt-4 p-3 rounded-lg"
              :class="getProgressIndicatorClass(goalProgress)">
              <div class="flex items-center">
                <Icon :name="getProgressIcon(goalProgress)" class="h-5 w-5 mr-2" />
                <span class="font-medium">{{
                  getProgressMessage(goalProgress)
                }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="text-center py-12">
      <Icon name="lucide:target" class="h-16 w-16 mx-auto mb-4 text-gray-300" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{
          currentFilter === "all"
            ? "Aucun objectif défini"
            : "Aucun objectif dans cette catégorie"
        }}
      </h3>
      <p class="text-gray-500 mb-6">
        {{
          currentFilter === "all"
            ? "Commencez par définir votre premier objectif santé"
            : "Aucun objectif ne correspond au filtre sélectionné"
        }}
      </p>
      <Button v-if="currentFilter === 'all'" @click="showCreateModal = true">
        <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
        Créer mon premier objectif
      </Button>
    </div>

    <!-- Modal de création/édition d'objectif -->
    <div v-if="showCreateModal || editingGoal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card class="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{{
            editingGoal ? "Modifier l'objectif" : "Nouvel objectif"
          }}</CardTitle>
          <CardDescription>
            {{
              editingGoal
                ? "Modifiez les détails de votre objectif"
                : "Définissez un nouvel objectif de santé"
            }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="saveGoal">
            <div>
              <Label for="title">Titre de l'objectif *</Label>
              <Input id="title" v-model="goalForm.title" placeholder="Ex: Perdre 5 kg" required />
            </div>

            <div>
              <Label for="description">Description</Label>
              <textarea id="description" v-model="goalForm.description" rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Décrivez votre objectif..." />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="target_value">Valeur cible</Label>
                <Input id="target_value" v-model.number="goalForm.target_value" type="number" step="0.1"
                  placeholder="Ex: 70" />
              </div>
              <div>
                <Label for="unit">Unité</Label>
                <Input id="unit" v-model="goalForm.unit" placeholder="Ex: kg, heures, /10" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="start_date">Date de début</Label>
                <Input id="start_date" v-model="goalForm.start_date" type="date" required />
              </div>
              <div>
                <Label for="target_date">Date cible</Label>
                <Input id="target_date" v-model="goalForm.target_date" type="date" />
              </div>
            </div>

            <div class="flex space-x-3 pt-4">
              <Button type="submit" :disabled="saving" class="flex-1">
                <Icon v-if="saving" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
                {{
                  saving
                    ? "Enregistrement..."
                    : editingGoal
                      ? "Modifier"
                      : "Créer"
                }}
              </Button>
              <Button type="button" variant="outline" @click="cancelEdit">
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>

    <!-- Modal de suggestions -->
    <div v-if="showSuggestions && suggestions.length > 0"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card class="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Suggestions d'objectifs</CardTitle>
          <CardDescription>
            Basées sur vos données de santé existantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="(suggestion, index) in suggestions" :key="index"
              class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" @click="createFromSuggestion(suggestion)">
              <h4 class="font-medium">{{ suggestion.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">
                {{ suggestion.description }}
              </p>
              <div class="flex items-center text-sm text-gray-500 mt-2">
                <Icon name="lucide:target" class="h-4 w-4 mr-1" />
                Objectif: {{ suggestion.target_value }} {{ suggestion.unit }}
              </div>
            </div>
          </div>
          <div class="flex space-x-3 pt-4">
            <Button variant="outline" class="flex-1" @click="showSuggestions = false">
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "role"],
});

// Composables
const {
  getGoalsWithProgress,
  createGoal,
  updateGoal,
  deleteGoal,
} = useHealthGoals();
const toastStore = useToastStore();

// États réactifs
const goals = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const loadingSuggestions = ref(false);
const showCreateModal = ref(false);
const showSuggestions = ref(false);
const editingGoal = ref<any>(null);
const suggestions = ref<any[]>([]);
const currentFilter = ref<"all" | "active" | "completed" | "paused">("all");

// Formulaire d'objectif
const goalForm = ref({
  title: "",
  description: "",
  target_value: 0,
  current_value: 0,
  unit: "",
  start_date: new Date().toISOString().split("T")[0],
  target_date: "",
});

// Configuration des filtres
const statusFilters = [
  { value: "all", label: "Tous", icon: "lucide:list" },
  { value: "active", label: "Actifs", icon: "lucide:play" },
  { value: "completed", label: "Terminés", icon: "lucide:check" },
  { value: "paused", label: "En pause", icon: "lucide:pause" },
];

// Computed
const filteredGoals = computed(() => {
  if (currentFilter.value === "all") return goals.value;
  return goals.value.filter((g) => g.goal.status === currentFilter.value);
});

// Méthodes
const loadGoals = async () => {
  loading.value = true;
  try {
    goals.value = await getGoalsWithProgress();
  } catch (error) {
    console.error("Erreur lors du chargement des objectifs:", error);
    toastStore.error("Impossible de charger les objectifs", "Erreur");
  } finally {
    loading.value = false;
  }
};

const saveGoal = async () => {
  saving.value = true;
  try {
    if (editingGoal.value) {
      const updated = await updateGoal(editingGoal.value.id, goalForm.value);
      if (updated) {
        toastStore.success(
          "Objectif modifié avec succès",
          "Modification enregistrée"
        );
        await loadGoals();
        cancelEdit();
      }
    } else {
      const created = await createGoal({
        ...goalForm.value,
        status: "active",
      });
      if (created) {
        toastStore.success("Objectif créé avec succès", "Nouvel objectif");
        await loadGoals();
        cancelEdit();
      }
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    toastStore.error("Impossible de sauvegarder l'objectif", "Erreur");
  } finally {
    saving.value = false;
  }
};

const editGoal = (goal: any) => {
  editingGoal.value = goal;
  goalForm.value = {
    title: goal.title,
    description: goal.description || "",
    target_value: goal.target_value || 0,
    current_value: goal.current_value || 0,
    unit: goal.unit || "",
    start_date: goal.start_date,
    target_date: goal.target_date || "",
  };
};

const cancelEdit = () => {
  showCreateModal.value = false;
  editingGoal.value = null;
  goalForm.value = {
    title: "",
    description: "",
    target_value: 0,
    current_value: 0,
    unit: "",
    start_date: new Date().toISOString().split("T")[0],
    target_date: "",
  };
};

const toggleGoalStatus = async (goal: any) => {
  const newStatus = goal.status === "active" ? "paused" : "active";
  const updated = await updateGoal(goal.id, { status: newStatus });
  if (updated) {
    toastStore.success(
      `Objectif ${newStatus === "active" ? "réactivé" : "mis en pause"}`,
      "Statut modifié"
    );
    await loadGoals();
  }
};

const deleteGoalConfirm = async (goal: any) => {
  if (
    confirm(`Êtes-vous sûr de vouloir supprimer l'objectif "${goal.title}" ?`)
  ) {
    const deleted = await deleteGoal(goal.id);
    if (deleted) {
      toastStore.success("Objectif supprimé", "Suppression effectuée");
      await loadGoals();
    }
  }
};

const loadSuggestions = async () => {
  loadingSuggestions.value = true;
  try {
    // Appel à l'API pour obtenir des suggestions personnalisées
    const response = await $fetch<{ success: boolean, suggestions: any[] }>('/api/ai/goal-suggestions', {
      method: 'POST',
      body: {
        healthData: [],
        existingGoals: goals.value.map(g => ({
          title: g.title,
          category: g.category || 'other',
          status: g.status
        })),
        userPreferences: {}
      }
    });

    suggestions.value = response?.suggestions || [];
    if (suggestions.value.length > 0) {
      showSuggestions.value = true;
    } else {
      toastStore.info(
        "Aucune suggestion disponible pour le moment",
        "Suggestions"
      );
    }
  } catch (error) {
    console.error("Erreur lors du chargement des suggestions:", error);
    toastStore.error("Impossible de charger les suggestions", "Erreur");
  } finally {
    loadingSuggestions.value = false;
  }
};

const createFromSuggestion = (suggestion: any) => {
  goalForm.value = {
    title: suggestion.title,
    description: suggestion.description || "",
    target_value: suggestion.target_value || 0,
    current_value: suggestion.current_value || 0,
    unit: suggestion.unit || "",
    start_date: suggestion.start_date || new Date().toISOString().split("T")[0],
    target_date: suggestion.target_date || "",
  };
  showSuggestions.value = false;
  showCreateModal.value = true;
};

// Fonctions utilitaires pour l'interface
const getGoalIcon = (goal: any) => {
  if (goal.unit === "kg") return "lucide:scale";
  if (goal.unit === "heures") return "lucide:moon";
  if (goal.unit === "/10") return "lucide:smile";
  if (goal.unit === "sessions") return "lucide:activity";
  return "lucide:target";
};

const getStatusLabel = (status: string) => {
  const labels = {
    active: "Actif",
    completed: "Terminé",
    paused: "En pause",
    cancelled: "Annulé",
  };
  return labels[status as keyof typeof labels] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    paused: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return classes[status as keyof typeof classes] || "bg-gray-100 text-gray-800";
};

const getGoalCardClass = (status: string) => {
  const classes = {
    active: "border-green-200",
    completed: "border-blue-200 bg-blue-50",
    paused: "border-yellow-200 bg-yellow-50",
    cancelled: "border-red-200 bg-red-50",
  };
  return classes[status as keyof typeof classes] || "";
};

const getProgressBarClass = (goalProgress: any) => {
  if (goalProgress.goal.status === "completed") return "bg-blue-500";
  if (goalProgress.isOnTrack) return "bg-green-500";
  return "bg-orange-500";
};

const getProgressIndicatorClass = (goalProgress: any) => {
  if (goalProgress.isOnTrack) return "bg-green-50 border border-green-200";
  return "bg-orange-50 border border-orange-200";
};

const getProgressIcon = (goalProgress: any) => {
  if (goalProgress.isOnTrack) return "lucide:trending-up";
  return "lucide:alert-circle";
};

const getProgressMessage = (goalProgress: any) => {
  if (goalProgress.isOnTrack) {
    return "Vous êtes sur la bonne voie ! Continuez ainsi.";
  }
  return "Vous avez pris du retard. Peut-être ajuster votre approche ?";
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Lifecycle
onMounted(() => {
  loadGoals();
});
</script>
