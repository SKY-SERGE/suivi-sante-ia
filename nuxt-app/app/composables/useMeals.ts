import type { Database } from "@/types/database";

// Types pour les repas
export interface FoodItem {
  name: string;
  quantity?: string;
  unit?: string;
  calories?: number;
  category?: string;
  confidence?: number; // Pour l'analyse IA
  nutritionalInfo?: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
  };
}

export interface MealData {
  id?: string;
  user_id?: string;
  type: string; // petit-dejeuner, dejeuner, diner, collation
  datetime: string;
  foods: FoodItem[];
  notes?: string;
  satisfaction?: number; // 1-5
  hunger_level?: number; // 1-5
  photo_url?: string;
  ai_analysis?: string;
  ai_identified_foods?: string[]; // Aliments identifiés par l'IA
  ai_confidence?: number; // Confiance de l'IA (0-1)
  created_at?: string;
  updated_at?: string;
}

export interface MealRecommendation {
  id?: string;
  user_id?: string;
  meal_id?: string;
  category: string; // nutrition, variety, portion, timing
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  is_read: boolean;
  is_bookmarked: boolean;
  feedback?: "helpful" | "not_helpful" | "very_helpful";
  created_at?: string;
}

export const useMeals = () => {
  const { user, userId } = useUser();
  const supabaseClient = useSupabaseClient();

  // Intégrer le moteur de recommandations
  const { generateRecommendationsForMeal, getPersonalizedTips } =
    useRecommendationEngine();

  // Intégrer Google AI pour la génération de texte
  const {
    generateRecommendations: generateAIRecommendations,
    generateMealExplanation,
  } = useGoogleGenerativeAI();

  // État réactif
  const meals = ref<MealData[]>([]);
  const recommendations = ref<MealRecommendation[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  // Charger les repas de l'utilisateur
  const loadMeals = async (limit?: number) => {
    if (!user.value) {
      error.value = "Utilisateur non authentifié";
      return { data: [], error: "Utilisateur non authentifié" };
    }

    isLoading.value = true;
    error.value = null;

    try {
      let query = supabaseClient
        .from("meal_records")
        .select(
          `
          id,
          user_id,
          type,
          datetime,
          foods,
          notes,
          satisfaction,
          hunger_level,
          photo_url,
          ai_analysis_text,
          ai_identified_foods,
          ai_confidence,
          created_at,
          updated_at
        `
        )
        .eq("user_id", userId.value)
        .order("datetime", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        error.value = fetchError.message;
        return { data: [], error: fetchError };
      }

      // Mapper les données pour correspondre à notre interface
      const mappedData = (data || []).map((meal) => ({
        ...meal,
        ai_analysis: meal.ai_analysis_text,
      }));

      meals.value = mappedData;
      return { data: mappedData, error: null };
    } catch (err: any) {
      error.value = err.message;
      return { data: [], error: err };
    } finally {
      isLoading.value = false;
    }
  };
  // Sauvegarder un nouveau repas
  const saveMeal = async (
    mealData: Omit<MealData, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    if (!user.value) {
      error.value = "Utilisateur non authentifié";
      return { data: null, error: "Utilisateur non authentifié" };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: saveError } = await supabaseClient
        .from("meal_records")
        .insert([
          {
            user_id: userId.value,
            type: mealData.type,
            datetime: mealData.datetime,
            foods: mealData.foods,
            notes: mealData.notes,
            satisfaction: mealData.satisfaction,
            hunger_level: mealData.hunger_level,
            photo_url: mealData.photo_url,
            ai_analysis_text: mealData.ai_analysis,
            ai_identified_foods: mealData.ai_identified_foods,
            ai_confidence: mealData.ai_confidence,
          },
        ])
        .select()
        .single();

      if (saveError) {
        error.value = saveError.message;
        return { data: null, error: saveError };
      }

      // Mapper les données et ajouter le nouveau repas à la liste locale
      if (data) {
        const mappedData = {
          ...data,
          ai_analysis: data.ai_analysis_text,
        };
        meals.value.unshift(mappedData);
        return { data: mappedData, error: null };
      }

      return { data, error: null };
    } catch (err: any) {
      error.value = err.message;
      return { data: null, error: err };
    } finally {
      isLoading.value = false;
    }
  }; // Sauvegarder un nouveau repas avec génération de recommandations
  const saveMealWithRecommendations = async (
    mealData: Omit<MealData, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    // D'abord sauvegarder le repas
    const { data: savedMeal, error: saveError } = await saveMeal(mealData);

    if (saveError || !savedMeal) {
      return { data: savedMeal, error: saveError, recommendations: [] };
    }

    try {
      // Essayer d'abord avec Google AI
      const aiResult = await generateRecommendationsWithAI(savedMeal);

      if (aiResult.saved && aiResult.recommendations.length > 0) {
        // Recharger les recommandations pour inclure les nouvelles
        await loadRecommendations();

        return {
          data: savedMeal,
          error: null,
          recommendations: aiResult.recommendations,
          recommendationsGenerated: true,
          generationMethod: "google-ai",
          explanation: aiResult.explanation,
          confidence: aiResult.confidence,
        };
      }

      // Fallback vers le moteur de règles si Google AI échoue
      console.log("Fallback vers le moteur de règles traditionnel");
      const {
        recommendations: ruleRecommendations,
        saved: ruleSaved,
        error: ruleError,
      } = await generateRecommendationsForMeal(meals.value, savedMeal);

      if (ruleSaved && ruleRecommendations.length > 0) {
        // Recharger les recommandations pour inclure les nouvelles
        await loadRecommendations();

        return {
          data: savedMeal,
          error: null,
          recommendations: ruleRecommendations,
          recommendationsGenerated: true,
          generationMethod: "rule-based",
        };
      }

      return {
        data: savedMeal,
        error: null,
        recommendations: ruleRecommendations,
        recommendationsGenerated: false,
        recommendationError: ruleError,
        generationMethod: "none",
      };
    } catch (error: any) {
      console.error("Erreur lors de la génération des recommandations:", error);
      return {
        data: savedMeal,
        error: null,
        recommendations: [],
        recommendationsGenerated: false,
        recommendationError: error.message,
        generationMethod: "error",
      };
    }
  };

  // Sauvegarder un repas photo complet avec analyse IA et recommandations
  const saveMealWithPhoto = async (
    photoBlob: Blob,
    mealType: string,
    datetime: string,
    notes?: string,
    satisfaction?: number,
    hungerLevel?: number
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Étape 1 : Analyser la photo avec l'IA
      const { foods, confidence, analysis } = await analyzePhotoMeal(photoBlob);

      // Étape 2 : Uploader l'image (simulation pour le moment)
      const photoUrl = `https://placeholder.com/meal-${Date.now()}.jpg`;

      // Étape 3 : Préparer les données du repas
      const mealData: Omit<
        MealData,
        "id" | "user_id" | "created_at" | "updated_at"
      > = {
        type: mealType,
        datetime,
        foods,
        notes,
        satisfaction,
        hunger_level: hungerLevel,
        photo_url: photoUrl,
        ai_analysis: analysis,
        ai_identified_foods: foods.map((f) => f.name),
        ai_confidence: confidence,
      };

      // Étape 4 : Sauvegarder avec génération de recommandations
      const result = await saveMealWithRecommendations(mealData);

      return {
        ...result,
        aiAnalysis: analysis,
        aiConfidence: confidence,
        identifiedFoods: foods,
      };
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde du repas photo:", error);
      return {
        data: null,
        error: error.message,
        recommendations: [],
        recommendationsGenerated: false,
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Obtenir des conseils personnalisés pour l'utilisateur
  const getPersonalizedRecommendations = () => {
    return getPersonalizedTips(meals.value);
  };

  // Mettre à jour un repas existant
  const updateMeal = async (mealId: string, updates: Partial<MealData>) => {
    if (!user.value) {
      error.value = "Utilisateur non authentifié";
      return { data: null, error: "Utilisateur non authentifié" };
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Préparer les updates en mappant ai_analysis vers ai_analysis_text
      const dbUpdates: any = { ...updates };
      if (updates.ai_analysis) {
        dbUpdates.ai_analysis_text = updates.ai_analysis;
        delete dbUpdates.ai_analysis;
      }

      const { data, error: updateError } = await supabaseClient
        .from("meal_records")
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mealId)
        .eq("user_id", userId.value)
        .select()
        .single();

      if (updateError) {
        error.value = updateError.message;
        return { data: null, error: updateError };
      }

      // Mettre à jour la liste locale avec le mapping
      if (data) {
        const mappedData = {
          ...data,
          ai_analysis: data.ai_analysis_text,
        };
        const index = meals.value.findIndex((m) => m.id === mealId);
        if (index !== -1) {
          meals.value[index] = mappedData;
        }
        return { data: mappedData, error: null };
      }

      return { data, error: null };
    } catch (err: any) {
      error.value = err.message;
      return { data: null, error: err };
    } finally {
      isLoading.value = false;
    }
  };
  // Supprimer un repas
  const deleteMeal = async (mealId: string) => {
    if (!user.value) {
      error.value = "Utilisateur non authentifié";
      return { error: "Utilisateur non authentifié" };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabaseClient
        .from("meal_records")
        .delete()
        .eq("id", mealId)
        .eq("user_id", userId.value);

      if (deleteError) {
        error.value = deleteError.message;
        return { error: deleteError };
      }

      // Supprimer de la liste locale
      meals.value = meals.value.filter((m) => m.id !== mealId);
      return { error: null };
    } catch (err: any) {
      error.value = err.message;
      return { error: err };
    } finally {
      isLoading.value = false;
    }
  };

  // Charger les recommandations
  const loadRecommendations = async () => {
    if (!user.value) {
      error.value = "Utilisateur non authentifié";
      return { data: [], error: "Utilisateur non authentifié" };
    }

    try {
      const { data, error: fetchError } = await supabaseClient
        .from("meal_recommendations")
        .select("*")
        .eq("user_id", userId.value)
        .order("created_at", { ascending: false });

      if (fetchError) {
        error.value = fetchError.message;
        return { data: [], error: fetchError };
      }

      recommendations.value = data || [];
      return { data: data || [], error: null };
    } catch (err: any) {
      error.value = err.message;
      return { data: [], error: err };
    }
  };

  // Marquer une recommandation comme lue
  const markRecommendationAsRead = async (recommendationId: string) => {
    if (!user.value) return { error: "Utilisateur non authentifié" };

    try {
      const { data, error: updateError } = await supabaseClient
        .from("meal_recommendations")
        .update({ is_read: true })
        .eq("id", recommendationId)
        .eq("user_id", userId.value)
        .select()
        .single();

      if (updateError) {
        error.value = updateError.message;
        return { error: updateError };
      }

      // Mettre à jour localement
      if (data) {
        const index = recommendations.value.findIndex(
          (r) => r.id === recommendationId
        );
        if (index !== -1) {
          recommendations.value[index] = data;
        }
      }

      return { data, error: null };
    } catch (err: any) {
      error.value = err.message;
      return { error: err };
    }
  };

  // Ajouter/retirer un signet sur une recommandation
  const toggleRecommendationBookmark = async (recommendationId: string) => {
    if (!user.value) return { error: "Utilisateur non authentifié" };

    try {
      const recommendation = recommendations.value.find(
        (r) => r.id === recommendationId
      );
      if (!recommendation) return { error: "Recommandation non trouvée" };

      const { data, error: updateError } = await supabaseClient
        .from("meal_recommendations")
        .update({ is_bookmarked: !recommendation.is_bookmarked })
        .eq("id", recommendationId)
        .eq("user_id", userId.value)
        .select()
        .single();

      if (updateError) {
        error.value = updateError.message;
        return { error: updateError };
      }

      // Mettre à jour localement
      if (data) {
        const index = recommendations.value.findIndex(
          (r) => r.id === recommendationId
        );
        if (index !== -1) {
          recommendations.value[index] = data;
        }
      }

      return { data, error: null };
    } catch (err: any) {
      error.value = err.message;
      return { error: err };
    }
  };

  // Donner un feedback sur une recommandation
  const giveFeedbackOnRecommendation = async (
    recommendationId: string,
    feedback: "helpful" | "not_helpful" | "very_helpful"
  ) => {
    if (!user.value) return { error: "Utilisateur non authentifié" };

    try {
      const { data, error: updateError } = await supabaseClient
        .from("meal_recommendations")
        .update({ feedback })
        .eq("id", recommendationId)
        .eq("user_id", userId.value)
        .select()
        .single();

      if (updateError) {
        error.value = updateError.message;
        return { error: updateError };
      }

      // Mettre à jour localement
      if (data) {
        const index = recommendations.value.findIndex(
          (r) => r.id === recommendationId
        );
        if (index !== -1) {
          recommendations.value[index] = data;
        }
      }

      return { data, error: null };
    } catch (err: any) {
      error.value = err.message;
      return { error: err };
    }
  };
  // Analyser les repas avec IA
  const analyzePhotoMeal = async (
    photoBlob: Blob
  ): Promise<{ foods: FoodItem[]; confidence: number; analysis: string }> => {
    try {
      // Utiliser notre API Google Vision AI
      const formData = new FormData();
      formData.append("image", photoBlob);

      const response = await $fetch("/api/vision/analyze-meal", {
        method: "POST",
        body: formData,
      });

      if (!response.success || !response.analysis) {
        throw new Error("Analyse IA échouée");
      }

      const aiAnalysis = response.analysis;

      // Convertir le format de réponse vers notre format attendu
      const foods: FoodItem[] = aiAnalysis.identifiedFoods.map((food: any) => ({
        name: food.name,
        quantity: "100", // Estimation par défaut
        unit: "g",
        category: food.category,
        calories: food.nutritionalInfo?.calories || 100,
      }));

      return {
        foods,
        confidence: aiAnalysis.confidence,
        analysis: aiAnalysis.feedback || "Repas analysé avec succès par IA",
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse IA:", error);

      // En cas d'erreur, fallback sur la simulation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        foods: [
          {
            name: "Riz basmati",
            quantity: "150",
            unit: "g",
            category: "cereales",
          },
          {
            name: "Poulet grillé",
            quantity: "120",
            unit: "g",
            category: "proteines",
          },
          { name: "Brocolis", quantity: "80", unit: "g", category: "legumes" },
        ],
        confidence: 0.75,
        analysis:
          "Analyse de secours : Repas équilibré avec des protéines, des glucides complexes et des légumes.",
      };
    }
  };

  // Générer des recommandations avec Google AI
  const generateRecommendationsWithAI = async (
    currentMeal: MealData,
    userPreferences?: any
  ) => {
    try {
      // Utiliser les derniers repas pour le contexte
      const recentMeals = meals.value.slice(0, 10);

      // Appeler le service Google AI
      const aiResponse = await generateAIRecommendations({
        meals: recentMeals,
        currentMeal,
        userPreferences,
      });

      if (!aiResponse) {
        console.warn("Pas de réponse de Google AI, utilisation du fallback");
        return {
          recommendations: [],
          saved: false,
          error: "Échec de génération IA",
        };
      }

      // Sauvegarder les recommandations en base
      const savedRecommendations: MealRecommendation[] = [];

      for (const rec of aiResponse.recommendations) {
        if (!user.value) continue;

        const { data, error: saveError } = await supabaseClient
          .from("meal_recommendations")
          .insert({
            user_id: userId.value,
            meal_id: currentMeal.id,
            category: rec.category,
            title: rec.title,
            description: rec.description,
            priority: rec.priority,
            is_read: false,
            is_bookmarked: false,
          })
          .select()
          .single();

        if (!saveError && data) {
          savedRecommendations.push(data);
        } else {
          console.error("Erreur sauvegarde recommandation:", saveError);
        }
      }

      return {
        recommendations: savedRecommendations,
        saved: savedRecommendations.length > 0,
        error: null,
        explanation: aiResponse.explanation,
        confidence: aiResponse.confidence,
      };
    } catch (error: any) {
      console.error("Erreur génération recommandations AI:", error);
      return {
        recommendations: [],
        saved: false,
        error: error.message,
      };
    }
  };

  // Calculer les statistiques
  const getMealStats = computed(() => {
    const today = new Date().toDateString();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      todayCount: meals.value.filter(
        (meal) => new Date(meal.datetime).toDateString() === today
      ).length,

      weekCount: meals.value.filter(
        (meal) => new Date(meal.datetime) >= weekAgo
      ).length,

      totalCount: meals.value.length,

      analyzedPhotosCount: meals.value.filter((meal) => meal.photo_url).length,

      avgSatisfaction:
        meals.value.filter((meal) => meal.satisfaction).length > 0
          ? meals.value
              .filter((meal) => meal.satisfaction)
              .reduce((sum, meal) => sum + (meal.satisfaction || 0), 0) /
            meals.value.filter((meal) => meal.satisfaction).length
          : 0,
    };
  });

  return {
    // État
    meals: readonly(meals),
    recommendations: readonly(recommendations),
    isLoading: readonly(isLoading),
    error: readonly(error), // Méthodes pour les repas
    loadMeals,
    saveMeal,
    saveMealWithRecommendations,
    saveMealWithPhoto,
    updateMeal,
    deleteMeal,
    analyzePhotoMeal,

    // Méthodes pour les recommandations
    loadRecommendations,
    markRecommendationAsRead,
    toggleRecommendationBookmark,
    giveFeedbackOnRecommendation,

    // Statistiques
    getMealStats,

    // Personnalisation
    getPersonalizedRecommendations,

    // Génération de recommandations avec AI
    generateRecommendationsWithAI,
  };
};
