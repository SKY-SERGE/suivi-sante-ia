# Script PowerShell pour appliquer les migrations RLS
# Date: 2025-06-18

Write-Host "=== Application des migrations pour corriger les politiques RLS ===" -ForegroundColor Green

# Vérifier que les variables d'environnement sont définies
if (-not $env:SUPABASE_DB_URL) {
    Write-Host "Erreur: SUPABASE_DB_URL n'est pas défini" -ForegroundColor Red
    Write-Host "Veuillez définir la variable d'environnement avec l'URL de votre base de données Supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Application de la migration pour corriger les politiques RLS..." -ForegroundColor Cyan
try {
    psql $env:SUPABASE_DB_URL -f "database/migrations/fix_users_rls_policies.sql"
    if ($LASTEXITCODE -ne 0) {
        throw "Erreur lors de l'application de la migration RLS"
    }
    Write-Host "✓ Migration RLS appliquée avec succès" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'application de la migration RLS: $_" -ForegroundColor Red
    exit 1
}

Write-Host "2. Application de la migration pour créer la fonction RPC..." -ForegroundColor Cyan
try {
    psql $env:SUPABASE_DB_URL -f "database/migrations/create_user_profile_function.sql"
    if ($LASTEXITCODE -ne 0) {
        throw "Erreur lors de l'application de la migration RPC"
    }
    Write-Host "✓ Migration RPC appliquée avec succès" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'application de la migration RPC: $_" -ForegroundColor Red
    exit 1
}

Write-Host "3. Vérification des politiques appliquées..." -ForegroundColor Cyan
psql $env:SUPABASE_DB_URL -c "
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';
"

Write-Host "4. Vérification de la fonction RPC créée..." -ForegroundColor Cyan
psql $env:SUPABASE_DB_URL -c "
SELECT routine_name, routine_type, specific_name 
FROM information_schema.routines 
WHERE routine_name = 'create_user_profile';
"

Write-Host "=== Migrations appliquées avec succès ===" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Pour tester la création de profil, vous pouvez maintenant:" -ForegroundColor Yellow
Write-Host "1. Vous connecter à l'application" -ForegroundColor White
Write-Host "2. Le système devrait automatiquement créer votre profil via la fonction RPC" -ForegroundColor White
Write-Host "3. Vérifier les logs de l'API pour confirmer le succès" -ForegroundColor White
