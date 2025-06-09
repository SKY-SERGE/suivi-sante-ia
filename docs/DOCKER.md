# 🐳 Configuration Docker - Suivi Santé IA

Cette documentation explique comment utiliser Docker avec l'application Suivi Santé IA.

## 📋 Prérequis

- Docker (version 20.10+)
- Docker Compose (version 1.29+)
- Make (optionnel, pour utiliser le Makefile)

## 🚀 Démarrage rapide

### Développement

```bash
# Avec Make (recommandé)
make dev

# Ou avec Docker Compose directement
docker-compose -f docker-compose.dev.yml up --build -d
```

L'application sera disponible sur :

- **Application** : http://localhost:3000
- **MailHog** (emails de test) : http://localhost:8025

### Production

```bash
# Avec Make
make prod

# Ou avec Docker Compose
docker-compose up --build -d
```

L'application sera disponible sur http://localhost:3000

### Production avec NGINX

```bash
# Avec Make
make prod-nginx

# Ou avec Docker Compose
docker-compose --profile nginx up -d
```

L'application sera disponible sur http://localhost (port 80)

## 📁 Structure des fichiers Docker

```
├── docker-compose.yml          # Configuration production
├── docker-compose.dev.yml      # Configuration développement
├── Makefile                    # Commandes utiles
├── nuxt-app/
│   ├── Dockerfile             # Image Nuxt 3
│   └── .dockerignore          # Fichiers exclus du build
└── nginx/
    └── nginx.conf             # Configuration NGINX
```

## 🔧 Services disponibles

### Services principaux

| Service    | Description                        | Port    |
| ---------- | ---------------------------------- | ------- |
| `nuxt-app` | Application Nuxt 3 (production)    | 3000    |
| `nuxt-dev` | Application Nuxt 3 (développement) | 3000    |
| `redis`    | Cache Redis                        | 6379    |
| `nginx`    | Reverse proxy (optionnel)          | 80, 443 |

### Services optionnels

| Service        | Description                       | Port       | Profil     |
| -------------- | --------------------------------- | ---------- | ---------- |
| `postgres`     | Base de données PostgreSQL locale | 5432       | `local-db` |
| `postgres-dev` | PostgreSQL pour développement     | 5433       | dev        |
| `mailhog`      | Serveur email de test             | 1025, 8025 | dev        |

## 🛠 Commandes Make disponibles

### Développement

```bash
make dev          # Démarrer l'environnement de développement
make dev-logs     # Afficher les logs de développement
make dev-stop     # Arrêter l'environnement de développement
make dev-clean    # Nettoyer l'environnement de développement
```

### Production

```bash
make build        # Construire les images Docker
make prod         # Démarrer l'environnement de production
make prod-nginx   # Démarrer avec NGINX
make prod-logs    # Afficher les logs de production
make prod-stop    # Arrêter l'environnement de production
```

### Base de données

```bash
make db-setup     # Initialiser la base de données locale
make db-reset     # Réinitialiser la base de données locale
```

### Utilitaires

```bash
make status       # Afficher le statut des conteneurs
make logs         # Afficher tous les logs
make restart      # Redémarrer les services
make clean        # Nettoyer les conteneurs et volumes
make backup       # Sauvegarder les données
make update       # Mettre à jour les images Docker
```

## 🔐 Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Redis
REDIS_PASSWORD=your_redis_password

# PostgreSQL (pour base locale)
POSTGRES_DB=suivi_sante
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password
```

## 🐋 Commandes Docker Compose manuelles

### Développement

```bash
# Démarrer
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Arrêter
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Démarrer
docker-compose up -d

# Avec NGINX
docker-compose --profile nginx up -d

# Avec base de données locale
docker-compose --profile local-db up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## 🔍 Debugging

### Accéder à un conteneur

```bash
# Application Nuxt (production)
docker-compose exec nuxt-app sh

# Application Nuxt (développement)
docker-compose -f docker-compose.dev.yml exec nuxt-dev sh

# Redis
docker-compose exec redis redis-cli

# PostgreSQL
docker-compose exec postgres psql -U postgres -d suivi_sante
```

### Voir les logs d'un service spécifique

```bash
# Logs de l'application Nuxt
docker-compose logs -f nuxt-app

# Logs Redis
docker-compose logs -f redis

# Logs NGINX
docker-compose logs -f nginx
```

## 🚨 Dépannage

### Problèmes courants

1. **Port déjà utilisé**

   ```bash
   # Identifier le processus
   netstat -ano | findstr :3000
   # Tuer le processus ou changer le port
   ```

2. **Volumes persistants corrompus**

   ```bash
   # Supprimer les volumes
   docker-compose down -v
   # Recréer
   docker-compose up -d
   ```

3. **Images obsolètes**
   ```bash
   # Forcer la reconstruction
   docker-compose build --no-cache
   ```

### Nettoyage complet

```bash
# Arrêter tous les services
make clean

# Nettoyage complet (ATTENTION!)
make clean-all
```

## 📊 Monitoring

### Health checks

Les services incluent des health checks automatiques :

```bash
# Vérifier l'état des services
docker-compose ps
```

### Métriques

Les logs sont accessibles via :

```bash
# Logs applicatifs
docker-compose logs nuxt-app

# Logs NGINX
docker-compose logs nginx
```

## 🔄 Mise à jour

### Mettre à jour les images

```bash
make update
make build
make prod
```

### Sauvegarde avant mise à jour

```bash
make backup
```

## 📝 Notes importantes

- **Développement** : Le code source est monté en volume pour le hot-reload
- **Production** : L'image est construite avec le code source inclus
- **Base de données** : Utilisez Supabase en production, PostgreSQL local pour les tests
- **SSL/TLS** : Configurez un certificat pour NGINX en production
- **Sécurité** : Changez tous les mots de passe par défaut avant la production
