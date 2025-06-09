# ==============================================================================
# MAKEFILE POUR SUIVI SANTÉ IA - NUXT 3 APPLICATION
# ==============================================================================
# Commandes simplifiées pour Docker et le développement
# ==============================================================================

# Variables
IMAGE_NAME=suivi-sante-nuxt
CONTAINER_NAME=suivi-sante-app
PORT=3000
VERSION=latest

# Couleurs pour les messages
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

.PHONY: help build run stop clean logs dev install test health status

# Commande par défaut
help: ## Afficher cette aide
	@echo "$(GREEN)Makefile pour Suivi Santé IA - Nuxt 3$(NC)"
	@echo "$(YELLOW)Commandes disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================================================
# COMMANDES DOCKER
# ==============================================================================

build: ## Construire l'image Docker
	@echo "$(GREEN)Construction de l'image Docker...$(NC)"
	docker build -t $(IMAGE_NAME):$(VERSION) .
	@echo "$(GREEN)✅ Image construite avec succès!$(NC)"

build-dev: ## Construire l'image Docker pour le développement
	@echo "$(GREEN)Construction de l'image Docker (dev)...$(NC)"
	docker build -t $(IMAGE_NAME):dev -f Dockerfile.dev . || echo "$(YELLOW)⚠️  Dockerfile.dev non trouvé, utilisation du Dockerfile principal$(NC)" && docker build -t $(IMAGE_NAME):dev .

run: ## Lancer le conteneur
	@echo "$(GREEN)Lancement du conteneur...$(NC)"
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):3000 \
		--env-file .env \
		$(IMAGE_NAME):$(VERSION)
	@echo "$(GREEN)✅ Conteneur lancé sur http://localhost:$(PORT)$(NC)"

run-dev: ## Lancer le conteneur en mode développement
	@echo "$(GREEN)Lancement du conteneur (dev)...$(NC)"
	docker run -d \
		--name $(CONTAINER_NAME)-dev \
		-p $(PORT):3000 \
		-v $(PWD):/app \
		-v /app/node_modules \
		--env-file .env \
		$(IMAGE_NAME):dev
	@echo "$(GREEN)✅ Conteneur dev lancé sur http://localhost:$(PORT)$(NC)"

stop: ## Arrêter le conteneur
	@echo "$(YELLOW)Arrêt du conteneur...$(NC)"
	docker stop $(CONTAINER_NAME) 2>/dev/null || true
	docker stop $(CONTAINER_NAME)-dev 2>/dev/null || true
	@echo "$(GREEN)✅ Conteneur arrêté$(NC)"

restart: stop run ## Redémarrer le conteneur

clean: ## Nettoyer les conteneurs et images
	@echo "$(YELLOW)Nettoyage des conteneurs et images...$(NC)"
	docker rm -f $(CONTAINER_NAME) 2>/dev/null || true
	docker rm -f $(CONTAINER_NAME)-dev 2>/dev/null || true
	docker rmi $(IMAGE_NAME):$(VERSION) 2>/dev/null || true
	docker rmi $(IMAGE_NAME):dev 2>/dev/null || true
	@echo "$(GREEN)✅ Nettoyage terminé$(NC)"

logs: ## Afficher les logs du conteneur
	@echo "$(GREEN)Logs du conteneur:$(NC)"
	docker logs -f $(CONTAINER_NAME) 2>/dev/null || docker logs -f $(CONTAINER_NAME)-dev

health: ## Vérifier la santé du conteneur
	@echo "$(GREEN)Vérification de la santé...$(NC)"
	@docker inspect --format='{{.State.Health.Status}}' $(CONTAINER_NAME) 2>/dev/null || echo "$(RED)Conteneur non trouvé$(NC)"

status: ## Afficher le statut du conteneur
	@echo "$(GREEN)Statut du conteneur:$(NC)"
	@docker ps --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ==============================================================================
# COMMANDES DE DÉVELOPPEMENT
# ==============================================================================

install: ## Installer les dépendances
	@echo "$(GREEN)Installation des dépendances...$(NC)"
	npm install
	@echo "$(GREEN)✅ Dépendances installées$(NC)"

dev: ## Lancer en mode développement local
	@echo "$(GREEN)Lancement en mode développement...$(NC)"
	npm run dev

build-local: ## Construire l'application localement
	@echo "$(GREEN)Construction de l'application...$(NC)"
	npm run build

test: ## Lancer les tests
	@echo "$(GREEN)Lancement des tests...$(NC)"
	npm test 2>/dev/null || echo "$(YELLOW)⚠️  Aucun test configuré$(NC)"

# ==============================================================================
# COMMANDES UTILITAIRES
# ==============================================================================

shell: ## Accéder au shell du conteneur
	@echo "$(GREEN)Accès au shell du conteneur...$(NC)"
	docker exec -it $(CONTAINER_NAME) sh || docker exec -it $(CONTAINER_NAME)-dev sh

inspect: ## Inspecter l'image Docker
	@echo "$(GREEN)Inspection de l'image:$(NC)"
	docker inspect $(IMAGE_NAME):$(VERSION)

size: ## Afficher la taille de l'image
	@echo "$(GREEN)Taille de l'image:$(NC)"
	docker images $(IMAGE_NAME):$(VERSION) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# ==============================================================================
# COMMANDES DOCKER COMPOSE
# ==============================================================================

up: ## Lancer avec docker-compose (si disponible)
	@if [ -f docker-compose.yml ]; then \
		echo "$(GREEN)Lancement avec docker-compose...$(NC)"; \
		docker-compose up -d; \
	else \
		echo "$(YELLOW)⚠️  docker-compose.yml non trouvé$(NC)"; \
	fi

down: ## Arrêter docker-compose
	@if [ -f docker-compose.yml ]; then \
		echo "$(YELLOW)Arrêt de docker-compose...$(NC)"; \
		docker-compose down; \
	else \
		echo "$(YELLOW)⚠️  docker-compose.yml non trouvé$(NC)"; \
	fi

# ==============================================================================
# COMMANDES DE MAINTENANCE
# ==============================================================================

prune: ## Nettoyer Docker (images, conteneurs, volumes inutilisés)
	@echo "$(YELLOW)Nettoyage complet de Docker...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✅ Nettoyage terminé$(NC)"

update: ## Mettre à jour l'image et redémarrer
	@echo "$(GREEN)Mise à jour de l'application...$(NC)"
	$(MAKE) stop
	$(MAKE) build
	$(MAKE) run
	@echo "$(GREEN)✅ Mise à jour terminée$(NC)"
