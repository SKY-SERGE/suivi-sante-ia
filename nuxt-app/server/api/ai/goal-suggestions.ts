import { streamText, type CoreMessage } from "ai";
import { useAiSdk } from "~/composables/useAiSdk";

export default defineLazyEventHandler(async () => {
  const { googleAi } = useAiSdk();

  return defineEventHandler(async (event: any) => {
    const {
      healthData,
      existingGoals,
      userPreferences,
    }: {
      healthData: Array<{
        data_type: string;
        value: number;
        unit?: string;
        recorded_at: string;
      }>;
      existingGoals: Array<{ title: string; category: string; status: string }>;
      userPreferences?: {
        preferredCategories?: string[];
        activityLevel?: string;
        timeframe?: string;
      };
    } = await readBody(event);

    // Prompt système pour la génération d'objectifs de santé
    const systemPrompt = `Tu es un expert en santé et bien-être qui aide à créer des objectifs personnalisés et réalisables.

DONNÉES DISPONIBLES :
- Données de santé récentes de l'utilisateur
- Objectifs existants pour éviter les doublons
- Préférences utilisateur (si disponibles)

RÈGLES POUR LES OBJECTIFS :
1. Objectifs SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporels)
2. Basés sur les données existantes de l'utilisateur
3. Progressifs et motivants
4. Adaptés au niveau actuel
5. Variés (poids, activité, sommeil, humeur, nutrition)

STRUCTURE DE RÉPONSE :
Génère 3-5 suggestions d'objectifs au format JSON avec :
{
  "suggestions": [
    {
      "title": "Titre court et motivant",
      "description": "Description détaillée et encourageante",
      "category": "weight|activity|sleep|mood|nutrition|medical|other",
      "priority": "low|medium|high",
      "target_value": nombre_cible,
      "current_value": valeur_actuelle,
      "unit": "unité",
      "target_date": "YYYY-MM-DD",
      "reasoning": "Pourquoi cet objectif est pertinent",
      "confidence": score_0_100
    }
  ]
}

CONSIGNES :
- Évite les objectifs déjà existants
- Base-toi sur les tendances des données
- Propose des objectifs réalisables (pas trop ambitieux)
- Varie les catégories et échéances
- Explique le raisonnement pour chaque suggestion

Réponds uniquement en JSON valide.`;

    try {
      const messages: CoreMessage[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Données de santé récentes :
${JSON.stringify(healthData, null, 2)}

Objectifs existants :
${JSON.stringify(existingGoals, null, 2)}

Préférences utilisateur :
${JSON.stringify(userPreferences || {}, null, 2)}

Génère des suggestions d'objectifs personnalisés basés sur ces informations.`,
        },
      ];

      const result = await streamText({
        model: googleAi("gemini-2.0-flash-exp"),
        messages,
        temperature: 0.4, // Un peu de créativité mais reste cohérent
        topP: 0.9,
      });

      const fullText = await result.text;

      try {
        // Parser la réponse JSON
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Pas de JSON valide trouvé dans la réponse");
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);

        // Valider la structure
        if (
          !parsedResponse.suggestions ||
          !Array.isArray(parsedResponse.suggestions)
        ) {
          throw new Error("Structure de réponse invalide");
        }

        return {
          success: true,
          suggestions: parsedResponse.suggestions,
        };
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);

        // Fallback : suggestions par défaut basées sur les données
        const fallbackSuggestions = generateFallbackSuggestions(
          healthData,
          existingGoals
        );

        return {
          success: true,
          suggestions: fallbackSuggestions,
          fallback: true,
        };
      }
    } catch (error) {
      console.error("Goal suggestions error:", error);

      // Fallback en cas d'erreur complète
      const fallbackSuggestions = generateFallbackSuggestions(
        healthData,
        existingGoals
      );

      return {
        success: false,
        error: "Erreur lors de la génération des suggestions",
        suggestions: fallbackSuggestions,
        fallback: true,
      };
    }
  });
});

// Fonction de fallback pour générer des suggestions de base
function generateFallbackSuggestions(
  healthData: Array<{ data_type: string; value: number; unit?: string }>,
  existingGoals: Array<{ title: string; category: string; status: string }>
) {
  const suggestions = [];
  const existingCategories = existingGoals
    .filter((g) => g.status === "active")
    .map((g) => g.category);

  // Suggestion basée sur les données de poids
  const weightData = healthData.find((d) => d.data_type === "weight");
  if (weightData && !existingCategories.includes("weight")) {
    suggestions.push({
      title: "Maintenir un poids stable",
      description: "Maintenir votre poids actuel avec de bonnes habitudes",
      category: "weight",
      priority: "medium",
      target_value: weightData.value,
      current_value: weightData.value,
      unit: weightData.unit || "kg",
      target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      reasoning: "Maintenir un poids stable est important pour la santé",
      confidence: 80,
    });
  }

  // Suggestion d'activité physique
  if (!existingCategories.includes("activity")) {
    suggestions.push({
      title: "Être plus actif au quotidien",
      description: "Intégrer plus d'activité physique dans votre routine",
      category: "activity",
      priority: "high",
      target_value: 20,
      current_value: 0,
      unit: "sessions",
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      reasoning: "L'activité physique régulière améliore la santé générale",
      confidence: 90,
    });
  }

  // Suggestion de sommeil
  if (!existingCategories.includes("sleep")) {
    const sleepData = healthData.find((d) => d.data_type === "sleep");
    suggestions.push({
      title: "Améliorer la qualité du sommeil",
      description: "Dormir suffisamment pour une meilleure récupération",
      category: "sleep",
      priority: "high",
      target_value: 8,
      current_value: sleepData?.value || 6,
      unit: "heures",
      target_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      reasoning: "Un sommeil de qualité est essentiel pour la santé",
      confidence: 85,
    });
  }

  return suggestions;
}
