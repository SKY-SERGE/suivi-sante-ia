# Guide de correction des politiques RLS

## Problème identifié

L'erreur d'authentification est causée par une politique RLS manquante sur la table `users`. Les utilisateurs authentifiés ne peuvent pas créer leur propre enregistrement dans cette table.

## Solution: Ajouter la politique INSERT manquante

### Méthode 1: Via l'éditeur SQL de Supabase (Recommandée)

1. Allez sur votre dashboard Supabase: https://supabase.com/dashboard
2. Sélectionnez votre projet: `icofccqmvkfoosjhyxbv`
3. Allez dans l'onglet "SQL Editor"
4. Exécutez cette requête SQL:

```sql
-- Supprimer la politique existante si elle existe (au cas où)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Créer la politique pour permettre l'insertion de son propre profil
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Vérifier que toutes les politiques sont bien en place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
```

### Méthode 2: Via PowerShell (si vous avez la clé service_role)

Exécutez le script:

```powershell
.\scripts\fix-rls-policy.ps1
```

## Vérification

Après avoir appliqué la correction:

1. Les politiques RLS pour la table `users` devraient être:

   - `Users can view own profile` (SELECT)
   - `Users can insert own profile` (INSERT) ← **Nouvelle politique**
   - `Users can update own profile` (UPDATE)

2. Testez la connexion dans l'application Nuxt:
   - Allez sur la page de connexion
   - Connectez-vous avec vos identifiants
   - Vérifiez que le profil utilisateur est créé automatiquement
   - Vérifiez que la redirection fonctionne correctement

## Fichiers modifiés

- `database/schema.sql` - Schema mis à jour avec la nouvelle politique
- `database/migrations/003_fix_users_rls_policy.sql` - Migration pour appliquer la correction
- `scripts/fix-rls-policy.ps1` - Script automatisé (optionnel)

## Prochaines étapes

Une fois la politique RLS corrigée, testez le flux d'authentification complet dans l'application.
