# Script PowerShell pour appliquer la correction des politiques RLS
# Date: 2025-01-27
# Description: Applique la migration pour corriger les politiques RLS sur la table users

Write-Host "🔧 Application de la correction des politiques RLS..." -ForegroundColor Green

# Configuration Supabase depuis .env
$SUPABASE_URL = "https://icofccqmvkfoosjhyxbv.supabase.co"
$SUPABASE_SERVICE_ROLE_KEY = Read-Host -Prompt "Entrez votre SUPABASE_SERVICE_ROLE_KEY" -AsSecureString

if (-not $SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host "❌ La clé de service Supabase est requise pour modifier les politiques RLS" -ForegroundColor Red
    Write-Host "💡 Vous pouvez la trouver dans votre dashboard Supabase > Settings > API > service_role key" -ForegroundColor Yellow
    exit 1
}

# Convertir en texte
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SUPABASE_SERVICE_ROLE_KEY)
$SERVICE_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# SQL à exécuter
$SQL_QUERY = @"
-- Supprimer la politique existante si elle existe (au cas où)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Créer la politique pour permettre l'insertion de son propre profil
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
"@

Write-Host "📋 Requête SQL à exécuter:" -ForegroundColor Cyan
Write-Host $SQL_QUERY -ForegroundColor Gray

try {
    # Exécuter la requête via l'API REST de PostgREST
    $headers = @{
        "apikey" = $SERVICE_KEY
        "Authorization" = "Bearer $SERVICE_KEY"
        "Content-Type" = "application/json"
        "Prefer" = "return=minimal"
    }
    
    $body = @{
        "query" = $SQL_QUERY
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
    
    Write-Host "✅ Migration appliquée avec succès!" -ForegroundColor Green
    Write-Host "🔒 La politique RLS a été ajoutée: les utilisateurs peuvent maintenant créer leur propre profil." -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de l'application de la migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "" -ForegroundColor Yellow
    Write-Host "💡 Méthode alternative: Exécutez cette requête SQL directement dans l'éditeur SQL de Supabase:" -ForegroundColor Yellow
    Write-Host $SQL_QUERY -ForegroundColor Gray
}

# Nettoyer la clé de service de la mémoire
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

Write-Host ""
Write-Host "🧪 Prochaine étape: Testez la connexion dans l'application Nuxt" -ForegroundColor Cyan
