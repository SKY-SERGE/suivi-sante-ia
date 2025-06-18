#!/bin/bash

# Script pour appliquer les migrations RLS pour corriger les problèmes de création de profil
# Date: 2025-06-18

echo "=== Application des migrations pour corriger les politiques RLS ==="

# Vérifier que les variables d'environnement sont définies
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Erreur: SUPABASE_DB_URL n'est pas défini"
  echo "Veuillez définir la variable d'environnement avec l'URL de votre base de données Supabase"
  exit 1
fi

echo "1. Application de la migration pour corriger les politiques RLS..."
psql "$SUPABASE_DB_URL" -f database/migrations/fix_users_rls_policies.sql

if [ $? -ne 0 ]; then
  echo "Erreur lors de l'application de la migration RLS"
  exit 1
fi

echo "2. Application de la migration pour créer la fonction RPC..."
psql "$SUPABASE_DB_URL" -f database/migrations/create_user_profile_function.sql

if [ $? -ne 0 ]; then
  echo "Erreur lors de l'application de la migration RPC"
  exit 1
fi

echo "3. Vérification des politiques appliquées..."
psql "$SUPABASE_DB_URL" -c "
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';
"

echo "4. Vérification de la fonction RPC créée..."
psql "$SUPABASE_DB_URL" -c "
SELECT routine_name, routine_type, specific_name 
FROM information_schema.routines 
WHERE routine_name = 'create_user_profile';
"

echo "=== Migrations appliquées avec succès ==="
echo ""
echo "Note: Pour tester la création de profil, vous pouvez maintenant:"
echo "1. Vous connecter à l'application"
echo "2. Le système devrait automatiquement créer votre profil via la fonction RPC"
echo "3. Vérifier les logs de l'API pour confirmer le succès"
