/**
 * API Endpoint pour l'analyse d'images avec Google Vision AI
 * POST /api/vision/analyze-meal
 * Sécurisé avec protection CSRF, validation d'upload et rate limiting
 */

import {
  getClientIP,
  checkRateLimit,
  logSecurityEvent,
  validateUploadedFile,
  sanitizeHeaders,
  validateCSRFToken,
} from "../../utils/security";

export default defineEventHandler(async (event) => {
  try {
    // Vérifier que c'est bien une requête POST
    if (!isMethod(event, "POST")) {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
      });
    }

    const config = useRuntimeConfig();
    const clientIP = getClientIP(event);

    // Rate limiting pour les uploads
    const rateLimitCheck = checkRateLimit(clientIP, true);
    if (!rateLimitCheck.allowed) {
      logSecurityEvent(event, "RATE_LIMIT_EXCEEDED", {
        endpoint: "/api/vision/analyze-meal",
        remaining: rateLimitCheck.remaining,
      });

      throw createError({
        statusCode: 429,
        statusMessage: "Trop de requêtes. Veuillez réessayer plus tard.",
      });
    }

    // Vérifier que les clés API sont configurées
    if (!config.googleVisionApiKey) {
      logSecurityEvent(event, "API_KEY_MISSING", {
        endpoint: "/api/vision/analyze-meal",
      });

      throw createError({
        statusCode: 503,
        statusMessage: "Service temporairement indisponible",
      });
    }

    // Protection CSRF pour les uploads
    const csrfToken =
      getCookie(event, "csrf-token") || getHeader(event, "x-csrf-token");
    const sessionToken = getCookie(event, "csrf-session");

    if (
      !csrfToken ||
      !sessionToken ||
      !validateCSRFToken(csrfToken, sessionToken)
    ) {
      logSecurityEvent(event, "CSRF_VALIDATION_FAILED", {
        endpoint: "/api/vision/analyze-meal",
        hasToken: !!csrfToken,
        hasSession: !!sessionToken,
      });

      throw createError({
        statusCode: 403,
        statusMessage: "Token de sécurité invalide",
      });
    }

    // Nettoyer et valider les en-têtes
    const sanitizedHeaders = sanitizeHeaders(event);

    // Récupérer les données du formulaire multipart
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Aucune donnée d'image fournie",
      });
    }

    // Trouver le fichier image dans les données
    const imageFile = formData.find((item) => item.name === "image");

    if (!imageFile || !imageFile.data) {
      throw createError({
        statusCode: 400,
        statusMessage: "Aucun fichier image valide trouvé",
      });
    }

    // Validation sécurisée du fichier uploadé
    const fileValidation = validateUploadedFile(imageFile);
    if (!fileValidation.valid) {
      logSecurityEvent(event, "INVALID_FILE_UPLOAD", {
        endpoint: "/api/vision/analyze-meal",
        error: fileValidation.error,
        filename: imageFile.filename,
        size: imageFile.data?.length,
      });

      throw createError({
        statusCode: 400,
        statusMessage: fileValidation.error || "Fichier invalide",
      });
    }

    // Log de l'upload réussi
    logSecurityEvent(event, "SECURE_FILE_UPLOAD", {
      endpoint: "/api/vision/analyze-meal",
      filename: imageFile.filename,
      size: imageFile.data.length,
      type: imageFile.type,
    });

    // Convertir l'image en base64 pour l'API Google Vision
    const imageBase64 = imageFile.data.toString("base64");

    // Préparer la requête pour Google Vision AI
    const visionRequestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: "LABEL_DETECTION",
              maxResults: 20,
            },
            {
              type: "OBJECT_LOCALIZATION",
              maxResults: 20,
            },
            {
              type: "TEXT_DETECTION",
              maxResults: 10,
            },
          ],
        },
      ],
    };

    // Faire l'appel à l'API Google Vision avec timeout
    const visionResponse = await $fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${config.googleVisionApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: visionRequestBody,
        timeout: 30000, // 30 secondes
      }
    );

    // Traiter la réponse et extraire les aliments identifiés
    const analysisResult = processVisionResponse(visionResponse); // Log de succès
    logSecurityEvent(event, "VISION_API_SUCCESS", {
      endpoint: "/api/vision/analyze-meal",
      itemsDetected: analysisResult?.identifiedFoods?.length || 0,
    });

    return {
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Log sécurisé des erreurs (sans exposer d'informations sensibles)
    logSecurityEvent(event, "VISION_API_ERROR", {
      endpoint: "/api/vision/analyze-meal",
      errorType: error.constructor.name,
      statusCode: error.statusCode || 500,
    });

    console.error("Vision API Error (internal):", {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });

    // Ne pas exposer les détails de l'erreur côté client
    if (error.statusCode) {
      throw error; // Erreurs déjà gérées
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de l'analyse de l'image",
    });
  }
});

/**
 * Traite la réponse de Google Vision AI et extrait les informations alimentaires
 */
function processVisionResponse(visionResponse: any) {
  const response = visionResponse.responses?.[0];

  if (!response) {
    throw new Error("No response from Google Vision API");
  }

  // Mots-clés alimentaires pour filtrer les résultats
  const foodKeywords = [
    "food",
    "fruit",
    "vegetable",
    "meat",
    "bread",
    "pasta",
    "rice",
    "fish",
    "chicken",
    "beef",
    "pork",
    "cheese",
    "milk",
    "yogurt",
    "salad",
    "soup",
    "sandwich",
    "pizza",
    "burger",
    "cake",
    "dessert",
    "apple",
    "banana",
    "orange",
    "tomato",
    "potato",
    "onion",
    "carrot",
    "broccoli",
    "spinach",
    "egg",
    "bacon",
    "sausage",
    "ham",
    "turkey",
    "salmon",
    "tuna",
    "shrimp",
    "bean",
    "lentil",
    "nut",
    "almond",
    "walnut",
    "cereal",
    "oats",
    "quinoa",
    "wine",
    "beer",
    "juice",
    "coffee",
    "tea",
    "water",
    "soda",
  ];

  const identifiedFoods: Array<{
    name: string;
    confidence: number;
    category: string;
    source: string;
  }> = [];

  // Traiter les labels
  if (response.labelAnnotations) {
    response.labelAnnotations.forEach((label: any) => {
      const description = label.description.toLowerCase();

      // Vérifier si c'est lié à l'alimentation
      if (foodKeywords.some((keyword) => description.includes(keyword))) {
        identifiedFoods.push({
          name: label.description,
          confidence: label.score,
          category: categorizeFood(label.description),
          source: "label",
        });
      }
    });
  }

  // Traiter les objets localisés
  if (response.localizedObjectAnnotations) {
    response.localizedObjectAnnotations.forEach((object: any) => {
      const name = object.name.toLowerCase();

      if (foodKeywords.some((keyword) => name.includes(keyword))) {
        identifiedFoods.push({
          name: object.name,
          confidence: object.score,
          category: categorizeFood(object.name),
          source: "object",
        });
      }
    });
  }

  // Déduplication et tri par confiance
  const uniqueFoods = identifiedFoods
    .filter(
      (food, index, self) =>
        index ===
        self.findIndex((f) => f.name.toLowerCase() === food.name.toLowerCase())
    )
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10); // Limiter à 10 aliments max

  // Calculer un score nutritionnel basique
  const healthScore = calculateBasicHealthScore(uniqueFoods);

  // Générer des recommandations basiques
  const recommendations = generateBasicRecommendations(uniqueFoods);

  return {
    identifiedFoods: uniqueFoods.map((food) => ({
      name: food.name,
      confidence: food.confidence,
      category: food.category,
    })),
    nutritionalAnalysis: {
      totalCalories: estimateCalories(uniqueFoods),
      macronutrients: estimateMacronutrients(uniqueFoods),
      foodGroups: analyzeFoodGroups(uniqueFoods),
      healthScore,
    },
    recommendations,
    feedback: generateFeedback(uniqueFoods, healthScore),
    confidence: uniqueFoods.length > 0 ? uniqueFoods[0].confidence : 0,
    processingTime: 0, // Sera calculé côté client
  };
}

/**
 * Catégorise un aliment basé sur son nom
 */
function categorizeFood(foodName: string): string {
  const name = foodName.toLowerCase();

  if (
    ["apple", "banana", "orange", "grape", "berry", "fruit"].some((f) =>
      name.includes(f)
    )
  ) {
    return "fruits";
  }
  if (
    ["vegetable", "broccoli", "carrot", "tomato", "salad", "spinach"].some(
      (v) => name.includes(v)
    )
  ) {
    return "vegetables";
  }
  if (
    ["meat", "chicken", "beef", "pork", "fish", "salmon", "tuna"].some((m) =>
      name.includes(m)
    )
  ) {
    return "proteins";
  }
  if (
    ["bread", "pasta", "rice", "cereal", "grain"].some((g) => name.includes(g))
  ) {
    return "cereals";
  }
  if (["milk", "cheese", "yogurt", "dairy"].some((d) => name.includes(d))) {
    return "dairy";
  }

  return "other";
}

/**
 * Calcule un score de santé basique (1-10)
 */
function calculateBasicHealthScore(foods: Array<{ category: string }>): number {
  let score = 5; // Score de base

  const categories = foods.map((f) => f.category);
  const uniqueCategories = [...new Set(categories)];

  // Bonus pour la diversité
  score += uniqueCategories.length * 0.5;

  // Bonus pour les légumes et fruits
  if (categories.includes("vegetables")) score += 1;
  if (categories.includes("fruits")) score += 1;

  // Malus pour trop de produits transformés
  const processedCount = categories.filter((c) => c === "other").length;
  score -= processedCount * 0.5;

  return Math.min(10, Math.max(1, Math.round(score)));
}

/**
 * Estime les calories totales
 */
function estimateCalories(foods: Array<{ name: string }>): number {
  // Estimation très basique - dans un vrai système, utiliser une base de données nutritionnelle
  return foods.length * 100; // ~100 calories par aliment identifié
}

/**
 * Estime les macronutriments
 */
function estimateMacronutrients(foods: Array<{ category: string }>) {
  const proteins = foods.filter((f) => f.category === "proteins").length * 20;
  const carbohydrates =
    foods.filter((f) => ["cereals", "fruits"].includes(f.category)).length * 30;
  const fats =
    foods.filter((f) => ["dairy", "proteins"].includes(f.category)).length * 10;

  return { proteins, carbohydrates, fats };
}

/**
 * Analyse les groupes alimentaires
 */
function analyzeFoodGroups(foods: Array<{ category: string }>) {
  const total = foods.length;
  const groups: { [key: string]: number } = {};

  foods.forEach((food) => {
    groups[food.category] = (groups[food.category] || 0) + 1;
  });

  // Convertir en pourcentages
  Object.keys(groups).forEach((group) => {
    groups[group] = Math.round((groups[group] / total) * 100);
  });

  return groups;
}

/**
 * Génère des recommandations basiques
 */
function generateBasicRecommendations(
  foods: Array<{ category: string }>
): string[] {
  const recommendations: string[] = [];
  const categories = foods.map((f) => f.category);

  if (!categories.includes("vegetables")) {
    recommendations.push(
      "Ajoutez plus de légumes à votre repas pour un meilleur équilibre nutritionnel."
    );
  }

  if (!categories.includes("fruits")) {
    recommendations.push(
      "Pensez à inclure des fruits pour les vitamines et fibres."
    );
  }

  if (!categories.includes("proteins")) {
    recommendations.push(
      "Ajoutez une source de protéines pour un repas plus complet."
    );
  }

  if (categories.filter((c) => c === "other").length > categories.length / 2) {
    recommendations.push(
      "Privilégiez les aliments non transformés pour une meilleure santé."
    );
  }

  return recommendations;
}

/**
 * Génère un feedback textuel
 */
function generateFeedback(
  foods: Array<{ name: string; category: string }>,
  healthScore: number
): string {
  const foodCount = foods.length;

  if (foodCount === 0) {
    return "Aucun aliment n'a pu être identifié dans cette image.";
  }

  let feedback = `J'ai identifié ${foodCount} aliment${
    foodCount > 1 ? "s" : ""
  } dans votre photo. `;

  if (healthScore >= 8) {
    feedback += "Votre repas semble très équilibré et nutritif !";
  } else if (healthScore >= 6) {
    feedback +=
      "Votre repas est globalement sain avec quelques améliorations possibles.";
  } else if (healthScore >= 4) {
    feedback +=
      "Votre repas pourrait être amélioré avec plus d'aliments frais.";
  } else {
    feedback +=
      "Essayez d'inclure plus d'aliments non transformés dans vos repas.";
  }

  return feedback;
}
