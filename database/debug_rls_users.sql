-- Script de test et résolution des problèmes RLS pour la table users
-- À exécuter dans l'interface Supabase SQL Editor

-- 1. Vérifier l'état actuel de RLS sur la table users
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    hasrls 
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Lister toutes les politiques existantes pour la table users
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

-- 3. Supprimer toutes les politiques existantes pour repartir à zéro
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Doctors can read consented patient profiles" ON users;
DROP POLICY IF EXISTS "Admins can read all user profiles" ON users;

-- 4. Recréer les politiques nécessaires

-- Politique SELECT: Utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT 
USING (auth.uid() = id);

-- Politique INSERT: Utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Politique UPDATE: Utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique pour les médecins (peuvent voir les profils des patients consentants)
CREATE POLICY "Doctors can read consented patient profiles" ON users
FOR SELECT
USING (
    role = 'patient' AND
    EXISTS (
        SELECT 1 FROM consents
        WHERE patient_id = users.id
        AND doctor_id = auth.uid()
        AND status = 'granted'
    )
    OR auth.uid() = id
);

-- Politique pour les admins (peuvent tout voir)
CREATE POLICY "Admins can read all user profiles" ON users
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users as u
        WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
    OR auth.uid() = id
);

-- 5. Vérifier que RLS est activé
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Tester les politiques avec des requêtes de test
-- (ces requêtes échoueront si exécutées dans l'éditeur SQL mais fonctionneront depuis l'application)

-- Test 1: Vérifier que la politique INSERT fonctionne
-- INSERT INTO users (id, email, role, first_name, last_name) 
-- VALUES (auth.uid(), 'test@example.com', 'patient', 'Test', 'User');

-- Test 2: Vérifier que la politique SELECT fonctionne
-- SELECT * FROM users WHERE id = auth.uid();

-- 7. Afficher le résultat final
SELECT 
    'Politique créée: ' || policyname as status,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- 8. Informations sur auth.uid()
SELECT 
    'auth.uid() function exists' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'uid' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
        ) THEN 'YES' 
        ELSE 'NO' 
    END as result;
