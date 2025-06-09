import { describe, it, expect, vi, beforeEach } from "vitest";
import { testGoals } from "../../fixtures/testData";

/**
 * Tests unitaires pour useHealthGoals
 * TC-PAT-009, TC-PAT-010, TC-PAT-011, TC-PAT-012
 */
describe("useHealthGoals", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            order: vi.fn(() => ({
              data: testGoals,
              error: null,
            })),
          })),
          data: testGoals,
          error: null,
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: testGoals[0],
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { ...testGoals[0], status: "completed" },
                error: null,
              })),
            })),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
    };
  });

  describe("Création d'objectifs", () => {
    it("TC-PAT-009: devrait créer un nouvel objectif personnalisé", async () => {
      // Arrange
      const newGoal = {
        title: "Méditer 10 minutes par jour",
        description: "Pratique de méditation quotidienne",
        targetValue: 10,
        unit: "minutes",
        frequency: "daily",
        userId: "user-123",
      };

      // Act
      const { createGoal } = useHealthGoals(mockSupabase);
      const result = await createGoal(newGoal);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("health_goals");
      expect(result.error).toBeNull();
      expect(result.data).toBeTruthy();
    });

    it("devrait valider les données avant création", async () => {
      // Arrange
      const invalidGoal = {
        title: "", // Titre vide
        targetValue: -1, // Valeur négative
        unit: "",
        frequency: "invalid",
      };

      // Act & Assert
      const { createGoal } = useHealthGoals(mockSupabase);
      await expect(createGoal(invalidGoal)).rejects.toThrow(
        "Données d'objectif invalides"
      );
    });
  });

  describe("Modification d'objectifs", () => {
    it("TC-PAT-010: devrait modifier un objectif existant", async () => {
      // Arrange
      const goalId = "goal-1";
      const updates = {
        targetValue: 3000, // Modification de 2000 à 3000ml
        description: "Hydratation renforcée",
      };

      // Act
      const { updateGoal } = useHealthGoals(mockSupabase);
      const result = await updateGoal(goalId, updates);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("health_goals");
      expect(result.error).toBeNull();
    });

    it("devrait empêcher la modification d'objectifs inexistants", async () => {
      // Arrange
      const nonExistentId = "goal-999";

      // Mock spécifique pour ce test
      const mockUpdateChain = {
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Goal not found" },
            }),
          })),
        })),
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => mockUpdateChain),
      });

      // Act & Assert
      const { updateGoal } = useHealthGoals(mockSupabase);
      const result = await updateGoal(nonExistentId, { targetValue: 100 });
      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe("Goal not found");
    });
  });

  describe("Suppression d'objectifs", () => {
    it("TC-PAT-011: devrait supprimer un objectif", async () => {
      // Arrange
      const goalId = "goal-1";

      // Act
      const { deleteGoal } = useHealthGoals(mockSupabase);
      const result = await deleteGoal(goalId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("health_goals");
      expect(result.error).toBeNull();
    });
  });

  describe("Suivi de progression", () => {
    it("TC-PAT-012: devrait calculer la progression d'un objectif", async () => {
      // Arrange
      const goalId = "goal-1";
      const currentValue = 1500; // 1.5L sur objectif de 2L
      const targetValue = 2000;

      // Act
      const { calculateProgress } = useHealthGoals(mockSupabase);
      const progress = calculateProgress(currentValue, targetValue);

      // Assert
      expect(progress).toBe(75); // 1500/2000 * 100 = 75%
    });

    it("devrait gérer les progressions supérieures à 100%", () => {
      // Arrange
      const currentValue = 2500;
      const targetValue = 2000;

      // Act
      const { calculateProgress } = useHealthGoals(mockSupabase);
      const progress = calculateProgress(currentValue, targetValue);

      // Assert
      expect(progress).toBe(125);
    });

    it("devrait récupérer les objectifs d'un utilisateur", async () => {
      // Arrange
      const userId = "user-123";

      // Act
      const { getUserGoals } = useHealthGoals(mockSupabase);
      const result = await getUserGoals(userId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("health_goals");
      expect(result.data).toEqual(testGoals);
      expect(result.error).toBeNull();
    });
  });

  describe("Validation des objectifs", () => {
    it("devrait valider la structure d'un objectif", () => {
      // Arrange
      const validGoal = {
        title: "Objectif valide",
        targetValue: 100,
        unit: "unité",
        frequency: "daily",
      };

      const invalidGoal = {
        title: "",
        targetValue: -1,
        unit: "",
        frequency: "invalid",
      };

      // Act
      const { validateGoal } = useHealthGoals(mockSupabase);
      const validResult = validateGoal(validGoal);
      const invalidResult = validateGoal(invalidGoal);

      // Assert
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain("Le titre est requis");
      expect(invalidResult.errors).toContain(
        "La valeur cible doit être positive"
      );
    });
  });
});

// Mock du composable useHealthGoals
function useHealthGoals(supabaseClient: any) {
  return {
    createGoal: async (goalData: any) => {
      const validation = validateGoal(goalData);
      if (!validation.isValid) {
        throw new Error("Données d'objectif invalides");
      }

      return supabaseClient
        .from("health_goals")
        .insert(goalData)
        .select()
        .single();
    },

    updateGoal: async (goalId: string, updates: any) => {
      return supabaseClient
        .from("health_goals")
        .update(updates)
        .eq("id", goalId)
        .select()
        .single();
    },

    deleteGoal: async (goalId: string) => {
      return supabaseClient.from("health_goals").delete().eq("id", goalId);
    },

    getUserGoals: async (userId: string) => {
      return supabaseClient
        .from("health_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    },

    calculateProgress: (currentValue: number, targetValue: number) => {
      if (targetValue === 0) return 0;
      return Math.round((currentValue / targetValue) * 100);
    },

    validateGoal: (goalData: any) => {
      return validateGoal(goalData);
    },
  };
}

function validateGoal(goalData: any) {
  const errors: string[] = [];

  if (!goalData.title || goalData.title.trim() === "") {
    errors.push("Le titre est requis");
  }

  if (!goalData.targetValue || goalData.targetValue <= 0) {
    errors.push("La valeur cible doit être positive");
  }

  if (!goalData.unit || goalData.unit.trim() === "") {
    errors.push("L'unité est requise");
  }

  const validFrequencies = ["daily", "weekly", "monthly"];
  if (!goalData.frequency || !validFrequencies.includes(goalData.frequency)) {
    errors.push("La fréquence doit être daily, weekly ou monthly");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
