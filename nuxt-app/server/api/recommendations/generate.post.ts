import type { MealData, MealRecommendation } from "~/composables/useMeals";
import {
  getClientIP,
  checkRateLimit,
  logSecurityEvent,
  validateCSRFToken,
} from "../../utils/security";

export default defineEventHandler(async (event) => {
  try {
    // Vérifier la méthode
    if (getMethod(event) !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
      });
    }

    const clientIP = getClientIP(event);

    // Rate limiting
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      logSecurityEvent(event, "RATE_LIMIT_EXCEEDED", {
        endpoint: "/api/recommendations/generate",
        remaining: rateLimitCheck.remaining,
      });

      throw createError({
        statusCode: 429,
        statusMessage: "Trop de requêtes. Veuillez réessayer plus tard.",
      });
    }

    // Protection CSRF
    const csrfToken =
      getCookie(event, "csrf-token") || getHeader(event, "x-csrf-token");
    const sessionToken = getCookie(event, "csrf-session");

    if (
      !csrfToken ||
      !sessionToken ||
      !validateCSRFToken(csrfToken, sessionToken)
    ) {
      logSecurityEvent(event, "CSRF_VALIDATION_FAILED", {
        endpoint: "/api/recommendations/generate",
        hasToken: !!csrfToken,
        hasSession: !!sessionToken,
      });

      throw createError({
        statusCode: 403,
        statusMessage: "Token de sécurité invalide",
      });
    }

    const body = await readBody(event);
    const { meals, currentMeal, userPreferences } = body;

    if (!meals || !Array.isArray(meals)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Données de repas invalides",
      });
    }

    // Rediriger vers le nouvel endpoint Google AI
    const response = await $fetch("/api/ai/generate-recommendations", {
      method: "POST",
      body: {
        meals,
        currentMeal,
        userPreferences,
      },
    });

    return response;
  } catch (error: any) {
    console.error("Erreur génération recommandations:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage ||
        "Erreur lors de la génération des recommandations",
    });
  }
});
