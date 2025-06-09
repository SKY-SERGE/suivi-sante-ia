# Guide de Déploiement - Suivi Santé IA

## Vue d'ensemble

Ce guide détaille les procédures de déploiement pour l'application **Suivi Santé IA** en environnements de développement, test et production.

## 🏗️ Prérequis

### Infrastructure requise

- **Serveur**: Linux Ubuntu 20.04+ ou similaire
- **Docker**: Version 24.0+ avec Docker Compose
- **Mémoire**: 4GB minimum, 8GB recommandé
- **Stockage**: 20GB minimum pour l'application + logs
- **Réseau**: Ports 80, 443, 3000 ouverts

### Services externes

- **Supabase** : Base de données PostgreSQL et authentification
- **Google Cloud Platform** : API Vision et Generative AI
- **Domaine** : Certificat SSL valide pour la production

## 🐳 Déploiement avec Docker

### 1. Préparation de l'environnement

```bash
# Cloner le repository
git clone https://github.com/your-org/suivi-sante-ia.git
cd suivi-sante-ia

# Créer les fichiers d'environnement
cp .env.example .env.production
```

### 2. Configuration de production

Éditer `.env.production` avec les valeurs de production :

```env
# Application
NODE_ENV=production
NUXT_PUBLIC_APP_URL=https://votre-domaine.com
NUXT_PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# Google APIs
GOOGLE_AI_API_KEY=your_production_gemini_key
GOOGLE_VISION_API_KEY=your_production_vision_key

# Sécurité
NUXT_SECRET_KEY=your_very_secure_secret_key_min_32_chars
NUXT_SESSION_PASSWORD=your_session_password_min_32_chars

# Logging
LOG_LEVEL=warn
```

### 3. Déploiement en production

```bash
# Construire et démarrer avec la configuration optimisée
docker-compose -f docker-compose.optimized.yml up -d

# Vérifier le statut
docker-compose -f docker-compose.optimized.yml ps

# Voir les logs
docker-compose -f docker-compose.optimized.yml logs -f nuxt-app
```

### 4. Configuration Nginx (reverse proxy)

Créer `/etc/nginx/sites-available/suivi-sante-ia` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Taille maximum des fichiers
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

Activer la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/suivi-sante-ia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 Procédures de mise à jour

### 1. Mise à jour sans interruption

```bash
# Script de mise à jour automatisé
#!/bin/bash

# Variables
COMPOSE_FILE="docker-compose.optimized.yml"
BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"

echo "🔄 Début de la mise à jour..."

# 1. Créer un backup
mkdir -p $BACKUP_DIR
docker-compose -f $COMPOSE_FILE exec supabase pg_dump -U postgres suivi_sante > $BACKUP_DIR/database.sql

# 2. Récupérer les derniers changements
git fetch origin
git checkout main
git pull origin main

# 3. Reconstruire l'image
docker-compose -f $COMPOSE_FILE build --no-cache

# 4. Redémarrer les services
docker-compose -f $COMPOSE_FILE up -d

# 5. Vérifier la santé
sleep 30
if curl -f http://localhost:3000/health; then
    echo "✅ Mise à jour réussie"
else
    echo "❌ Erreur - Restauration du backup"
    # Logique de rollback ici
fi
```

### 2. Rollback en cas de problème

```bash
# Revenir à la version précédente
git checkout [previous-commit-hash]
docker-compose -f docker-compose.optimized.yml build --no-cache
docker-compose -f docker-compose.optimized.yml up -d

# Restaurer la base de données si nécessaire
# docker exec -i supabase_container psql -U postgres suivi_sante < backup.sql
```

## 📊 Monitoring et logs

### 1. Health checks

L'application expose un endpoint de santé :

```bash
curl https://votre-domaine.com/api/health
```

Réponse attendue :

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "database": "connected",
    "google_ai": "available",
    "google_vision": "available"
  }
}
```

### 2. Logs Docker

```bash
# Logs en temps réel
docker-compose -f docker-compose.optimized.yml logs -f

# Logs d'un service spécifique
docker-compose -f docker-compose.optimized.yml logs -f nuxt-app

# Dernières 100 lignes
docker-compose -f docker-compose.optimized.yml logs --tail=100
```

### 3. Monitoring des ressources

```bash
# Stats Docker
docker stats

# Utilisation disque
df -h

# Mémoire système
free -m

# Processus
top
```

## 🔒 Sécurité en production

### 1. Variables d'environnement

- ✅ Utiliser des secrets forts (minimum 32 caractères)
- ✅ Rotation régulière des clés API
- ✅ Pas de secrets dans le code source
- ✅ Variables chiffrées dans l'orchestrateur

### 2. Pare-feu

```bash
# UFW configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Certificats SSL

```bash
# Renouvellement automatique avec certbot
sudo certbot renew --dry-run

# Cron job pour renouvellement
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🧪 Tests de déploiement

### 1. Tests de smoke après déploiement

```bash
#!/bin/bash

BASE_URL="https://votre-domaine.com"

echo "🧪 Tests de smoke post-déploiement..."

# Test de santé
if curl -f $BASE_URL/api/health; then
    echo "✅ Health check OK"
else
    echo "❌ Health check FAILED"
    exit 1
fi

# Test d'authentification
if curl -f -X POST $BASE_URL/api/auth/signin -d '{"email":"test@example.com","password":"test"}' -H "Content-Type: application/json"; then
    echo "✅ Auth endpoint OK"
else
    echo "❌ Auth endpoint FAILED"
fi

# Test d'analyse de repas
if curl -f $BASE_URL/api/vision/analyze-meal; then
    echo "✅ Vision API endpoint OK"
else
    echo "❌ Vision API endpoint FAILED"
fi

echo "🎉 Tests terminés"
```

### 2. Tests de charge

```bash
# Avec Apache Benchmark
ab -n 1000 -c 10 https://votre-domaine.com/

# Avec k6
k6 run --vus 10 --duration 30s load-test.js
```

## 📋 Checklist de déploiement

### Avant le déploiement

- [ ] Tests passent en local
- [ ] Variables d'environnement configurées
- [ ] Clés API valides
- [ ] Certificats SSL en place
- [ ] Backup de la base de données
- [ ] Plan de rollback défini

### Pendant le déploiement

- [ ] Build Docker réussi
- [ ] Services démarrés correctement
- [ ] Health checks OK
- [ ] Tests de smoke passent
- [ ] Logs sans erreurs critiques

### Après le déploiement

- [ ] Monitoring actif
- [ ] Tests utilisateur validés
- [ ] Performance acceptable
- [ ] Sauvegarde fonctionnelle
- [ ] Équipe notifiée

## 🆘 Résolution de problèmes

### Problèmes courants

1. **Container ne démarre pas**

   ```bash
   docker-compose logs nuxt-app
   # Vérifier les variables d'environnement et les dépendances
   ```

2. **Erreurs API externes**

   ```bash
   # Vérifier les clés API
   curl -H "Authorization: Bearer $GOOGLE_AI_API_KEY" https://generativelanguage.googleapis.com/v1/models
   ```

3. **Performance dégradée**

   ```bash
   # Vérifier les ressources
   docker stats
   htop
   ```

4. **Base de données inaccessible**
   ```bash
   # Tester la connexion Supabase
   curl -H "apikey: $SUPABASE_ANON_KEY" $SUPABASE_URL/rest/v1/users
   ```

### Contacts d'urgence

- **Équipe technique** : tech@votre-domaine.com
- **DevOps** : devops@votre-domaine.com
- **Support Supabase** : support@supabase.io

## 📚 Documentation annexe

- [Guide de développement](./DEVELOPER-INTEGRATION-GUIDE.md)
- [Architecture technique](./TECHNICAL-ARCHITECTURE.md)
- [Optimisations Docker](./DOCKER-OPTIMIZATION-REPORT.md)
- [Sécurité](./SECURITY-REMEDIATION-IMPLEMENTATION.md)
