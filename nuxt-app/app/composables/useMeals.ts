import type { FoodItem, MealData, MealRecommendation } from "@/types/models";

export const useMeals = () => {
  const { user, userId } = useUser();
  const supabaseClient = useSupabaseClient();

  // Intégrer le moteur de recommandations
  const {
    recommendations: recommendationsList,
    loadRecommendations,
    generateRecommendationsForMeal,
    getPersonalizedTips,
  } = useRecommendationEngine();

  // État réactif
  const meals = ref<MealData[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const recommendations = computed(() => recommendationsList.value);

  // Charger les repas de l'utilisateur
  const loadMeals = async (limit?: number) => {
    if (!user.value) {
      error.value = "Utilisateur non authentifié";
      return { data: [], error: "Utilisateur non authentifié" };
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Cast pour éviter les erreurs de type Supabase
      let query = supabaseClient.from("meal_records") as any;
      query = query
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
      const mappedData = (data || []).map((meal: any) => ({
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
      // Cast pour éviter les erreurs de type Supabase
      const query = supabaseClient.from("meal_records") as any;
      const { data, error: saveError } = await query
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
        const mappedData: any = {
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

  // Obtenir des conseils personnalisés pour l'utilisateur via l'API IA
  const getPersonalizedRecommendations = async () => {
    try {
      if (!userId.value) {
        throw new Error("Utilisateur non connecté");
      }

      // Appel à l'API pour générer des recommandations personnalisées avec l'IA
      const response = (await $fetch("/api/ai/meal-recommendations", {
        method: "POST",
        body: {
          userId: userId.value,
          meals: meals.value,
        },
      })) as any;

      if (response?.recommendations && response.recommendations.length > 0) {
        // Sauvegarder les recommandations en base de données
        const supabaseClient = useSupabaseClient();
        const query = supabaseClient.from("meal_recommendations") as any;

        const { data, error: insertError } = await query.insert(
          response.recommendations.map((rec: any) => ({
            user_id: userId.value,
            category: rec.category,
            title: rec.title,
            description: rec.description,
            priority: rec.priority,
            is_read: false,
            is_bookmarked: false,
          }))
        );

        if (insertError) {
          throw insertError;
        }

        return response.recommendations;
      }

      return [];
    } catch (error) {
      console.error(
        "Erreur lors de la génération des recommandations IA:",
        error
      );
      // Fallback vers les recommandations basées sur des règles
      return getPersonalizedTips(meals.value);
    }
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

      // Cast pour éviter les erreurs de type Supabase
      const query = supabaseClient.from("meal_records") as any;
      const { data, error: updateError } = await query
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
        const mappedData: any = {
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
      // Cast pour éviter les erreurs de type Supabase
      const query = supabaseClient.from("meal_records") as any;
      const { error: deleteError } = await query
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

      // Appeler notre nouvelle API de recommandations
      const aiResponse = await $fetch<{
        success: boolean;
        recommendations: any[];
        explanation?: string;
        confidence?: number;
        error?: string;
        fallback?: boolean;
      }>("/api/ai/meal-recommendations", {
        method: "POST",
        body: {
          meals: recentMeals,
          currentMeal,
          userPreferences,
        },
      });

      if (!aiResponse.success || !aiResponse.recommendations?.length) {
        console.warn(
          "Pas de recommandations de l'API AI, utilisation du fallback"
        );
        return {
          recommendations: [],
          saved: false,
          error: aiResponse.error || "Échec de génération IA",
        };
      }

      // Sauvegarder les recommandations en base
      const savedRecommendations: MealRecommendation[] = [];

      for (const rec of aiResponse.recommendations) {
        if (!user.value) continue;

        // Cast pour éviter les erreurs de type Supabase
        const query = supabaseClient.from("meal_recommendations") as any;
        const { data, error: saveError } = await query
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

  // Générer une explication pour un repas avec l'API
  const generateMealExplanation = async (
    meal: MealData,
    analysis?: any
  ): Promise<string> => {
    try {
      const response = await $fetch<{
        success: boolean;
        explanation: string;
        error?: string;
        fallback?: boolean;
      }>("/api/ai/meal-explanation", {
        method: "POST",
        body: {
          meal,
          analysis,
        },
      });

      if (!response.success && response.fallback) {
        console.warn("Utilisation de l'explication de fallback");
      }

      return response.explanation || "Repas analysé avec succès.";
    } catch (error) {
      console.error("Erreur explication IA:", error);

      // Fallback simple en cas d'erreur
      const foodNames =
        meal.foods?.map((f) => f.name).join(", ") || "aliments variés";
      const mealTypeText = getMealTypeText(meal.type);
      return `Votre ${mealTypeText} composé de ${foodNames} constitue un bon choix alimentaire.`;
    }
  };

  // Fonction utilitaire pour obtenir le texte du type de repas
  const getMealTypeText = (type: string): string => {
    const types: Record<string, string> = {
      "petit-dejeuner": "petit-déjeuner",
      dejeuner: "déjeuner",
      diner: "dîner",
      collation: "collation",
    };
    return types[type] || type;
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
    error: readonly(error),

    // Fonction pour notifier les nouvelles recommandations
    notifyNewRecommendations: (recommendations: any[]) => {
      if (typeof window !== "undefined") {
        const { showToast } = useToast();

        if (recommendations.length > 0) {
          showToast({
            title: "🎯 Nouvelles recommandations !",
            description: `${recommendations.length} recommandation${
              recommendations.length > 1 ? "s" : ""
            } personnalisée${recommendations.length > 1 ? "s" : ""} générée${
              recommendations.length > 1 ? "s" : ""
            }`,
            variant: "default",
          });

          // Afficher les premières recommandations individuellement
          recommendations.slice(0, 2).forEach((rec: any, index: number) => {
            setTimeout(() => {
              const categoryEmojis: Record<string, string> = {
                nutrition: "🥗",
                portion: "⚖️",
                variety: "🎨",
                timing: "⏰",
                hydration: "💧",
              };
              const emoji = categoryEmojis[rec.category] || "💡";

              showToast({
                title: `${emoji} ${rec.title}`,
                description:
                  rec.description.slice(0, 70) +
                  (rec.description.length > 70 ? "..." : ""),
                variant: rec.priority === "high" ? "destructive" : "default",
              });
            }, (index + 1) * 2000);
          });
        }
      }
    },

    // Méthodes pour les repas
    loadMeals,
    saveMeal,
    saveMealWithRecommendations,
    saveMealWithPhoto,
    updateMeal,
    deleteMeal,
    analyzePhotoMeal,

    // Méthodes pour les recommandations
    loadRecommendations,

    // Statistiques
    getMealStats,

    // Personnalisation
    getPersonalizedRecommendations,

    // Génération de recommandations et explications avec API
    generateRecommendationsWithAI,
    generateMealExplanation,
  };
};
