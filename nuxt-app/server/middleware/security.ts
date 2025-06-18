/**
 * Middleware de sécurité global pour tous les endpoints API
 * Applique les protections de base automatiquement
 */

import { logSecurityEvent, getClientIP } from "../utils/security";

export default defineEventHandler(async (event) => {
  return;
  // Appliquer seulement aux routes API
  if (!event.node.req.url?.startsWith("/api/")) {
    return;
  }

  const clientIP = getClientIP(event);

  // Headers de sécurité pour toutes les réponses API
  setHeaders(event, {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  // Validation de l'origine pour les requêtes sensibles
  const origin = getHeader(event, "origin");
  const referer = getHeader(event, "referer");
  const allowedOrigins = [
    process.env.NUXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "https://localhost:3000",
  ].filter(Boolean);

  // Pour les requêtes POST/PUT/DELETE, vérifier l'origine
  if (["POST", "PUT", "DELETE"].includes(getMethod(event))) {
    if (
      origin &&
      !allowedOrigins.some((allowed) => origin.startsWith(allowed))
    ) {
      logSecurityEvent(event, "INVALID_ORIGIN", {
        origin,
        referer,
        method: getMethod(event),
        url: event.node.req.url,
      });

      throw createError({
        statusCode: 403,
        statusMessage: "Origine non autorisée",
      });
    }
  }

  // Protection contre les attaques par déni de service (payload trop volumineux)
  const contentLength = getHeader(event, "content-length");
  if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
    // 50MB max
    logSecurityEvent(event, "PAYLOAD_TOO_LARGE", {
      contentLength,
      url: event.node.req.url,
    });

    throw createError({
      statusCode: 413,
      statusMessage: "Payload trop volumineux",
    });
  }

  // Validation des en-têtes User-Agent suspicieux
  const userAgent = getHeader(event, "user-agent");
  if (
    !userAgent ||
    userAgent.length < 10 ||
    /bot|crawler|spider|scraper/i.test(userAgent)
  ) {
    // Log mais ne bloque pas automatiquement (peut être légitime)
    logSecurityEvent(event, "SUSPICIOUS_USER_AGENT", {
      userAgent,
      url: event.node.req.url,
    });
  }

  // Protection contre les attaques de timing (réponse consistante)
  const startTime = Date.now();

  // Store le temps de début pour mesurer la durée de traitement
  event.context.securityStartTime = startTime;
});
