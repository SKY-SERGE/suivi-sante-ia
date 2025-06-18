# Guide de Résolution Rapide - Erreur RLS Création de Profil

## Problème

Erreur lors de la création de profil utilisateur : "new row violates row-level security policy for table 'users'"

## Solution Rapide (5 minutes)

### Étape 1: Appliquer la correction via Supabase Dashboard

1. **Ouvrez votre dashboard Supabase**
2. **Allez dans SQL Editor**
3. **Copiez et exécutez le script suivant** :

```sql
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can create profile" ON users;

-- Recréer les politiques correctes
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- S'assurer que RLS est activé
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Créer la fonction RPC sécurisée UNIQUEMENT si elle n'existe pas déjà
CREATE OR REPLACE FUNCTION create_user_profile(
  p_id UUID,
  p_email TEXT,
  p_first_name TEXT DEFAULT '',
  p_last_name TEXT DEFAULT '',
  p_role user_role DEFAULT 'patient'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_data JSON;
  new_user users%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  IF auth.uid() != p_id THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE id = p_id) THEN
    RAISE EXCEPTION 'Profil existe déjà';
  END IF;

  INSERT INTO users (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (p_id, p_email, COALESCE(p_first_name, ''), COALESCE(p_last_name, ''), COALESCE(p_role, 'patient'), NOW(), NOW())
  RETURNING * INTO new_user;

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', new_user.id,
      'email', new_user.email,
      'first_name', new_user.first_name,
      'last_name', new_user.last_name,
      'role', new_user.role
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, user_role) TO authenticated;
```

### Étape 2: Vérifier que la correction fonctionne

Exécutez cette requête pour vérifier les politiques :

```sql
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
```

Vous devriez voir 3 politiques :

- `users_insert_own` (INSERT)
- `users_select_own` (SELECT)
- `users_update_own` (UPDATE)

### Étape 3: Tester dans l'application

1. **Rechargez votre application Nuxt**
2. **Essayez de créer un profil**
3. **Si ça ne marche toujours pas, visitez `/debug/profile` pour diagnostiquer**

### Étape 4: (Optionnel) Utiliser les scripts automatisés

Si vous préférez une approche scriptée :

#### Option A: Script PowerShell (Windows)

```powershell
cd d:\CODING\VUEJS-REACT\suivi-sante-ia
.\scripts\apply-rls-migrations-auto.ps1
```

#### Option B: Script Node.js

```powershell
cd d:\CODING\VUEJS-REACT\suivi-sante-ia
node scripts\apply-migrations.js
```

## Vérification des Corrections

### 1. Vérifier les politiques RLS

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### 2. Vérifier la fonction RPC

```sql
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'create_user_profile';
```

### 3. Tester la création de profil

Visitez `http://localhost:3000/debug/profile` et testez les différentes méthodes.

## Causes du Problème

1. **Politiques RLS trop restrictives** : Les anciennes politiques empêchaient l'insertion de nouveaux profils
2. **Logique d'authentification incorrecte** : Les conditions `WITH CHECK` étaient mal configurées
3. **Absence de fonction RPC sécurisée** : Pas d'alternative pour contourner RLS de manière contrôlée

## Après la Correction

Une fois corrigé, votre application devrait :

- ✅ Permettre la création de profils utilisateur
- ✅ Maintenir la sécurité RLS appropriée
- ✅ Fonctionner avec l'API existante
- ✅ Supporter la fonction RPC comme fallback

## Support

Si le problème persiste :

1. Vérifiez les logs dans `/debug/profile`
2. Consultez la documentation complète dans `docs/RESOLUTION-PROFILE-CREATION-RLS-ERROR.md`
3. Vérifiez que votre utilisateur est bien authentifié avant la création de profil
