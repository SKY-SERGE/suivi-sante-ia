/**
 * API Endpoint pour générer un token CSRF
 * GET /api/auth/csrf-token
 */

import { generateCSRFToken, logSecurityEvent } from "../../utils/security";

export default defineEventHandler(async (event) => {
  // Vérifier que c'est bien une requête GET
  if (!isMethod(event, "GET")) {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    // Générer un nouveau token CSRF
    const csrfToken = generateCSRFToken();

    // Stocker le token dans un cookie sécurisé
    setCookie(event, "csrf-session", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600, // 1 heure
      path: "/",
    });

    // Log de génération du token
    logSecurityEvent(event, "CSRF_TOKEN_GENERATED", {
      endpoint: "/api/auth/csrf-token",
    });

    return {
      success: true,
      csrfToken: csrfToken,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logSecurityEvent(event, "CSRF_TOKEN_ERROR", {
      endpoint: "/api/auth/csrf-token",
      error: error.message,
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la génération du token de sécurité",
    });
  }
});
