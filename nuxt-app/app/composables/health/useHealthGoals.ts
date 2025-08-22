import { ref, computed, readonly } from "vue";

/**
 * Composable pour la gestion des objectifs de santé avec IA
 * Intègre des suggestions intelligentes et un suivi avancé
 */

// Types et interfaces
export interface HealthGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  status: "active" | "completed" | "paused" | "cancelled";
  start_date: string;
  target_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  category?:
    | "weight"
    | "activity"
    | "sleep"
    | "mood"
    | "nutrition"
    | "medical"
    | "other";
  priority?: "low" | "medium" | "high";
  ai_generated?: boolean;
}

export interface CreateHealthGoal {
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  target_date?: string;
  category?: HealthGoal["category"];
  priority?: HealthGoal["priority"];
  ai_generated?: boolean;
  status: HealthGoal["status"];
}

export interface GoalSuggestion {
  title: string;
  description: string;
  category: HealthGoal["category"];
  priority: HealthGoal["priority"];
  target_value?: number;
  current_value?: number;
  unit?: string;
  target_date: string;
  reasoning: string;
  confidence: number;
}

export interface GoalStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  cancelled: number;
  completionRate: number;
}

export interface GoalProgress {
  goal: HealthGoal;
  progress: number;
  isOnTrack: boolean;
  daysRemaining?: number;
  averageDailyProgress?: number;
}

// Constantes utiles
export const GOAL_CATEGORIES = [
  "weight",
  "activity",
  "sleep",
  "mood",
  "nutrition",
  "medical",
  "other",
] as const;

export const GOAL_PRIORITIES = ["low", "medium", "high"] as const;

export const DEFAULT_GOAL_DURATION_DAYS = 30;

// Fonctions utilitaires
const validateGoalData = (goalData: CreateHealthGoal): boolean => {
  if (!goalData.title?.trim()) return false;
  if (goalData.current_value < 0) return false;
  if (goalData.target_value && goalData.target_value <= 0) return false;
  if (goalData.target_date && new Date(goalData.target_date) < new Date())
    return false;
  return true;
};

const calculateGoalProgress = (goal: HealthGoal): GoalProgress => {
  const progress =
    goal.target_value && goal.target_value > 0
      ? Math.min(
          100,
          Math.max(0, (goal.current_value / goal.target_value) * 100)
        )
      : 0;

  const startDate = new Date(goal.start_date);
  const targetDate = goal.target_date ? new Date(goal.target_date) : null;
  const today = new Date();

  let daysRemaining: number | undefined;
  let averageDailyProgress: number | undefined;
  let isOnTrack = true;

  if (targetDate) {
    daysRemaining = Math.ceil(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining > 0 && goal.target_value) {
      const remainingValue = goal.target_value - goal.current_value;
      averageDailyProgress = remainingValue / daysRemaining;

      const elapsedDays = Math.ceil(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalDays = Math.ceil(
        (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const expectedProgress =
        totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;

      isOnTrack = progress >= expectedProgress * 0.8;
    }
  }

  return {
    goal,
    progress,
    isOnTrack,
    daysRemaining:
      daysRemaining && daysRemaining > 0 ? daysRemaining : undefined,
    averageDailyProgress,
  };
};

export const useHealthGoals = () => {
  // Client Supabase et état
  const supabaseClient = useSupabaseClient();
  const user = useSupabaseUser();
  const showToast = useToast().showToast;

  // État réactif
  const goals = ref<HealthGoal[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const suggestions = ref<GoalSuggestion[]>([]);

  // Propriétés calculées
  const userId = computed(() => user.value?.id || null);

  const goalStats = computed((): GoalStats => {
    const total = goals.value.length;
    const active = goals.value.filter((g) => g.status === "active").length;
    const completed = goals.value.filter(
      (g) => g.status === "completed"
    ).length;
    const paused = goals.value.filter((g) => g.status === "paused").length;
    const cancelled = goals.value.filter(
      (g) => g.status === "cancelled"
    ).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, active, completed, paused, cancelled, completionRate };
  });

  const activeGoals = computed(() =>
    goals.value.filter((goal) => goal.status === "active")
  );

  const completedGoals = computed(() =>
    goals.value.filter((goal) => goal.status === "completed")
  );

  const urgentGoals = computed(() => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    return goals.value.filter(
      (goal) =>
        goal.status === "active" &&
        goal.target_date &&
        new Date(goal.target_date) <= threeDaysFromNow &&
        new Date(goal.target_date) >= new Date()
    );
  });

  // Méthodes principales (simplifiées pour éviter les erreurs Supabase)
  const fetchGoals = async (): Promise<HealthGoal[]> => {
    if (!userId.value) return [];

    isLoading.value = true;
    error.value = null;

    try {
      // Cast explicite pour contourner les problèmes de types Supabase
      const query = supabaseClient.from("health_goals") as any;

      const { data, error: supabaseError } = await query
        .select("*")
        .eq("user_id", userId.value)
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;

      goals.value = data || [];
      return goals.value;
    } catch (err: any) {
      error.value = err.message || "Erreur lors de la récupération";
      console.error("Erreur fetchGoals:", err);
      showToast({
        title: "Erreur",
        description: error.value || undefined,
        variant: "error",
      });
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const createGoal = async (
    goalData: CreateHealthGoal
  ): Promise<HealthGoal | null> => {
    if (!userId.value || !validateGoalData(goalData)) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const newGoal = {
        ...goalData,
        user_id: userId.value,
        start_date: new Date().toISOString().split("T")[0]!,
      };

      const query = supabaseClient.from("health_goals") as any;
      const { data, error: supabaseError } = await query
        .insert(newGoal)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      const createdGoal = data as HealthGoal;
      goals.value.unshift(createdGoal);
      showToast({ title: "Objectif créé", variant: "success" });

      return createdGoal;
    } catch (err: any) {
      error.value = err.message || "Erreur lors de la création";
      console.error("Erreur createGoal:", err);
      showToast({
        title: "Erreur",
        description: error.value || undefined,
        variant: "error",
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updateGoal = async (
    goalId: string,
    updates: Partial<HealthGoal>
  ): Promise<HealthGoal | null> => {
    if (!userId.value) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const query = supabaseClient.from("health_goals") as any;
      const { data, error: supabaseError } = await query
        .update(updates)
        .eq("id", goalId)
        .eq("user_id", userId.value)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      const updatedGoal = data as HealthGoal;
      const goalIndex = goals.value.findIndex((g) => g.id === goalId);
      if (goalIndex !== -1) {
        goals.value[goalIndex] = updatedGoal;
      }

      showToast({ title: "Objectif mis à jour", variant: "success" });
      return updatedGoal;
    } catch (err: any) {
      error.value = err.message || "Erreur lors de la mise à jour";
      console.error("Erreur updateGoal:", err);
      showToast({
        title: "Erreur",
        description: error.value || undefined,
        variant: "error",
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteGoal = async (goalId: string): Promise<boolean> => {
    if (!userId.value) return false;

    isLoading.value = true;
    error.value = null;

    try {
      const query = supabaseClient.from("health_goals") as any;
      const { error: supabaseError } = await query
        .delete()
        .eq("id", goalId)
        .eq("user_id", userId.value);

      if (supabaseError) throw supabaseError;

      goals.value = goals.value.filter((g) => g.id !== goalId);
      showToast({ title: "Objectif supprimé", variant: "success" });

      return true;
    } catch (err: any) {
      error.value = err.message || "Erreur lors de la suppression";
      console.error("Erreur deleteGoal:", err);
      showToast({
        title: "Erreur",
        description: error.value || undefined,
        variant: "error",
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Méthodes utilitaires
  const getGoalsWithProgress = (): GoalProgress[] => {
    return goals.value.map((goal) => calculateGoalProgress(goal));
  };

  const getGoalsByCategory = (category: HealthGoal["category"]) => {
    return goals.value.filter((goal) => goal.category === category);
  };

  const getGoalsByStatus = (status: HealthGoal["status"]) => {
    return goals.value.filter((goal) => goal.status === status);
  };

  const searchGoals = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return goals.value.filter(
      (goal) =>
        goal.title.toLowerCase().includes(lowercaseQuery) ||
        goal.description?.toLowerCase().includes(lowercaseQuery) ||
        goal.category?.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    // État réactif (readonly)
    goals: readonly(goals),
    suggestions: readonly(suggestions),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Propriétés calculées
    goalStats,
    activeGoals,
    completedGoals,
    urgentGoals,

    // Actions principales
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,

    // Utilitaires
    calculateGoalProgress,
    getGoalsWithProgress,
    getGoalsByCategory,
    getGoalsByStatus,
    searchGoals,

    // Constantes
    GOAL_CATEGORIES,
    GOAL_PRIORITIES,
    DEFAULT_GOAL_DURATION_DAYS,
  };
};
