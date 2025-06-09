# ==============================================================================
# SCRIPT POWERSHELL POUR SUIVI SANTÉ IA - NUXT 3 APPLICATION
# ==============================================================================
# Commandes simplifiées pour Docker et le développement sur Windows
# ==============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$Command = "help"
)

# Variables
$IMAGE_NAME = "suivi-sante-nuxt"
$CONTAINER_NAME = "suivi-sante-app"
$PORT = "3000"
$VERSION = "latest"

# Couleurs pour les messages
$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"

function Show-Help {
    Write-Host "Script PowerShell pour Suivi Santé IA - Nuxt 3" -ForegroundColor $GREEN
    Write-Host "Commandes disponibles:" -ForegroundColor $YELLOW
    Write-Host "  build       - Construire l'image Docker" -ForegroundColor $GREEN
    Write-Host "  run         - Lancer le conteneur" -ForegroundColor $GREEN
    Write-Host "  stop        - Arrêter le conteneur" -ForegroundColor $GREEN
    Write-Host "  restart     - Redémarrer le conteneur" -ForegroundColor $GREEN
    Write-Host "  logs        - Afficher les logs du conteneur" -ForegroundColor $GREEN
    Write-Host "  status      - Afficher le statut du conteneur" -ForegroundColor $GREEN
    Write-Host "  clean       - Nettoyer les conteneurs et images" -ForegroundColor $GREEN
    Write-Host "  shell       - Accéder au shell du conteneur" -ForegroundColor $GREEN
    Write-Host "  dev         - Lancer en mode développement local" -ForegroundColor $GREEN
    Write-Host "  install     - Installer les dépendances" -ForegroundColor $GREEN
}

function Build-Image {
    Write-Host "Construction de l'image Docker..." -ForegroundColor $GREEN
    docker build -t "${IMAGE_NAME}:${VERSION}" .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Image construite avec succès!" -ForegroundColor $GREEN
    } else {
        Write-Host "❌ Erreur lors de la construction" -ForegroundColor $RED
    }
}

function Run-Container {
    Write-Host "Lancement du conteneur..." -ForegroundColor $GREEN
    docker run -d --name $CONTAINER_NAME -p "${PORT}:3000" --env-file .env "${IMAGE_NAME}:${VERSION}"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conteneur lancé sur http://localhost:${PORT}" -ForegroundColor $GREEN
    } else {
        Write-Host "❌ Erreur lors du lancement" -ForegroundColor $RED
    }
}

function Stop-Container {
    Write-Host "Arrêt du conteneur..." -ForegroundColor $YELLOW
    docker stop $CONTAINER_NAME 2>$null
    docker rm $CONTAINER_NAME 2>$null
    Write-Host "✅ Conteneur arrêté" -ForegroundColor $GREEN
}

function Restart-Container {
    Stop-Container
    Run-Container
}

function Show-Logs {
    Write-Host "Logs du conteneur:" -ForegroundColor $GREEN
    docker logs -f $CONTAINER_NAME
}

function Show-Status {
    Write-Host "Statut du conteneur:" -ForegroundColor $GREEN
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
}

function Clean-Docker {
    Write-Host "Nettoyage des conteneurs et images..." -ForegroundColor $YELLOW
    docker rm -f $CONTAINER_NAME 2>$null
    docker rmi "${IMAGE_NAME}:${VERSION}" 2>$null
    Write-Host "✅ Nettoyage terminé" -ForegroundColor $GREEN
}

function Access-Shell {
    Write-Host "Accès au shell du conteneur..." -ForegroundColor $GREEN
    docker exec -it $CONTAINER_NAME sh
}

function Start-Dev {
    Write-Host "Lancement en mode développement..." -ForegroundColor $GREEN
    npm run dev
}

function Install-Dependencies {
    Write-Host "Installation des dépendances..." -ForegroundColor $GREEN
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dépendances installées" -ForegroundColor $GREEN
    } else {
        Write-Host "❌ Erreur lors de l'installation" -ForegroundColor $RED
    }
}

# Exécution de la commande
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "build" { Build-Image }
    "run" { Run-Container }
    "stop" { Stop-Container }
    "restart" { Restart-Container }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "clean" { Clean-Docker }
    "shell" { Access-Shell }
    "dev" { Start-Dev }
    "install" { Install-Dependencies }
    default { 
        Write-Host "Commande inconnue: $Command" -ForegroundColor $RED
        Show-Help 
    }
}
