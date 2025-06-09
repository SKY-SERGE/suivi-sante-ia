# Stage 1: Base image avec Node.js
FROM node:18-alpine AS base

# Installation des dépendances système nécessaires
RUN apk add --no-cache libc6-compat

# Définition du répertoire de travail
WORKDIR /app

# Stage 2: Installation des dépendances
FROM base AS deps

# Copie des fichiers de configuration des dépendances
COPY nuxt-app/package*.json ./
COPY nuxt-app/yarn.lock* ./
COPY nuxt-app/pnpm-lock.yaml* ./

# Installation des dépendances
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Fichier de verrouillage non trouvé." && exit 1; \
  fi

# Stage 3: Build de l'application
FROM base AS builder

# Copie des dépendances installées
COPY --from=deps /app/node_modules ./node_modules

# Copie du code source de l'application Nuxt
COPY nuxt-app/ .

# Variables d'environnement pour le build
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

# Build de l'application Nuxt
RUN npm run build

# Stage 4: Image de production
FROM node:18-alpine AS runner

# Installation des dépendances système pour la production
RUN apk add --no-cache dumb-init

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Définition du répertoire de travail
WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Copie des fichiers de build depuis le stage builder
COPY --from=builder --chown=nuxtjs:nodejs /app/.output /app/.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json /app/package.json

# Basculement vers l'utilisateur non-root
USER nuxtjs

# Exposition du port
EXPOSE 3000

# Commande de démarrage avec dumb-init pour une gestion propre des signaux
CMD ["dumb-init", "node", ".output/server/index.mjs"]
