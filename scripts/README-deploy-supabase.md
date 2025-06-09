# 📋 Guide d'utilisation - Script de déploiement Supabase

## Description

Le script `deploy-supabase-schema.ps1` automatise le déploiement du schéma de base de données vers Supabase Cloud.

## Prérequis

1. **PowerShell** (Windows)
2. **Accès Internet** pour Supabase API
3. **Service Role Key** Supabase (⚠️ Ne jamais partager!)

## Obtenir la Service Role Key

1. Connectez-vous au Dashboard Supabase
2. Allez dans **Settings** > **API**
3. Copiez la **service_role key** (pas l'anon key!)

⚠️ **ATTENTION**: Cette clé donne un accès complet à votre base de données. Ne la partagez jamais et ne la committez jamais dans Git!

## Utilisation

### 1. Déploiement avec paramètres

```powershell
# Depuis la racine du projet
.\scripts\deploy-supabase-schema.ps1 -SupabaseUrl "https://votre-projet.supabase.co" -ServiceKey "votre_service_role_key"
```

### 2. Déploiement avec données de test

```powershell
.\scripts\deploy-supabase-schema.ps1 -SupabaseUrl "https://votre-projet.supabase.co" -ServiceKey "votre_service_role_key" -IncludeTestData
```

### 3. Déploiement automatique (lecture depuis .env)

Si votre `nuxt-app/.env` contient `NUXT_PUBLIC_SUPABASE_URL`:

```powershell
.\scripts\deploy-supabase-schema.ps1 -ServiceKey "votre_service_role_key"
```

## Ce que fait le script

1. ✅ **Vérifie la connexion** à Supabase
2. ✅ **Valide les fichiers** de schéma
3. ✅ **Déploie le schéma principal** (`database/schema.sql`)
4. ✅ **Déploie les données de test** (optionnel, `database/test_data.sql`)
5. ✅ **Affiche un rapport** de déploiement

## Contenu déployé

### Schéma principal (`database/schema.sql`)

- Types ENUM (rôles, statuts, etc.)
- Tables (users, consents, health_data, etc.)
- Contraintes et relations
- Triggers automatiques
- Politiques RLS (Row Level Security)
- Utilisateur admin par défaut

### Données de test (`database/test_data.sql`)

- Utilisateurs de test (patient, médecin, admin)
- Profils utilisateurs
- Consentements exemple
- Données de santé exemple

## Sécurité

- 🔒 **Service Role Key** requise pour modifications de schéma
- 🔒 **Confirmation manuelle** avant déploiement
- 🔒 **Validation de connexion** avant opérations
- 🔒 **Gestion d'erreurs** complète

## Dépannage

### Erreur de connexion

```
❌ Impossible de se connecter à Supabase
```

**Solutions**:

- Vérifiez l'URL Supabase
- Vérifiez la Service Role Key
- Vérifiez votre connexion Internet

### Erreur de permissions

```
❌ Erreur lors de l'exécution : Unauthorized
```

**Solutions**:

- Utilisez la **service_role key** (pas l'anon key)
- Vérifiez que la clé n'a pas expiré

### Fichier non trouvé

```
❌ Fichier non trouvé: database\schema.sql
```

**Solutions**:

- Exécutez depuis la racine du projet
- Vérifiez que les fichiers SQL existent

## Exemples concrets

### Déploiement complet pour développement

```powershell
# Configuration des variables
$url = "https://icofccqmvkfoosjhyxbv.supabase.co"
$key = "eyJhbGci..." # Votre service_role key

# Déploiement avec données de test
.\scripts\deploy-supabase-schema.ps1 -SupabaseUrl $url -ServiceKey $key -IncludeTestData
```

### Déploiement production (sans données de test)

```powershell
.\scripts\deploy-supabase-schema.ps1 -SupabaseUrl $url -ServiceKey $key
```

## Vérification post-déploiement

Après déploiement, vérifiez dans le Dashboard Supabase:

1. **Tables créées**: users, user_profiles, consents, etc.
2. **RLS activé** sur toutes les tables sensibles
3. **Politiques RLS** configurées
4. **Données de test** présentes (si incluses)

## Intégration avec le workflow

Ce script peut être intégré dans vos processus CI/CD ou utilisé manuellement pour:

- Setup initial d'environnement
- Mise à jour de schéma
- Reset de base de données de développement
