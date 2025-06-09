# ==============================================================================
# SCRIPT DE DÉPLOIEMENT SCHÉMA SUPABASE - SUIVI SANTÉ IA
# ==============================================================================
# Ce script automatise le déploiement du schéma de base de données vers Supabase
# ==============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$SupabaseUrl = "",
    [Parameter(Mandatory=$false)]
    [string]$ServiceKey = "",
    [Parameter(Mandatory=$false)]
    [switch]$IncludeTestData = $false
)

# Variables
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
$SCHEMA_FILE = Join-Path $PROJECT_ROOT "database\schema.sql"
$TEST_DATA_FILE = Join-Path $PROJECT_ROOT "database\test_data.sql"
$ENV_FILE = Join-Path $PROJECT_ROOT "nuxt-app\.env"

# Couleurs pour les messages
$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"
$BLUE = "Blue"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $BLUE
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $GREEN
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $YELLOW
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $RED
}

function Load-EnvFile {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Info "Chargement des variables d'environnement depuis $FilePath"
        Get-Content $FilePath | ForEach-Object {
            if ($_ -and $_ -notmatch '^#' -and $_ -match '=') {
                $parts = $_ -split '=', 2
                if ($parts.Length -ge 2) {
                    $name = $parts[0].Trim()
                    $value = $parts[1].Trim()
                    # Supprimer les guillemets si présents
                    $value = $value.Replace('"', '').Replace("'", '')
                    Set-Variable -Name $name -Value $value -Scope Global
                }
            }
        }
        return $true
    }
    return $false
}

function Execute-SQLFile {
    param(
        [string]$FilePath,
        [string]$Url,
        [string]$Key,
        [string]$Description
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Error "Fichier non trouvé: $FilePath"
        return $false
    }
    
    Write-Info "Exécution de $Description..."
    
    try {
        $sqlContent = Get-Content $FilePath -Raw
        
        $headers = @{
            "apikey" = $Key
            "Authorization" = "Bearer $Key"
            "Content-Type" = "application/sql"
        }
        
        $response = Invoke-RestMethod -Uri "$Url/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $sqlContent
        
        Write-Success "$Description exécuté avec succès"
        return $true
    }
    catch {
        Write-Error "Erreur lors de l'exécution de $Description : $($_.Exception.Message)"
        return $false
    }
}

function Test-SupabaseConnection {
    param(
        [string]$Url,
        [string]$Key
    )
    
    Write-Info "Test de connexion à Supabase..."
    
    try {
        $headers = @{
            "apikey" = $Key
            "Authorization" = "Bearer $Key"
        }
        
        $testUrl = "$Url/rest/v1/"
        $response = Invoke-RestMethod -Uri $testUrl -Method GET -Headers $headers
        
        Write-Success "Connexion à Supabase réussie"
        return $true
    }
    catch {
        Write-Error "Impossible de se connecter à Supabase: $($_.Exception.Message)"
        return $false
    }
}

# ==============================================================================
# SCRIPT PRINCIPAL
# ==============================================================================

Write-Host "Déploiement du schéma Supabase - Suivi Santé IA" -ForegroundColor $GREEN
Write-Host "===============================================" -ForegroundColor $GREEN

# Charger les variables d'environnement si aucun paramètre fourni
if ([string]::IsNullOrEmpty($SupabaseUrl) -or [string]::IsNullOrEmpty($ServiceKey)) {
    Write-Info "Chargement de la configuration depuis les variables d'environnement..."
    
    if (Load-EnvFile $ENV_FILE) {
        if ([string]::IsNullOrEmpty($SupabaseUrl)) {
            $SupabaseUrl = $Global:NUXT_PUBLIC_SUPABASE_URL
        }
        # Note: Pour les opérations de schema, vous avez besoin de la service_role key
        # qui n'est pas dans le .env par sécurité
    }
}

# Validation des paramètres
if ([string]::IsNullOrEmpty($SupabaseUrl)) {
    Write-Error "URL Supabase manquante. Utilisez -SupabaseUrl ou configurez NUXT_PUBLIC_SUPABASE_URL"
    exit 1
}

if ([string]::IsNullOrEmpty($ServiceKey)) {
    Write-Error "Service Role Key manquante. Utilisez -ServiceKey avec votre clé service_role"
    Write-Warning "Attention: N'utilisez JAMAIS la service_role key côté client!"
    Write-Info "Trouvez votre service_role key dans: Supabase Dashboard > Settings > API > service_role key"
    exit 1
}

Write-Info "Configuration:"
Write-Host "  • URL Supabase: $SupabaseUrl" -ForegroundColor $BLUE
Write-Host "  • Schéma: $SCHEMA_FILE" -ForegroundColor $BLUE
Write-Host "  • Données de test: $(if ($IncludeTestData) { 'Incluses' } else { 'Exclues' })" -ForegroundColor $BLUE

# Test de connexion
if (-not (Test-SupabaseConnection $SupabaseUrl $ServiceKey)) {
    exit 1
}

# Vérifier l'existence des fichiers
if (-not (Test-Path $SCHEMA_FILE)) {
    Write-Error "Fichier de schéma non trouvé: $SCHEMA_FILE"
    exit 1
}

# Confirmation avant déploiement
Write-Warning "Cette opération va modifier la base de données Supabase!"
$confirmation = Read-Host "Continuer? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Info "Opération annulée"
    exit 0
}

# Déploiement du schéma principal
Write-Info "Déploiement du schéma principal..."
if (-not (Execute-SQLFile $SCHEMA_FILE $SupabaseUrl $ServiceKey "Schéma principal")) {
    Write-Error "Échec du déploiement du schéma"
    exit 1
}

# Déploiement des données de test si demandé
if ($IncludeTestData -and (Test-Path $TEST_DATA_FILE)) {
    Write-Info "Déploiement des données de test..."
    if (-not (Execute-SQLFile $TEST_DATA_FILE $SupabaseUrl $ServiceKey "Données de test")) {
        Write-Warning "Échec du déploiement des données de test (le schéma principal a été déployé)"
    }
}

Write-Success "Déploiement terminé avec succès!"
Write-Info "Vérifiez votre base de données dans le Dashboard Supabase"
