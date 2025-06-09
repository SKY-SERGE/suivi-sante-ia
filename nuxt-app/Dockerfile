# ==============================================================================
# DOCKERFILE POUR SUIVI SANTÉ IA - NUXT 3 APPLICATION
# ==============================================================================
# Multi-stage build pour optimiser la taille de l'image finale
# ==============================================================================

# ==============================================================================
# ÉTAPE 1: BUILD STAGE
# ==============================================================================
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache git

# Copier les fichiers de configuration des packages
COPY package*.json ./
COPY tsconfig.json ./
COPY nuxt.config.ts ./

# Installer les dépendances
RUN npm ci --only=production=false

# Copier le code source de l'application
COPY . .

# Construire l'application pour la production
RUN npm run build

# ==============================================================================
# ÉTAPE 2: PRODUCTION STAGE
# ==============================================================================
FROM node:20-alpine AS production

# Installer les dépendances système pour la production
RUN apk add --no-cache dumb-init

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxt -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires depuis le stage de build
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxt:nodejs /app/package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Changer vers l'utilisateur non-root
USER nuxt

# Exposer le port 3000
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

# Point de santé pour Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Commande de démarrage avec dumb-init pour une gestion propre des signaux
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", ".output/server/index.mjs"]
