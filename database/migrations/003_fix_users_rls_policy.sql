-- Migration pour corriger les politiques RLS sur la table users
-- Date: 2025-01-27
-- Description: Ajouter la politique INSERT manquante pour permettre aux utilisateurs de créer leur propre profil

-- Supprimer la politique existante si elle existe (au cas où)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Créer la politique pour permettre l'insertion de son propre profil
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Vérifier que toutes les politiques sont bien en place
\echo 'Politiques RLS pour la table users:'
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
