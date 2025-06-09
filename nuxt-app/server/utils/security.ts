/**
 * Middleware de sécurité pour la protection CSRF et validation des requêtes
 */

import crypto from "crypto";

// Configuration de sécurité
const SECURITY_CONFIG = {
  csrf: {
    tokenLength: 32,
    headerName: "x-csrf-token",
    cookieName: "csrf-token",
    maxAge: 3600000, // 1 heure
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // par fenêtre
    maxUploadRequests: 10, // pour les uploads
  },
};

// Store en mémoire pour le rate limiting (à remplacer par Redis en production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const uploadRateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

/**
 * Génère un token CSRF sécurisé
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(SECURITY_CONFIG.csrf.tokenLength).toString("hex");
}

/**
 * Valide un token CSRF
 */
export function validateCSRFToken(
  token: string,
  expectedToken: string
): boolean {
  if (!token || !expectedToken) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

/**
 * Obtient l'adresse IP du client
 */
export function getClientIP(event: any): string {
  const forwarded = getHeader(event, "x-forwarded-for");
  const realIP = getHeader(event, "x-real-ip");
  const remoteAddr = getClientAddress(event);

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return remoteAddr || "unknown";
}

/**
 * Vérifie le rate limiting
 */
export function checkRateLimit(
  clientIP: string,
  isUpload: boolean = false
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const config = SECURITY_CONFIG.rateLimit;
  const store = isUpload ? uploadRateLimitStore : rateLimitStore;
  const maxRequests = isUpload ? config.maxUploadRequests : config.maxRequests;

  const clientData = store.get(clientIP);

  // Si pas de données ou fenêtre expirée, reset
  if (!clientData || now > clientData.resetTime) {
    store.set(clientIP, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Vérifier si limite dépassée
  if (clientData.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  // Incrémenter le compteur
  clientData.count++;
  return { allowed: true, remaining: maxRequests - clientData.count };
}

/**
 * Valide un fichier uploadé
 */
export function validateUploadedFile(file: any): {
  valid: boolean;
  error?: string;
} {
  const config = SECURITY_CONFIG.upload;

  // Vérifier la taille
  if (file.data && file.data.length > config.maxFileSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximale: ${
        config.maxFileSize / (1024 * 1024)
      }MB`,
    };
  }

  // Vérifier le type MIME
  if (file.type && !config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types acceptés: ${config.allowedMimeTypes.join(
        ", "
      )}`,
    };
  }

  // Vérifier l'extension du nom de fichier
  if (file.filename) {
    const extension = file.filename
      .toLowerCase()
      .substring(file.filename.lastIndexOf("."));
    if (!config.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Extension de fichier non autorisée. Extensions acceptées: ${config.allowedExtensions.join(
          ", "
        )}`,
      };
    }
  }

  // Vérification basique de la signature du fichier (magic bytes)
  if (file.data && file.data.length >= 4) {
    const signature = file.data.subarray(0, 4);
    const validSignatures = [
      [0xff, 0xd8, 0xff], // JPEG
      [0x89, 0x50, 0x4e, 0x47], // PNG
      [0x52, 0x49, 0x46, 0x46], // WebP (RIFF)
    ];

    const isValidSignature = validSignatures.some((sig) =>
      sig.every((byte, index) => signature[index] === byte)
    );

    if (!isValidSignature) {
      return {
        valid: false,
        error:
          "Signature de fichier invalide. Le fichier peut être corrompu ou malveillant.",
      };
    }
  }

  return { valid: true };
}

/**
 * Nettoie et valide les en-têtes HTTP
 */
export function sanitizeHeaders(event: any): { [key: string]: string } {
  const headers = getHeaders(event);
  const sanitized: { [key: string]: string } = {};

  // Liste des en-têtes autorisés
  const allowedHeaders = [
    "content-type",
    "content-length",
    "authorization",
    "x-csrf-token",
    "user-agent",
    "referer",
    "origin",
  ];

  for (const [key, value] of Object.entries(headers)) {
    if (
      allowedHeaders.includes(key.toLowerCase()) &&
      typeof value === "string"
    ) {
      // Nettoyer la valeur de l'en-tête
      sanitized[key] = value.replace(/[\r\n\t]/g, "").substring(0, 2048);
    }
  }

  return sanitized;
}

/**
 * Log d'audit de sécurité
 */
export function logSecurityEvent(event: any, eventType: string, details: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: eventType,
    clientIP: getClientIP(event),
    userAgent: getHeader(event, "user-agent"),
    url: getRequestURL(event).toString(),
    method: getMethod(event),
    details: details,
  };

  // En production, envoyer vers un système de logs centralisé
  console.log("[SECURITY]", JSON.stringify(logEntry));
}
