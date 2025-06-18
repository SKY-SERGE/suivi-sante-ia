-- Migration pour corriger les politiques RLS de la table users
-- Date: 2025-06-18

-- Désactiver temporairement RLS pour diagnostiquer
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recréer les politiques avec plus de flexibilité
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs authentifiés de créer leur profil initial
CREATE POLICY "Authenticated users can create profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Réactiver RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Vérifier les politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';
