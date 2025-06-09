/**
 * Composable pour l'analyse d'images avec Google Vision AI
 */
import type { FoodItem } from "./useMeals";

export interface NutritionalAnalysis {
  totalCalories: number;
  macronutrients: {
    proteins: number;
    carbohydrates: number;
    fats: number;
  };
  foodGroups: {
    [key: string]: number; // pourcentage de chaque groupe alimentaire
  };
  healthScore: number; // score de 1 à 10
}

export interface MealAnalysis {
  identifiedFoods: FoodItem[];
  nutritionalAnalysis: NutritionalAnalysis;
  recommendations: string[];
  feedback: string;
  confidence: number;
  processingTime: number;
}

export interface VisionError {
  code: string;
  message: string;
  retryable: boolean;
}

export const useGoogleVisionAI = () => {
  const config = useRuntimeConfig();

  const isAnalyzing = ref(false);
  const analysisProgress = ref(0);
  const lastAnalysis = ref<MealAnalysis | null>(null);
  const analysisError = ref<VisionError | null>(null);

  // Base de données des aliments pour la simulation
  const foodDatabase = {
    apple: {
      category: "fruits",
      calories: 52,
      proteins: 0.3,
      carbs: 14,
      fats: 0.2,
    },
    banana: {
      category: "fruits",
      calories: 89,
      proteins: 1.1,
      carbs: 23,
      fats: 0.3,
    },
    bread: {
      category: "cereals",
      calories: 265,
      proteins: 9,
      carbs: 49,
      fats: 3.2,
    },
    chicken: {
      category: "proteins",
      calories: 239,
      proteins: 27,
      carbs: 0,
      fats: 14,
    },
    rice: {
      category: "cereals",
      calories: 130,
      proteins: 2.7,
      carbs: 28,
      fats: 0.3,
    },
    broccoli: {
      category: "vegetables",
      calories: 25,
      proteins: 3,
      carbs: 5,
      fats: 0.3,
    },
    salmon: {
      category: "proteins",
      calories: 208,
      proteins: 22,
      carbs: 0,
      fats: 12,
    },
    yogurt: {
      category: "dairy",
      calories: 59,
      proteins: 10,
      carbs: 3.6,
      fats: 0.4,
    },
    cheese: {
      category: "dairy",
      calories: 113,
      proteins: 7,
      carbs: 1,
      fats: 9,
    },
    pasta: {
      category: "cereals",
      calories: 131,
      proteins: 5,
      carbs: 25,
      fats: 1.1,
    },
  };
  /**
   * Analyse une image avec Google Vision AI
   */
  const analyzeImage = async (imageBlob: Blob): Promise<MealAnalysis> => {
    isAnalyzing.value = true;
    analysisProgress.value = 0;
    analysisError.value = null;

    const startTime = Date.now();

    try {
      // Vérifier si Google Vision est activé
      if (config.public.googleVisionEnabled !== "true") {
        console.warn(
          "Google Vision AI non configuré, utilisation du mode simulation"
        );
        return await simulateVisionAIAnalysis(imageBlob);
      }

      // Étape 1: Préparation de l'image
      analysisProgress.value = 20;

      // Créer FormData pour l'upload
      const formData = new FormData();
      formData.append("image", imageBlob, "meal-image.jpg");

      analysisProgress.value = 40;

      // Appel à notre endpoint API
      const response = await $fetch("/api/vision/analyze-meal", {
        method: "POST",
        body: formData,
      });

      analysisProgress.value = 80;

      if (!response.success || !response.analysis) {
        throw new Error("Réponse invalide de l'API Vision");
      }

      // Convertir la réponse au format MealAnalysis
      const analysis: MealAnalysis = {
        ...response.analysis,
        processingTime: Date.now() - startTime,
      };

      analysisProgress.value = 100;
      lastAnalysis.value = analysis;

      return analysis;
    } catch (error) {
      console.error("Erreur Google Vision AI:", error);

      // En cas d'erreur, basculer sur la simulation
      console.warn("Échec de l'analyse IA, utilisation du mode simulation");
      return await simulateVisionAIAnalysis(imageBlob);
    } finally {
      isAnalyzing.value = false;
      setTimeout(() => {
        analysisProgress.value = 0;
      }, 2000);
    }
  };

  /**
   * Simulation de l'analyse Vision AI (à remplacer par l'appel réel)
   */
  const simulateVisionAIAnalysis = async (
    imageBlob: Blob
  ): Promise<MealAnalysis> => {
    // Simulation du délai d'analyse
    analysisProgress.value = 40;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    analysisProgress.value = 70;
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Génération d'aliments aléatoires pour la simulation
    const availableFoods = Object.keys(foodDatabase);
    const numFoods = Math.floor(Math.random() * 4) + 2; // 2 à 5 aliments
    const selectedFoods = availableFoods
      .sort(() => 0.5 - Math.random())
      .slice(0, numFoods);

    const identifiedFoods: FoodItem[] = selectedFoods.map((food) => ({
      name: food.charAt(0).toUpperCase() + food.slice(1),
      confidence: Math.random() * 0.3 + 0.7, // 70% à 100%
      category: foodDatabase[food as keyof typeof foodDatabase].category,
      nutritionalInfo: foodDatabase[food as keyof typeof foodDatabase],
    }));

    // Calcul de l'analyse nutritionnelle
    const nutritionalAnalysis = calculateNutritionalAnalysis(identifiedFoods);

    // Génération des recommandations
    const recommendations = generateRecommendations(
      identifiedFoods,
      nutritionalAnalysis
    );

    // Génération du feedback
    const feedback = generateFeedback(identifiedFoods, nutritionalAnalysis);

    return {
      identifiedFoods,
      nutritionalAnalysis,
      recommendations,
      feedback,
      confidence:
        identifiedFoods.reduce((acc, food) => acc + food.confidence, 0) /
        identifiedFoods.length,
      processingTime: Date.now() - Date.now() + 2500, // Temps simulé
    };
  };

  /**
   * Appel réel à Google Vision AI (à implémenter)
   */
  const callGoogleVisionAPI = async (imageBlob: Blob): Promise<any> => {
    const apiKey = config.public.googleVisionApiKey;
    if (!apiKey) {
      throw new Error("Clé API Google Vision non configurée");
    }

    // Convertir le blob en base64
    const base64Image = await blobToBase64(imageBlob);
    const base64Data = base64Image.split(",")[1]; // Enlever le préfixe data:image/...

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Data,
          },
          features: [
            { type: "LABEL_DETECTION", maxResults: 20 },
            { type: "OBJECT_LOCALIZATION", maxResults: 10 },
            { type: "TEXT_DETECTION", maxResults: 5 },
          ],
          imageContext: {
            labelDetectionParams: {
              includeGeoResults: false,
            },
          },
        },
      ],
    };

    const response = await $fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    return response;
  };

  /**
   * Traite la réponse de Google Vision AI
   */
  const processVisionResponse = (response: any): FoodItem[] => {
    const labels = response.responses?.[0]?.labelAnnotations || [];
    const objects = response.responses?.[0]?.localizedObjectAnnotations || [];

    const foodItems: FoodItem[] = [];
    const foodKeywords = [
      "food",
      "fruit",
      "vegetable",
      "meat",
      "bread",
      "dairy",
      "beverage",
      "apple",
      "banana",
      "chicken",
      "rice",
      "pasta",
      "cheese",
      "yogurt",
    ];

    // Traiter les labels
    for (const label of labels) {
      const name = label.description.toLowerCase();
      if (foodKeywords.some((keyword) => name.includes(keyword))) {
        const category = getCategoryFromLabel(name);
        foodItems.push({
          name: label.description,
          confidence: label.score,
          category,
          nutritionalInfo: getNutritionalInfo(name),
        });
      }
    }

    // Traiter les objets localisés
    for (const obj of objects) {
      const name = obj.name.toLowerCase();
      if (foodKeywords.some((keyword) => name.includes(keyword))) {
        const category = getCategoryFromLabel(name);
        foodItems.push({
          name: obj.name,
          confidence: obj.score,
          category,
          nutritionalInfo: getNutritionalInfo(name),
        });
      }
    }

    return foodItems.filter(
      (item, index, self) =>
        index ===
        self.findIndex((i) => i.name.toLowerCase() === item.name.toLowerCase())
    );
  };

  /**
   * Utilitaires
   */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getCategoryFromLabel = (label: string): string => {
    const categories = {
      fruits: ["apple", "banana", "orange", "fruit"],
      vegetables: ["broccoli", "carrot", "vegetable", "salad"],
      proteins: ["chicken", "meat", "fish", "salmon", "beef"],
      cereals: ["bread", "rice", "pasta", "grain"],
      dairy: ["cheese", "yogurt", "milk", "dairy"],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => label.includes(keyword))) {
        return category;
      }
    }
    return "other";
  };

  const getNutritionalInfo = (foodName: string) => {
    const food = Object.entries(foodDatabase).find(([key]) =>
      foodName.includes(key)
    );
    return food ? food[1] : undefined;
  };

  const calculateNutritionalAnalysis = (
    foods: FoodItem[]
  ): NutritionalAnalysis => {
    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    const foodGroups: { [key: string]: number } = {};

    for (const food of foods) {
      if (food.nutritionalInfo) {
        totalCalories += food.nutritionalInfo.calories || 0;
        totalProteins += food.nutritionalInfo.proteins || 0;
        totalCarbs += food.nutritionalInfo.carbs || 0;
        totalFats += food.nutritionalInfo.fats || 0;
      }

      foodGroups[food.category] = (foodGroups[food.category] || 0) + 1;
    } // Convertir les groupes en pourcentages
    const totalGroups = Object.values(foodGroups).reduce((a, b) => a + b, 0);
    for (const group in foodGroups) {
      const count = foodGroups[group];
      if (count !== undefined) {
        foodGroups[group] = Math.round((count / totalGroups) * 100);
      }
    }

    // Calculer le score santé (simplifié)
    const varietyScore = Object.keys(foodGroups).length * 2;
    const balanceScore = Math.min(
      10,
      varietyScore + (foodGroups.vegetables || 0) / 10
    );

    return {
      totalCalories,
      macronutrients: {
        proteins: totalProteins,
        carbohydrates: totalCarbs,
        fats: totalFats,
      },
      foodGroups,
      healthScore: Math.min(10, Math.max(1, balanceScore)),
    };
  };

  const generateRecommendations = (
    foods: FoodItem[],
    analysis: NutritionalAnalysis
  ): string[] => {
    const recommendations = [];

    if (
      !analysis.foodGroups.vegetables ||
      analysis.foodGroups.vegetables < 30
    ) {
      recommendations.push(
        "Ajoutez plus de légumes à votre repas pour plus de vitamines et fibres"
      );
    }

    if (analysis.macronutrients.proteins < 15) {
      recommendations.push(
        "Considérez ajouter une source de protéines pour un repas plus équilibré"
      );
    }

    if (analysis.healthScore < 6) {
      recommendations.push(
        "Variez davantage vos aliments pour un meilleur équilibre nutritionnel"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Excellent choix alimentaire ! Continuez ainsi.");
    }

    return recommendations;
  };

  const generateFeedback = (
    foods: FoodItem[],
    analysis: NutritionalAnalysis
  ): string => {
    const variety = Object.keys(analysis.foodGroups).length;
    const healthScore = analysis.healthScore;

    if (healthScore >= 8) {
      return "Excellent repas très équilibré ! Vous avez fait de très bons choix alimentaires.";
    } else if (healthScore >= 6) {
      return "Bon repas avec un équilibre correct. Quelques améliorations possibles.";
    } else {
      return "Repas acceptable mais pourrait être plus équilibré. Consultez les recommandations.";
    }
  };

  return {
    // État
    isAnalyzing: readonly(isAnalyzing),
    analysisProgress: readonly(analysisProgress),
    lastAnalysis: readonly(lastAnalysis),
    analysisError: readonly(analysisError),

    // Méthodes
    analyzeImage,
    processVisionResponse,

    // Utilitaires
    calculateNutritionalAnalysis,
    generateRecommendations,
    generateFeedback,
  };
};
