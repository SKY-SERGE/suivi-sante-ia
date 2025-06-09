# ==============================================================================
# MAKEFILE POUR SUIVI SANTÉ IA
# ==============================================================================
# Commandes utiles pour le développement et la production
# ==============================================================================

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
APP_NAME = suivi-sante-ia

# Couleurs pour l'affichage
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

.PHONY: help build dev prod stop clean logs status test

# ==============================================================================
# AIDE
# ==============================================================================
help: ## Afficher cette aide
	@echo "$(GREEN)Commandes disponibles pour $(APP_NAME):$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ==============================================================================
# DÉVELOPPEMENT
# ==============================================================================
dev: ## Démarrer l'environnement de développement
	@echo "$(GREEN)Démarrage de l'environnement de développement...$(NC)"
	$(DOCKER_COMPOSE_DEV) up --build -d
	@echo "$(GREEN)Application disponible sur http://localhost:3000$(NC)"
	@echo "$(GREEN)MailHog disponible sur http://localhost:8025$(NC)"

dev-logs: ## Afficher les logs de développement
	$(DOCKER_COMPOSE_DEV) logs -f

dev-stop: ## Arrêter l'environnement de développement
	@echo "$(YELLOW)Arrêt de l'environnement de développement...$(NC)"
	$(DOCKER_COMPOSE_DEV) down

dev-clean: ## Nettoyer l'environnement de développement
	@echo "$(RED)Nettoyage complet de l'environnement de développement...$(NC)"
	$(DOCKER_COMPOSE_DEV) down -v --remove-orphans
	docker system prune -f

# ==============================================================================
# PRODUCTION
# ==============================================================================
build: ## Construire les images Docker
	@echo "$(GREEN)Construction des images Docker...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache

prod: ## Démarrer l'environnement de production
	@echo "$(GREEN)Démarrage de l'environnement de production...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)Application disponible sur http://localhost:3000$(NC)"

prod-nginx: ## Démarrer avec NGINX
	@echo "$(GREEN)Démarrage avec NGINX...$(NC)"
	$(DOCKER_COMPOSE) --profile nginx up -d
	@echo "$(GREEN)Application disponible sur http://localhost$(NC)"

prod-logs: ## Afficher les logs de production
	$(DOCKER_COMPOSE) logs -f

prod-stop: ## Arrêter l'environnement de production
	@echo "$(YELLOW)Arrêt de l'environnement de production...$(NC)"
	$(DOCKER_COMPOSE) down

# ==============================================================================
# UTILITAIRES
# ==============================================================================
status: ## Afficher le statut des conteneurs
	@echo "$(GREEN)Statut des conteneurs:$(NC)"
	@echo "$(YELLOW)Production:$(NC)"
	$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "$(YELLOW)Développement:$(NC)"
	$(DOCKER_COMPOSE_DEV) ps

logs: ## Afficher tous les logs
	@echo "$(GREEN)Logs de production:$(NC)"
	$(DOCKER_COMPOSE) logs --tail=50
	@echo ""
	@echo "$(GREEN)Logs de développement:$(NC)"
	$(DOCKER_COMPOSE_DEV) logs --tail=50

restart: ## Redémarrer les services
	@echo "$(YELLOW)Redémarrage des services...$(NC)"
	$(DOCKER_COMPOSE) restart

# ==============================================================================
# BASE DE DONNÉES
# ==============================================================================
db-setup: ## Initialiser la base de données locale
	@echo "$(GREEN)Configuration de la base de données locale...$(NC)"
	$(DOCKER_COMPOSE) --profile local-db up postgres -d
	@echo "$(GREEN)Base de données disponible sur localhost:5432$(NC)"

db-reset: ## Réinitialiser la base de données locale
	@echo "$(RED)Réinitialisation de la base de données...$(NC)"
	$(DOCKER_COMPOSE) --profile local-db stop postgres
	docker volume rm suivi-sante-postgres-data || true
	$(DOCKER_COMPOSE) --profile local-db up postgres -d

db-deploy-supabase: ## Déployer le schéma vers Supabase Cloud
	@echo "$(GREEN)Déploiement du schéma vers Supabase...$(NC)"
	@powershell -ExecutionPolicy Bypass -File "./scripts/deploy-supabase-schema.ps1"

db-deploy-supabase-test: ## Déployer schéma + données de test vers Supabase
	@echo "$(GREEN)Déploiement du schéma et données de test vers Supabase...$(NC)"
	@powershell -ExecutionPolicy Bypass -File "./scripts/deploy-supabase-schema.ps1" -IncludeTestData

# ==============================================================================
# NETTOYAGE
# ==============================================================================
clean: ## Nettoyer les conteneurs et volumes
	@echo "$(RED)Nettoyage des conteneurs et volumes...$(NC)"
	$(DOCKER_COMPOSE) down -v --remove-orphans
	$(DOCKER_COMPOSE_DEV) down -v --remove-orphans
	docker system prune -f

clean-all: ## Nettoyage complet (ATTENTION: supprime tout!)
	@echo "$(RED)ATTENTION: Nettoyage complet de Docker!$(NC)"
	@echo "$(RED)Ceci supprimera TOUS les conteneurs, images et volumes Docker!$(NC)"
	@read -p "Êtes-vous sûr? (y/N) " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker system prune -a -f --volumes; \
		echo "$(GREEN)Nettoyage terminé.$(NC)"; \
	else \
		echo "$(YELLOW)Nettoyage annulé.$(NC)"; \
	fi

# ==============================================================================
# TESTS
# ==============================================================================
test: ## Exécuter les tests
	@echo "$(GREEN)Exécution des tests...$(NC)"
	$(DOCKER_COMPOSE_DEV) exec nuxt-dev npm test

test-e2e: ## Exécuter les tests end-to-end
	@echo "$(GREEN)Exécution des tests E2E...$(NC)"
	$(DOCKER_COMPOSE_DEV) exec nuxt-dev npm run test:e2e

# ==============================================================================
# MAINTENANCE
# ==============================================================================
backup: ## Sauvegarder les données
	@echo "$(GREEN)Sauvegarde des données...$(NC)"
	mkdir -p backups
	docker run --rm -v suivi-sante-postgres-data:/data -v $(PWD)/backups:/backup alpine tar czf /backup/postgres-$(shell date +%Y%m%d_%H%M%S).tar.gz -C /data .
	docker run --rm -v suivi-sante-redis-data:/data -v $(PWD)/backups:/backup alpine tar czf /backup/redis-$(shell date +%Y%m%d_%H%M%S).tar.gz -C /data .

update: ## Mettre à jour les images Docker
	@echo "$(GREEN)Mise à jour des images Docker...$(NC)"
	$(DOCKER_COMPOSE) pull
	$(DOCKER_COMPOSE_DEV) pull

# Par défaut, afficher l'aide
.DEFAULT_GOAL := help
