# Script PowerShell automatisé pour appliquer les migrations RLS
# Date: 2025-06-18
# Ce script utilise les variables d'environnement existantes de Nuxt pour construire l'URL de DB

Write-Host "=== Application automatisée des migrations pour corriger les politiques RLS ===" -ForegroundColor Green

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
        Write-Host "  $name = $value" -ForegroundColor Gray
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

# Construire l'URL de connexion PostgreSQL
# Format: postgresql://postgres:[PASSWORD]@[HOST]/postgres
$urlPattern = "https://([^.]+)\.supabase\.co"
if ($supabaseUrl -match $urlPattern) {
    $project = $matches[1]
    $dbHost = "$project.supabase.co"
    
    # Demander le mot de passe de la base de données
    Write-Host "Pour appliquer les migrations, nous avons besoin du mot de passe de votre base de données Supabase." -ForegroundColor Yellow
    Write-Host "Vous pouvez le trouver dans votre dashboard Supabase > Settings > Database > Connection string" -ForegroundColor Gray
    $dbPassword = Read-Host "Mot de passe de la base de données Supabase" -AsSecureString
    $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
    
    $dbUrl = "postgresql://postgres:$dbPasswordPlain@$dbHost/postgres"
} else {
    Write-Host "Erreur: Format URL Supabase non reconnu: $supabaseUrl" -ForegroundColor Red
    exit 1
}

Write-Host "Connexion à la base de données: $dbHost" -ForegroundColor Cyan

# Vérifier que psql est disponible
try {
    $null = Get-Command psql -ErrorAction Stop
} catch {
    Write-Host "Erreur: psql n'est pas installé ou pas accessible" -ForegroundColor Red
    Write-Host "Veuillez installer PostgreSQL client tools" -ForegroundColor Yellow
    exit 1
}

# Appliquer les migrations
Write-Host "1. Application de la migration pour corriger les politiques RLS..." -ForegroundColor Cyan
try {
    $result = & psql $dbUrl -f "database/migrations/fix_users_rls_policies.sql" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Sortie psql: $result" -ForegroundColor Red
        throw "Erreur lors de l'application de la migration RLS"
    }
    Write-Host "✓ Migration RLS appliquée avec succès" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'application de la migration RLS: $_" -ForegroundColor Red
    exit 1
}

Write-Host "2. Application de la migration pour créer la fonction RPC..." -ForegroundColor Cyan
try {
    $result = & psql $dbUrl -f "database/migrations/create_user_profile_function.sql" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Sortie psql: $result" -ForegroundColor Red
        throw "Erreur lors de l'application de la migration RPC"
    }
    Write-Host "✓ Migration RPC appliquée avec succès" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'application de la migration RPC: $_" -ForegroundColor Red
    exit 1
}

Write-Host "3. Vérification des politiques appliquées..." -ForegroundColor Cyan
& psql $dbUrl -c "SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'users';"

Write-Host "4. Vérification de la fonction RPC créée..." -ForegroundColor Cyan
& psql $dbUrl -c "SELECT routine_name, routine_type, specific_name FROM information_schema.routines WHERE routine_name = 'create_user_profile';"

Write-Host "=== Migrations appliquées avec succès ===" -ForegroundColor Green
Write-Host "Vous pouvez maintenant tester la création de profil dans votre application." -ForegroundColor Yellow
