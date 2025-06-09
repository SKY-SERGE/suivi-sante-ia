/**
 * Composable pour la gestion des objectifs de santé
 */

interface HealthGoal {
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
}

interface CreateHealthGoal {
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  status: "active" | "completed" | "paused" | "cancelled";
  start_date?: string;
  target_date?: string;
}

interface GoalProgress {
  goal: HealthGoal;
  progress: number; // pourcentage 0-100
  isOnTrack: boolean;
  daysRemaining?: number;
  averageDailyProgress?: number;
}

export const useHealthGoals = () => {
  const { user } = useSupabaseUser();
  const supabase = useSupabase();

  /**
   * Récupère tous les objectifs de l'utilisateur
   */
  const getGoals = async (
    status?: "active" | "completed" | "paused" | "cancelled"
  ): Promise<HealthGoal[]> => {
    if (!user.value) return [];

    try {
      let query = supabase
        .from("health_goals")
        .select("*")
        .eq("user_id", user.value.id)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des objectifs:", error);
      return [];
    }
  };
  /**
   * Crée un nouvel objectif
   */
  const createGoal = async (
    goalData: CreateHealthGoal
  ): Promise<HealthGoal | null> => {
    if (!user.value) return null;

    try {
      const { start_date, ...restData } = goalData;
      const { data, error } = await supabase
        .from("health_goals")
        .insert({
          user_id: user.value.id,
          start_date: start_date || new Date().toISOString().split("T")[0],
          ...restData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de la création de l'objectif:", error);
      return null;
    }
  };

  /**
   * Met à jour un objectif existant
   */
  const updateGoal = async (
    goalId: string,
    updates: Partial<HealthGoal>
  ): Promise<HealthGoal | null> => {
    if (!user.value) return null;

    try {
      // Si on marque comme complété, ajouter la date de completion
      if (updates.status === "completed" && !updates.completed_at) {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("health_goals")
        .update(updates)
        .eq("id", goalId)
        .eq("user_id", user.value.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'objectif:", error);
      return null;
    }
  };

  /**
   * Supprime un objectif
   */
  const deleteGoal = async (goalId: string): Promise<boolean> => {
    if (!user.value) return false;

    try {
      const { error } = await supabase
        .from("health_goals")
        .delete()
        .eq("id", goalId)
        .eq("user_id", user.value.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'objectif:", error);
      return false;
    }
  };

  /**
   * Met à jour la valeur actuelle d'un objectif basé sur les données de santé
   */
  const updateGoalProgress = async (
    goalId: string,
    dataType: string
  ): Promise<HealthGoal | null> => {
    if (!user.value) return null;

    try {
      // Récupérer l'objectif
      const { data: goal, error: goalError } = await supabase
        .from("health_goals")
        .select("*")
        .eq("id", goalId)
        .eq("user_id", user.value.id)
        .single();

      if (goalError || !goal) return null;

      // Récupérer les dernières données de santé pertinentes
      const { data: healthData, error: healthError } = await supabase
        .from("health_data")
        .select("*")
        .eq("user_id", user.value.id)
        .eq("data_type", dataType)
        .order("recorded_at", { ascending: false })
        .limit(1);

      if (healthError || !healthData || healthData.length === 0) return null;

      const latestData = healthData[0];
      let newCurrentValue = goal.current_value;

      // Mise à jour selon le type de données
      switch (dataType) {
        case "weight":
          newCurrentValue = latestData.value || 0;
          break;
        case "blood_pressure":
          // Pour la tension, on peut utiliser la systolique
          newCurrentValue = latestData.metadata?.systolic || 0;
          break;
        case "activity":
          // Pour l'activité, on peut compter les sessions
          newCurrentValue = (goal.current_value || 0) + 1;
          break;
        default:
          newCurrentValue = latestData.value || 0;
      }

      // Vérifier si l'objectif est atteint
      const isCompleted =
        goal.target_value && newCurrentValue >= goal.target_value;
      const updates: Partial<HealthGoal> = {
        current_value: newCurrentValue,
        ...(isCompleted && goal.status === "active"
          ? { status: "completed" as const }
          : {}),
      };

      return await updateGoal(goalId, updates);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du progrès:", error);
      return null;
    }
  };

  /**
   * Calcule le progrès et les statistiques d'un objectif
   */
  const calculateGoalProgress = (goal: HealthGoal): GoalProgress => {
    const progress = goal.target_value
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

        // Calculer si on est sur la bonne voie
        const elapsedDays = Math.ceil(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const totalDays = Math.ceil(
          (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const expectedProgress = (elapsedDays / totalDays) * 100;

        isOnTrack = progress >= expectedProgress * 0.8; // Tolérance de 20%
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

  /**
   * Récupère les objectifs avec leur progrès calculé
   */
  const getGoalsWithProgress = async (
    status?: "active" | "completed" | "paused" | "cancelled"
  ): Promise<GoalProgress[]> => {
    const goals = await getGoals(status);
    return goals.map((goal) => calculateGoalProgress(goal));
  };

  /**
   * Suggère des objectifs basés sur les données existantes
   */
  const suggestGoals = async (): Promise<Partial<HealthGoal>[]> => {
    if (!user.value) return [];

    try {
      // Récupérer les types de données de santé déjà enregistrées
      const { data: healthData, error } = await supabase
        .from("health_data")
        .select("data_type, value, unit")
        .eq("user_id", user.value.id)
        .order("recorded_at", { ascending: false });

      if (error || !healthData) return [];

      // Analyser les données pour suggérer des objectifs
      const dataTypes = [...new Set(healthData.map((d) => d.data_type))];
      const suggestions: Partial<HealthGoal>[] = [];

      for (const type of dataTypes) {
        const typeData = healthData.filter((d) => d.data_type === type);
        const latestValue = typeData[0]?.value;
        const unit = typeData[0]?.unit;

        switch (type) {
          case "weight":
            if (latestValue) {
              suggestions.push({
                title: "Maintenir mon poids",
                description: "Maintenir un poids stable et sain",
                target_value: latestValue,
                current_value: latestValue,
                unit: unit || "kg",
                target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0], // 3 mois
              });
            }
            break;
          case "mood":
            suggestions.push({
              title: "Améliorer mon humeur",
              description: "Maintenir une humeur positive au quotidien",
              target_value: 8,
              current_value: latestValue || 5,
              unit: "/10",
              target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0], // 1 mois
            });
            break;
          case "sleep":
            suggestions.push({
              title: "Améliorer mon sommeil",
              description: "Dormir suffisamment chaque nuit",
              target_value: 8,
              current_value: latestValue || 6,
              unit: "heures",
              target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            });
            break;
          case "activity":
            suggestions.push({
              title: "Être plus actif",
              description: "Faire de l'exercice régulièrement",
              target_value: 30, // 30 sessions dans le mois
              current_value: 0,
              unit: "sessions",
              target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            });
            break;
        }
      }

      return suggestions;
    } catch (error) {
      console.error("Erreur lors de la suggestion d'objectifs:", error);
      return [];
    }
  };

  return {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    calculateGoalProgress,
    getGoalsWithProgress,
    suggestGoals,
  };
};
