# 📚 Documentation Technique - Suivi Santé IA

## Vue d'ensemble

Ce répertoire contient la documentation technique complète pour l'application **Suivi Santé IA**, une plateforme de suivi nutritionnel alimentée par l'intelligence artificielle.

## 📋 Index de la documentation

### 🏗️ Architecture et Conception

- **[Architecture Technique](./TECHNICAL-ARCHITECTURE.md)** - Vue d'ensemble complète de l'architecture système, patterns et technologies utilisées
- **[Architecture Composants & Layouts](./ARCHITECTURE-COMPOSANTS-LAYOUTS.md)** - Structure détaillée des composants Vue et layouts Nuxt

### 🔌 API et Intégration

- **[Documentation API Technique](./TECHNICAL-API-DOCUMENTATION.md)** - Documentation complète de tous les endpoints API, authentification, sécurité et formats de données
- **[Guide d'Intégration Développeur](./DEVELOPER-INTEGRATION-GUIDE.md)** - Guide pratique pour les développeurs : installation, configuration, exemples d'utilisation

### 🐳 Infrastructure et Déploiement

- **[Documentation Docker](./DOCKER-INFRASTRUCTURE.md)** - Configuration Docker complète pour développement et production
- **[Rapport d'Optimisation Docker](./DOCKER-OPTIMIZATION-REPORT.md)** - Optimisations avancées des conteneurs pour la production

### 🧪 Tests et Qualité

- **[Guide de Tests](./TESTING-GUIDE.md)** - Stratégie de test complète et exemples
- **[Résultats Tests Intégration/Performance](./INTEGRATION-PERFORMANCE-TEST-RESULTS.md)** - Rapports détaillés des tests système
- **[Rapport Corrections Tests](./TEST-FIXES-TASK-10-1.md)** - Documentation des corrections apportées aux tests

### 🔒 Sécurité

- **[Évaluation Vulnérabilités](./SECURITY-VULNERABILITY-ASSESSMENT.md)** - Analyse complète des risques de sécurité
- **[Implémentation Correctifs Sécurité](./SECURITY-REMEDIATION-IMPLEMENTATION.md)** - Mesures de sécurité mises en place
- **[Rapport Tests Sécurité](./SECURITY-TEST-REPORT.md)** - Résultats des tests de sécurité
- **[Sécurité Messagerie](./SECURITY-MESSAGING.md)** - Sécurisation du système de messagerie

### 🤖 Intelligence Artificielle

- **[Documentation Chatbot Santé IA](./CHATBOT-SANTE-IA-DOCUMENTATION.md)** - Configuration et utilisation du chatbot
- **[Intégration Google Vision AI](./GOOGLE-VISION-AI-INTEGRATION.md)** - Analyse d'images de repas
- **[Implémentation Analyse Photos Repas](./MEAL-PHOTO-ANALYSIS-IMPLEMENTATION.md)** - Système complet d'analyse nutritionnelle
- **[Analyse et Recommandations IA](./MEAL-AI-ANALYSIS-RECOMMENDATIONS-IMPLEMENTATION.md)** - Moteur de recommandations personnalisées

### 🚀 Développement et Contribution

- **[Guide de Contribution](./CONTRIBUTING-GUIDE.md)** - Comment contribuer et ajouter de nouvelles fonctionnalités
- **[Guide de Déploiement](./DEPLOYMENT-GUIDE.md)** - Procédures de déploiement en production
- **[Guide d'Optimisation Performance](./PERFORMANCE-OPTIMIZATION-GUIDE.md)** - Bonnes pratiques et optimisations de performance
- **[Guide de Dépannage Technique](./TROUBLESHOOTING-GUIDE.md)** - Solutions aux problèmes techniques courants

### 👥 Documentation Utilisateur

- **[Index Documentation Utilisateur](./README-USER.md)** - Index principal de toute la documentation utilisateur
- **[Guide de Démarrage Rapide](./USER-QUICK-START.md)** - Démarrage rapide pour tous les nouveaux utilisateurs
- **[Guide Utilisateur Patient](./USER-GUIDE-PATIENT.md)** - Guide complet pour les patients
- **[Guide Utilisateur Médecin](./USER-GUIDE-DOCTOR.md)** - Guide complet pour les médecins
- **[Guide Utilisateur Administrateur](./USER-GUIDE-ADMIN.md)** - Guide complet pour les administrateurs
- **[FAQ Utilisateurs](./USER-FAQ.md)** - Questions fréquemment posées par tous les utilisateurs

### 🎨 Interface Utilisateur

- **[Rapport Audit UI/UX](./UI-UX-AUDIT-REPORT.md)** - Analyse de l'expérience utilisateur
- **[Guide Standardisation UI/UX](./UI-UX-STANDARDIZATION-GUIDE.md)** - Standards et bonnes pratiques interface
- **[Analyse Flux Utilisateur](./USER-FLOW-ANALYSIS.md)** - Optimisation des parcours utilisateur
- **[Rapport Optimisation Flux](./USER-FLOW-OPTIMIZATION-REPORT.md)** - Améliorations apportées
- **[Implémentation Optimisations](./USER-FLOW-OPTIMIZATION-IMPLEMENTATION.md)** - Détails techniques des optimisations

### ♿ Accessibilité

- **[Rapport Audit Accessibilité](./ACCESSIBILITY-AUDIT-REPORT.md)** - Évaluation conformité RGAA/WCAG
- **[Améliorations Accessibilité](./ACCESSIBILITY-IMPROVEMENTS-UPDATE.md)** - Mise à jour des améliorations

### 👨‍⚕️ Fonctionnalités Métier

- **[Implémentation Dashboard Médecin](./DOCTOR-DASHBOARD-IMPLEMENTATION.md)** - Interface de gestion pour les professionnels
- **[Gestion Utilisateurs Admin](./ADMIN-USER-MANAGEMENT-IMPLEMENTATION.md)** - Système d'administration

### 🔧 Résolution de Problèmes

- **[Résolution Erreur Auth](./RESOLUTION-AUTH-ERROR.md)** - Correction des problèmes d'authentification
- **[Résolution Plugins Toast](./RESOLUTION-PLUGINS-TOAST.md)** - Corrections notifications
- **[Correction Politique RLS](./RESOLUTION-RLS-POLICY-FIX.md)** - Sécurité base de données

### 📊 Rapports de Synthèse

- **[Rapport Finalisation Tâche 9](./TASK-9-COMPLETION-REPORT.md)** - Rapport de fin de développement core
- **[Synthèse Finale Tâche 9](./TASK-9-FINAL-SYNTHESIS-REPORT.md)** - Synthèse complète du projet

---

## 🚀 Démarrage Rapide

### Prérequis Système

- **Node.js** 20+
- **Docker** et Docker Compose
- **Compte Supabase** configuré
- **Clés API Google** (AI + Vision)

### Installation Express

```bash
# 1. Cloner le projet
git clone https://github.com/your-org/suivi-sante-ia.git
cd suivi-sante-ia

# 2. Configuration environnement
cp nuxt-app/.env.example nuxt-app/.env
# Éditer .env avec vos clés API

# 3. Démarrage avec Docker (recommandé)
docker-compose -f docker-compose.dev.yml up -d

# OU démarrage manuel
cd nuxt-app
npm install
npm run dev
```

### Variables d'environnement essentielles

```env
# Google AI
GOOGLE_AI_API_KEY=your_gemini_api_key
GOOGLE_VISION_API_KEY=your_vision_api_key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Sécurité
CSRF_SECRET=your_csrf_secret_key
```

---

## 🏗️ Architecture Technique

### Stack Technologique

| Couche               | Technologies                                    |
| -------------------- | ----------------------------------------------- |
| **Frontend**         | Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4       |
| **Backend**          | Nitro Server, Node.js 20+                       |
| **Base de données**  | PostgreSQL (Supabase)                           |
| **Authentification** | Supabase Auth (JWT)                             |
| **IA**               | Google Generative AI (Gemini), Google Vision AI |
| **Conteneurisation** | Docker, Docker Compose                          |
| **Tests**            | Vitest, Playwright, Testing Library             |

### Composables Principales

```typescript
// Authentification
const { user, signIn, signOut } = useAuth();

// Gestion des repas
const { meals, saveMeal, loadMeals } = useMeals();

// Analyse d'images
const { analyzeMealImage } = useGoogleVisionAI();

// Chatbot santé
const { sendMessage, conversationHistory } = useHealthChatbot();

// Recommandations IA
const { generateRecommendations } = useGoogleGenerativeAI();
```

---

## 🔌 API Endpoints

### Authentification

- `GET /api/auth/csrf-token` - Génération token CSRF

### Intelligence Artificielle

- `POST /api/vision/analyze-meal` - Analyse d'image de repas
- `POST /api/ai/health-chat` - Chatbot santé
- `POST /api/ai/generate-recommendations` - Recommandations personnalisées
- `POST /api/ai/explain-meal` - Explication nutritionnelle

### Exemples d'utilisation

```typescript
// Analyse d'image
const formData = new FormData();
formData.append("image", file);

const response = await $fetch("/api/vision/analyze-meal", {
  method: "POST",
  headers: { "x-csrf-token": csrfToken },
  body: formData,
});

// Chatbot
const chatResponse = await $fetch("/api/ai/health-chat", {
  method: "POST",
  headers: { "x-csrf-token": csrfToken },
  body: {
    message: "J'ai des questions sur mon alimentation",
    conversationHistory: [],
  },
});
```

---

## 🧪 Tests et Qualité

### Couverture de Tests

- **Tests unitaires** : 95%+ (Composables, utilitaires)
- **Tests intégration** : 90%+ (API endpoints, workflows)
- **Tests E2E** : 100% (Workflows critiques)
- **Tests performance** : Benchmarks complets

### Exécution des Tests

```bash
# Tests complets
npm run test

# Tests spécifiques
npm run test:unit          # Tests unitaires
npm run test:integration   # Tests d'intégration
npm run test:e2e          # Tests end-to-end
npm run test:performance  # Tests de performance

# Couverture
npm run test:coverage
```

---

## 🔒 Sécurité

### Mesures Implémentées

- ✅ **Protection CSRF** : Tokens pour toutes les mutations
- ✅ **Rate Limiting** : Limitation requêtes par IP
- ✅ **Validation stricte** : Sanitisation des entrées
- ✅ **Upload sécurisé** : Validation MIME types et taille
- ✅ **Headers sécurité** : CSP, HSTS, X-Frame-Options
- ✅ **RLS Supabase** : Isolation données utilisateurs
- ✅ **Logging sécurité** : Traçabilité des événements

### Conformité

- **RGPD** : Gestion consentements et données personnelles
- **WCAG 2.1 AA** : Accessibilité niveau conforme
- **OWASP Top 10** : Protection contre vulnérabilités majeures

---

## 🐳 Déploiement

### Environnements

```bash
# Développement
docker-compose -f docker-compose.dev.yml up

# Production (optimisé)
docker-compose -f docker-compose.optimized.yml up
```

### Images Docker optimisées

- **Image production** : 185MB (multi-stage, non-root)
- **Health checks** : Surveillance automatique
- **Sécurité** : Utilisateur non-privilégié
- **Performance** : Cache optimisé

---

## 📊 Monitoring et Performance

### Métriques Surveillées

- **Performance** : TTFB < 200ms, LCP < 2.5s
- **Disponibilité** : Health checks toutes les 30s
- **Utilisation** : CPU, mémoire, requêtes/sec
- **Business** : Utilisateurs actifs, taux conversion

### Logs Structurés

```json
{
  "level": "info",
  "message": "API request successful",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "context": {
    "endpoint": "/api/ai/health-chat",
    "responseTime": 150,
    "userId": "uuid"
  }
}
```

---

## 🤝 Contribution

### Guidelines de Développement

1. **Code Quality** : ESLint + Prettier configurés
2. **Tests** : Couverture minimale 80%
3. **Documentation** : Commentaires JSDoc obligatoires
4. **Security** : Review de sécurité pour chaque PR
5. **Performance** : Benchmarks avant merge

### Workflow Git

```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développer avec tests
npm run test:watch

# Commit avec messages conventionnels
git commit -m "feat: ajouter analyse nutritionnelle avancée"

# Push et créer PR
git push origin feature/nouvelle-fonctionnalite
```

---

## 🆘 Support et Dépannage

### Problèmes Courants

#### Erreur "CSRF token invalid"

```bash
# Vérifier la configuration
curl -X GET http://localhost:3000/api/auth/csrf-token
```

#### Docker ne démarre pas

```bash
# Nettoyer les containers
docker-compose down
docker system prune -f
docker-compose up --build
```

#### Tests qui échouent

```bash
# Reset de la base de test
npm run test:reset
npm run test
```

### Logs de Debug

```bash
# Mode debug complet
DEBUG=* npm run dev

# Logs spécifiques
DEBUG=nuxt:* npm run dev
```

---

## 📞 Contact

- **Documentation** : Consultez ce répertoire `/docs`
- **Issues** : [GitHub Issues](https://github.com/your-org/suivi-sante-ia/issues)
- **Support technique** : support@suivi-sante-ia.com
- **Sécurité** : security@suivi-sante-ia.com

---

## 📝 Changelog

### Version 1.0.0 (2024-01-15)

- ✅ Architecture Nuxt 4 complète
- ✅ Intégration Google AI (Gemini + Vision)
- ✅ Système d'authentification Supabase
- ✅ Interface utilisateur responsive
- ✅ Tests complets (unit, integration, e2e)
- ✅ Sécurité renforcée (CSRF, rate limiting, RLS)
- ✅ Optimisations Docker production
- ✅ Documentation technique complète

---

_Documentation maintenue à jour le 2024-01-15_

> 💡 **Conseil** : Commencez par lire l'[Architecture Technique](./TECHNICAL-ARCHITECTURE.md) pour une compréhension globale, puis consultez l'[API Documentation](./TECHNICAL-API-DOCUMENTATION.md) et le [Guide d'Intégration](./DEVELOPER-INTEGRATION-GUIDE.md) selon vos besoins.
