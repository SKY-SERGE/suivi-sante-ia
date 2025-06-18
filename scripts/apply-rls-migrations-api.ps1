# Script PowerShell pour appliquer les migrations via Supabase REST API
# Alternative à psql pour les environnements où PostgreSQL client n'est pas installé
# Date: 2025-06-18

Write-Host "=== Application des migrations RLS via Supabase REST API ===" -ForegroundColor Green

# Vérifier la présence du fichier .env
$envPath = "nuxt-app\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "Erreur: Fichier .env introuvable dans nuxt-app/" -ForegroundColor Red
    Write-Host "Veuillez créer un fichier .env basé sur .env.example avec vos configurations Supabase" -ForegroundColor Yellow
    exit 1
}

# Charger les variables d'environnement depuis le fichier .env
Write-Host "Chargement des variables d'environnement depuis $envPath..." -ForegroundColor Cyan
Get-Content $envPath | ForEach-Object {
    if ($_ -match "^([^#][^=]*?)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Vérifier les variables requises
$supabaseUrl = $env:NUXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:NUXT_PUBLIC_SUPABASE_ANON_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Erreur: Variables d'environnement Supabase manquantes" -ForegroundColor Red
    Write-Host "Veuillez configurer NUXT_PUBLIC_SUPABASE_URL et NUXT_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env" -ForegroundColor Yellow
    exit 1
}

Write-Host "URL Supabase: $supabaseUrl" -ForegroundColor Cyan

# Demander la clé de service (service_role key) pour les opérations admin
Write-Host "Pour appliquer les migrations, nous avons besoin de votre clé de service Supabase (service_role key)." -ForegroundColor Yellow
Write-Host "Vous pouvez la trouver dans votre dashboard Supabase > Settings > API > service_role key" -ForegroundColor Gray
Write-Host "ATTENTION: Cette clé a des privilèges administrateur. Ne la partagez jamais." -ForegroundColor Red
$serviceKey = Read-Host "Clé de service Supabase" -AsSecureString
$serviceKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($serviceKey))

# Lire les fichiers de migration
$rlsMigration = Get-Content "database/migrations/fix_users_rls_policies.sql" -Raw
$rpcMigration = Get-Content "database/migrations/create_user_profile_function.sql" -Raw

# Fonction pour exécuter une requête SQL via l'API REST de Supabase
function Invoke-SupabaseSQL {
    param(
        [string]$Query,
        [string]$Description
    )
    
    Write-Host "Exécution: $Description..." -ForegroundColor Cyan
    
    $headers = @{
        "Authorization" = "Bearer $serviceKeyPlain"
        "Content-Type" = "application/json"
        "apikey" = $serviceKeyPlain
    }
    
    $body = @{
        "query" = $Query
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
        Write-Host "✓ $Description réussie" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Erreur lors de $Description : $($_.Exception.Message)" -ForegroundColor Red
        
        # Essayer l'approche alternative avec l'endpoint SQL direct
        try {
            Write-Host "Tentative avec l'endpoint SQL direct..." -ForegroundColor Yellow
            $sqlHeaders = @{
                "Authorization" = "Bearer $serviceKeyPlain"
                "Content-Type" = "application/vnd.pgrst.object+json"
                "apikey" = $serviceKeyPlain
            }
            
            # Créer une fonction temporaire pour exécuter le SQL
            $tempFunctionName = "temp_migration_" + (Get-Random)
            $wrapperSql = @"
CREATE OR REPLACE FUNCTION $tempFunctionName()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS `$`$
$Query
SELECT 'Migration executed successfully' as result;
`$`$;

SELECT $tempFunctionName();
DROP FUNCTION $tempFunctionName();
"@
            
            $wrapperBody = @{
                "query" = $wrapperSql
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $wrapperBody
            Write-Host "✓ $Description réussie (méthode alternative)" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "Erreur également avec la méthode alternative: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Appliquer les migrations
$success = $true

Write-Host "1. Application de la migration pour corriger les politiques RLS..." -ForegroundColor Cyan
if (-not (Invoke-SupabaseSQL -Query $rlsMigration -Description "Migration RLS")) {
    $success = $false
}

Write-Host "2. Application de la migration pour créer la fonction RPC..." -ForegroundColor Cyan
if (-not (Invoke-SupabaseSQL -Query $rpcMigration -Description "Migration RPC")) {
    $success = $false
}

if ($success) {
    Write-Host "=== Migrations appliquées avec succès ===" -ForegroundColor Green
    Write-Host "Vous pouvez maintenant tester la création de profil dans votre application." -ForegroundColor Yellow
} else {
    Write-Host "=== Certaines migrations ont échoué ===" -ForegroundColor Red
    Write-Host "Veuillez vérifier les erreurs ci-dessus et réessayer." -ForegroundColor Yellow
}

# Nettoyer la clé de service de la mémoire
$serviceKey = $null
$serviceKeyPlain = $null
