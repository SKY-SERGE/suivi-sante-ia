-- ================================
-- SCRIPT DE RÉSOLUTION RAPIDE RLS
-- A exécuter directement dans l'éditeur SQL de Supabase
-- Date: 2025-06-18
-- ================================

-- ÉTAPE 1: Diagnostiquer l'état actuel
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- ÉTAPE 2: Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can create profile" ON users;

-- ÉTAPE 3: Recréer les politiques avec une logique claire
-- Politique pour la lecture (SELECT)
CREATE POLICY "users_select_own" ON users 
  FOR SELECT USING (auth.uid() = id);

-- Politique pour la création (INSERT) - permet aux utilisateurs authentifiés de créer leur propre profil
CREATE POLICY "users_insert_own" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour la mise à jour (UPDATE)
CREATE POLICY "users_update_own" ON users 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ÉTAPE 4: S'assurer que RLS est activé
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 5: Créer la fonction RPC sécurisée pour la création de profil
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
  -- Log pour debugging
  RAISE NOTICE 'Tentative de création de profil pour ID: %, Email: %', p_id, p_email;
  
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Vérifier que l'ID correspond à l'utilisateur authentifié
  IF auth.uid() != p_id THEN
    RAISE EXCEPTION 'Accès non autorisé - ID utilisateur ne correspond pas (auth: %, fourni: %)', auth.uid(), p_id;
  END IF;
  
  -- Vérifier si l'utilisateur existe déjà
  IF EXISTS (SELECT 1 FROM users WHERE id = p_id) THEN
    RAISE EXCEPTION 'Profil utilisateur existe déjà pour l''ID: %', p_id;
  END IF;
  
  -- Créer le nouveau profil utilisateur
  INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    p_id,
    p_email,
    COALESCE(p_first_name, ''),
    COALESCE(p_last_name, ''),
    COALESCE(p_role, 'patient'),
    NOW(),
    NOW()
  ) RETURNING * INTO new_user;
  
  -- Construire la réponse JSON
  result_data := json_build_object(
    'success', true,
    'user', json_build_object(
      'id', new_user.id,
      'email', new_user.email,
      'first_name', new_user.first_name,
      'last_name', new_user.last_name,
      'role', new_user.role,
      'created_at', new_user.created_at,
      'updated_at', new_user.updated_at
    ),
    'message', 'Profil utilisateur créé avec succès'
  );
  
  RAISE NOTICE 'Profil créé avec succès: %', result_data;
  
  RETURN result_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de la création: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erreur lors de la création du profil'
    );
END;
$$;

-- ÉTAPE 6: Donner les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, user_role) TO authenticated;

-- ÉTAPE 7: Vérification finale des politiques
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- ÉTAPE 8: Vérifier la fonction RPC
SELECT 
    routine_name, 
    routine_type, 
    specific_name,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'create_user_profile';

-- ÉTAPE 9: Test de la fonction (optionnel - remplacez les valeurs)
-- SELECT create_user_profile(
--   'VOTRE-USER-ID-ICI'::UUID,
--   'test@example.com',
--   'Prénom',
--   'Nom',
--   'patient'
-- );

-- ================================
-- INSTRUCTIONS D'UTILISATION:
-- ================================
-- 1. Copiez tout ce script
-- 2. Allez dans votre dashboard Supabase > SQL Editor
-- 3. Collez le script et exécutez-le
-- 4. Vérifiez les résultats des requêtes de vérification
-- 5. Testez la création de profil dans votre application
-- ================================
