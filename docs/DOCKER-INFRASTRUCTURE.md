# Infrastructure Docker - Suivi Santé IA

## Vue d'ensemble

Cette documentation décrit l'infrastructure Docker mise en place pour l'application **Suivi Santé IA**, une application Nuxt 3 avec intégration Supabase.

## Architecture

```
suivi-sante-ia/
├── nuxt-app/                 # Application Nuxt 3
│   ├── Dockerfile           # Image de production
│   ├── .env                 # Variables d'environnement Nuxt
│   ├── Makefile            # Commandes automatisées (Linux/Mac)
│   ├── docker-commands.ps1  # Commandes automatisées (Windows)
│   └── ...                  # Code source Nuxt
├── database/                # Schémas et données de test
├── nginx/                   # Configuration reverse proxy
├── docker-compose.yml       # Orchestration complète
└── .env                     # Variables d'environnement globales
```

## Configuration

### Variables d'environnement

#### Fichier `.env` (racine du projet)

Variables globales pour l'ensemble de l'infrastructure :

- **Supabase** : URL et clé anonyme
- **Redis** : Configuration cache
- **PostgreSQL** : Base de données locale
- **Sécurité** : JWT, chiffrement
- **Email** : Configuration SMTP
- **Monitoring** : Logs et métriques

#### Fichier `nuxt-app/.env`

Variables spécifiques à l'application Nuxt :

- `NUXT_PUBLIC_APP_NAME` : Nom de l'application
- `NUXT_SUPABASE_URL` : URL Supabase
- `NUXT_SUPABASE_ANON_KEY` : Clé anonyme Supabase

### Dockerfile

L'image Docker utilise :

- **Base** : Node.js 18 Alpine (légère)
- **Port exposé** : 3000
- **Optimisations** : Multi-stage build, cache des layers
- **Sécurité** : Utilisateur non-root

## Utilisation

### Commandes Docker directes

```bash
# Construction de l'image
docker build -t suivi-sante-nuxt:latest .

# Lancement du conteneur
docker run -d \
  --name suivi-sante-app \
  -p 3000:3000 \
  --env-file .env \
  suivi-sante-nuxt:latest

# Vérification du statut
docker ps --filter "name=suivi-sante-app"

# Logs
docker logs -f suivi-sante-app

# Arrêt
docker stop suivi-sante-app
docker rm suivi-sante-app
```

### Avec Makefile (Linux/Mac)

```bash
# Aide
make help

# Construction et lancement
make build
make run

# Gestion
make stop
make restart
make logs
make status

# Développement
make dev
make install

# Nettoyage
make clean
```

### Avec PowerShell (Windows)

```powershell
# Navigation vers le dossier
cd "nuxt-app"

# Aide
.\docker-commands.ps1 help

# Construction et lancement
.\docker-commands.ps1 build
.\docker-commands.ps1 run

# Gestion
.\docker-commands.ps1 stop
.\docker-commands.ps1 restart
.\docker-commands.ps1 logs
.\docker-commands.ps1 status

# Développement
.\docker-commands.ps1 dev
.\docker-commands.ps1 install

# Nettoyage
.\docker-commands.ps1 clean
```

## Vérification du déploiement

### 1. Test de l'application

```bash
# Vérifier que l'application répond
curl http://localhost:3000

# Ou ouvrir dans le navigateur
http://localhost:3000
```

### 2. Vérification des variables d'environnement

Les variables Supabase doivent être correctement chargées :

- URL Supabase : `https://icofccqmvkfoosjhyxbv.supabase.co`
- Clé anonyme configurée
- Nom de l'application : "Suivi Santé IA"

### 3. Tests de santé

```bash
# Statut du conteneur
docker inspect --format='{{.State.Status}}' suivi-sante-app

# Utilisation des ressources
docker stats suivi-sante-app --no-stream
```

## Troubleshooting

### Problèmes courants

#### 1. Port déjà utilisé

```bash
# Trouver le processus utilisant le port 3000
netstat -ano | findstr :3000

# Arrêter le conteneur existant
docker stop suivi-sante-app
```

#### 2. Variables d'environnement non chargées

```bash
# Vérifier le fichier .env
cat .env

# Reconstruire l'image
docker build --no-cache -t suivi-sante-nuxt:latest .
```

#### 3. Erreurs de build

```bash
# Build avec logs détaillés
docker build --progress=plain -t suivi-sante-nuxt:latest .

# Nettoyer les images corrompues
docker system prune -f
```

## Optimisations

### Performance

1. **Multi-stage build** : Réduction de la taille de l'image
2. **Cache npm** : Accélération des builds
3. **Alpine Linux** : Image de base légère

### Sécurité

1. **Utilisateur non-root** : Exécution sécurisée
2. **Variables d'environnement** : Pas de secrets dans l'image
3. **Port minimal** : Exposition du port 3000 uniquement

### Monitoring

1. **Health checks** : Vérification automatique de la santé
2. **Logs structurés** : Facilite le débogage
3. **Métriques** : Suivi des performances

## Maintenance

### Mise à jour

```bash
# Arrêter l'ancien conteneur
docker stop suivi-sante-app
docker rm suivi-sante-app

# Reconstruire
docker build -t suivi-sante-nuxt:latest .

# Relancer
docker run -d \
  --name suivi-sante-app \
  -p 3000:3000 \
  --env-file .env \
  suivi-sante-nuxt:latest
```

### Sauvegarde

```bash
# Exporter l'image
docker save suivi-sante-nuxt:latest > suivi-sante-backup.tar

# Importer l'image
docker load < suivi-sante-backup.tar
```

## Intégration continue

### GitHub Actions (exemple)

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build Docker image
        run: |
          cd nuxt-app
          docker build -t suivi-sante-nuxt:${{ github.sha }} .

      - name: Test container
        run: |
          docker run -d --name test-app -p 3000:3000 suivi-sante-nuxt:${{ github.sha }}
          sleep 10
          curl -f http://localhost:3000 || exit 1
          docker stop test-app
```

## Contacts et support

- **Développeur** : Équipe Suivi Santé IA
- **Documentation** : Mise à jour le $(Get-Date -Format "dd/MM/yyyy")
- **Version Docker** : Compatible avec Docker 20.10+
- **Version Node.js** : 18.x LTS
