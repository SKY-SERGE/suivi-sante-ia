# Guide de résolution - Erreur RLS lors de la création de profil utilisateur

## Problème identifié

L'erreur `new row violates row-level security policy for table "users"` indique que les politiques de sécurité au niveau des lignes (RLS) empêchent la création de nouveaux profils utilisateur.

## Solutions mises en place

### 1. Migrations SQL créées

1. **`database/migrations/fix_users_rls_policies.sql`**

   - Corrige et recrée les politiques RLS pour la table `users`
   - Ajoute une politique spécifique pour la création de profil initial

2. **`database/migrations/create_user_profile_function.sql`**
   - Crée une fonction RPC `create_user_profile` avec privilèges élevés
   - Contourne les limitations RLS de manière sécurisée

### 2. API modifiée

**`server/api/user/create-profile.post.ts`**

- Utilise la fonction RPC pour créer le profil
- Vérifie l'authentification côté serveur
- Ajoute des logs détaillés pour le débogage

### 3. Composables de diagnostic

**`composables/useUserProfileAdmin.ts`**

- Fonctions de test pour diagnostiquer les problèmes RLS
- Création de profil directe via RPC côté client
- Vérification de l'état d'authentification

### 4. Page de diagnostic

**`pages/debug/profile.vue`**

- Interface pour tester toutes les fonctionnalités
- Logs en temps réel pour identifier les problèmes
- Test des différentes méthodes de création de profil

## Instructions d'application

### Étape 1: Appliquer les migrations

**Option A - Windows (PowerShell):**

```powershell
cd "d:\CODING\VUEJS-REACT\suivi-sante-ia"
.\scripts\apply-rls-migrations.ps1
```

**Option B - Linux/Mac (Bash):**

```bash
cd /path/to/suivi-sante-ia
chmod +x scripts/apply-rls-migrations.sh
./scripts/apply-rls-migrations.sh
```

**Option C - Manuel via psql:**

```bash
# Définir la variable d'environnement
export SUPABASE_DB_URL="postgresql://user:password@host:port/database"

# Appliquer les migrations
psql "$SUPABASE_DB_URL" -f database/migrations/fix_users_rls_policies.sql
psql "$SUPABASE_DB_URL" -f database/migrations/create_user_profile_function.sql
```

### Étape 2: Tester avec la page de diagnostic

1. Accéder à `/debug/profile` dans l'application
2. Vérifier l'état d'authentification
3. Tester les politiques RLS
4. Essayer la création de profil via RPC et API
5. Analyser les logs pour identifier les problèmes restants

### Étape 3: Vérifications de production

Une fois les tests réussis sur la page de diagnostic :

1. Tester la création de profil normale dans l'application
2. Vérifier que les nouveaux utilisateurs peuvent se connecter
3. S'assurer que les profils existants fonctionnent toujours

## Variables d'environnement requises

Assurez-vous que ces variables sont définies :

```bash
# URL de la base de données Supabase
SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:[port]/postgres"

# Ou pour Supabase local
SUPABASE_DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"
```

## Dépannage

### Si la migration échoue

1. Vérifier que `SUPABASE_DB_URL` est correctement définie
2. Vérifier les permissions de connexion à la base de données
3. Appliquer manuellement les commandes SQL une par une

### Si l'erreur RLS persiste

1. Vérifier que les politiques ont été correctement appliquées :

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

2. Vérifier que la fonction RPC existe :

   ```sql
   SELECT * FROM pg_proc WHERE proname = 'create_user_profile';
   ```

3. Tester l'authentification côté serveur dans les logs Nuxt

### Si les types TypeScript posent problème

La fonction RPC utilise `(supabaseClient as any).rpc()` pour contourner les limitations de types. Cela est temporaire en attendant la mise à jour des types générés.

## Surveillance

Après application, surveiller :

1. Les logs de l'API `/api/user/create-profile`
2. Les erreurs dans la console du navigateur
3. Les nouveaux utilisateurs qui s'inscrivent
4. Les métriques de succès de création de profil

## Contact

Si le problème persiste après application de ces solutions, vérifier :

1. La version de Supabase utilisée
2. Les permissions de la base de données
3. La configuration RLS globale
4. Les logs de Supabase dans le dashboard
