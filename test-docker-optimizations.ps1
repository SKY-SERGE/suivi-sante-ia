#!/usr/bin/env pwsh

# ==============================================================================
# SCRIPT DE TEST DES OPTIMISATIONS DOCKER - SUIVI SANTÉ IA
# ==============================================================================
# Teste les performances et la sécurité des configurations Docker optimisées
# ==============================================================================

param(
    [switch]$Production,
    [switch]$Development,
    [switch]$All,
    [switch]$SecurityScan,
    [switch]$PerformanceTest,
    [switch]$Clean
)

# Configuration
$ProjectRoot = $PSScriptRoot
$TestResults = "$ProjectRoot/docker-test-results"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Couleurs pour l'affichage
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }

# Fonction de nettoyage
function Invoke-Cleanup {
    Write-Info "Nettoyage des ressources Docker..."
    
    # Arrêt des conteneurs de test
    $containers = @(
        "suivi-sante-nuxt-test",
        "suivi-sante-redis-test",
        "suivi-sante-nginx-test"
    )
    
    foreach ($container in $containers) {
        docker stop $container 2>$null
        docker rm $container 2>$null
    }
    
    # Suppression des images de test
    docker rmi suivi-sante-test:latest 2>$null
    
    # Nettoyage des volumes de test
    docker volume prune -f 2>$null
    
    Write-Success "Nettoyage terminé"
}

# Fonction de test de performance
function Test-DockerPerformance {
    param($DockerfilePath, $TestName)
    
    Write-Info "Test de performance pour $TestName..."
    
    # Mesure du temps de build
    $buildStart = Get-Date
    $buildResult = docker build -f $DockerfilePath -t "suivi-sante-test:latest" . 2>&1
    $buildEnd = Get-Date
    $buildTime = ($buildEnd - $buildStart).TotalSeconds
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build réussi en $([math]::Round($buildTime, 2)) secondes"
        
        # Mesure de la taille de l'image
        $imageSize = docker images suivi-sante-test:latest --format "{{.Size}}" | Select-Object -First 1
        Write-Info "Taille de l'image: $imageSize"
        
        # Test de démarrage
        $startTime = Get-Date
        $containerId = docker run -d --name "suivi-sante-test-container" -p 3001:3000 suivi-sante-test:latest
        
        if ($containerId) {
            # Attendre que le conteneur soit prêt
            $maxWait = 60
            $waited = 0
            $ready = $false
            
            while ($waited -lt $maxWait -and -not $ready) {
                Start-Sleep -Seconds 2
                $waited += 2
                
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
                    if ($response.StatusCode -eq 200) {
                        $ready = $true
                        $startupTime = $waited
                        Write-Success "Application prête en $startupTime secondes"
                    }
                }
                catch {
                    # Continue à attendre
                }
            }
            
            if (-not $ready) {
                Write-Warning "Timeout lors du démarrage de l'application"
            }
            
            # Nettoyage du test
            docker stop $containerId 2>$null
            docker rm $containerId 2>$null
        }
        
        # Retourner les métriques
        return @{
            BuildTime = $buildTime
            ImageSize = $imageSize
            StartupTime = if ($ready) { $startupTime } else { $null }
            Success = $ready
        }
    }
    else {
        Write-Error "Échec du build pour $TestName"
        Write-Host $buildResult
        return $null
    }
}

# Fonction de test de sécurité
function Test-DockerSecurity {
    param($ImageName)
    
    Write-Info "Test de sécurité pour $ImageName..."
    
    # Vérification des vulnérabilités avec Docker Scout (si disponible)
    $scoutResult = docker scout cves $ImageName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Scan de sécurité Docker Scout terminé"
        return $scoutResult
    }
    else {
        Write-Warning "Docker Scout non disponible, test de sécurité basique..."
        
        # Tests de sécurité basiques
        $securityTests = @()
        
        # Vérifier que l'image utilise un utilisateur non-root
        $userCheck = docker run --rm $ImageName whoami 2>$null
        if ($userCheck -ne "root") {
            $securityTests += "✅ Utilisateur non-root: $userCheck"
        }
        else {
            $securityTests += "❌ L'image utilise l'utilisateur root"
        }
        
        # Vérifier les ports exposés
        $portCheck = docker inspect $ImageName | ConvertFrom-Json | Select-Object -ExpandProperty Config | Select-Object -ExpandProperty ExposedPorts
        if ($portCheck) {
            $securityTests += "ℹ️  Ports exposés: $($portCheck.PSObject.Properties.Name -join ', ')"
        }
        
        return $securityTests
    }
}

# Fonction principale de test
function Start-DockerTests {
    Write-Info "🐳 Démarrage des tests Docker optimisés"
    Write-Info "Timestamp: $Timestamp"
    
    # Créer le dossier de résultats
    if (-not (Test-Path $TestResults)) {
        New-Item -ItemType Directory -Path $TestResults | Out-Null
    }
    
    $results = @{
        Timestamp = $Timestamp
        Tests = @{}
    }
    
    try {
        # Test du Dockerfile de production optimisé
        if ($Production -or $All) {
            Write-Info "=== Test Dockerfile Production Optimisé ==="
            $prodResults = Test-DockerPerformance -DockerfilePath "Dockerfile.optimized" -TestName "Production"
            $results.Tests.Production = $prodResults
            
            if ($prodResults -and $SecurityScan) {
                $secResults = Test-DockerSecurity -ImageName "suivi-sante-test:latest"
                $results.Tests.ProductionSecurity = $secResults
            }
        }
        
        # Test du Dockerfile de développement optimisé
        if ($Development -or $All) {
            Write-Info "=== Test Dockerfile Développement Optimisé ==="
            $devResults = Test-DockerPerformance -DockerfilePath "Dockerfile.dev.optimized" -TestName "Développement"
            $results.Tests.Development = $devResults
        }
        
        # Comparaison avec les versions originales
        if ($All) {
            Write-Info "=== Comparaison avec les versions originales ==="
            
            # Test de la version originale
            if (Test-Path "Dockerfile") {
                $originalResults = Test-DockerPerformance -DockerfilePath "Dockerfile" -TestName "Original"
                $results.Tests.Original = $originalResults
                
                # Calcul des améliorations
                if ($originalResults -and $results.Tests.Production) {
                    $buildImprovement = [math]::Round((($originalResults.BuildTime - $results.Tests.Production.BuildTime) / $originalResults.BuildTime) * 100, 2)
                    Write-Info "Amélioration du temps de build: $buildImprovement%"
                    $results.Improvements = @{
                        BuildTime = $buildImprovement
                    }
                }
            }
        }
        
    }
    catch {
        Write-Error "Erreur lors des tests: $($_.Exception.Message)"
    }
    finally {
        # Nettoyage final
        Invoke-Cleanup
    }
    
    # Sauvegarde des résultats
    $resultsFile = "$TestResults/docker-test-results-$Timestamp.json"
    $results | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsFile -Encoding UTF8
    Write-Success "Résultats sauvegardés dans: $resultsFile"
    
    # Affichage du résumé
    Write-Info "=== RÉSUMÉ DES TESTS ==="
    foreach ($test in $results.Tests.GetEnumerator()) {
        if ($test.Value -and $test.Value.Success) {
            Write-Success "$($test.Key): ✅ Build: $([math]::Round($test.Value.BuildTime, 2))s, Taille: $($test.Value.ImageSize)"
        }
        else {
            Write-Error "$($test.Key): ❌ Échec"
        }
    }
    
    if ($results.Improvements) {
        Write-Success "Améliorations identifiées:"
        $results.Improvements.GetEnumerator() | ForEach-Object {
            Write-Info "  $($_.Key): $($_.Value)%"
        }
    }
}

# Point d'entrée principal
if ($Clean) {
    Invoke-Cleanup
    exit 0
}

if (-not ($Production -or $Development -or $All)) {
    Write-Info "Usage: ./test-docker-optimizations.ps1 [-Production] [-Development] [-All] [-SecurityScan] [-PerformanceTest] [-Clean]"
    Write-Info "  -Production: Teste le Dockerfile de production optimisé"
    Write-Info "  -Development: Teste le Dockerfile de développement optimisé"
    Write-Info "  -All: Teste toutes les configurations et compare avec l'original"
    Write-Info "  -SecurityScan: Inclut les tests de sécurité"
    Write-Info "  -PerformanceTest: Inclut les tests de performance avancés"
    Write-Info "  -Clean: Nettoie les ressources Docker de test"
    exit 1
}

# Démarrer les tests
Start-DockerTests
