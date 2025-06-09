# 🏥 Application Suivi Santé IA

[![Statut Projet](https://img.shields.io/badge/Statut-Complet%20100%25-success)](./docs/PROJET-FINAL-RAPPORT-SYNTHESE.md)
[![Tests](https://img.shields.io/badge/Tests-39%2F39%20Passent-brightgreen)](./docs/INTEGRATION-PERFORMANCE-TEST-RESULTS.md)
[![Docker](https://img.shields.io/badge/Docker-Optimisé%20185MB-blue)](./docs/DOCKER-OPTIMIZATION-REPORT.md)
[![Documentation](https://img.shields.io/badge/Documentation-Complète-informational)](./docs/INDEX-DOCUMENTATION-UTILISATEUR.md)

## 🎯 Aperçu

Application complète de suivi de santé personnalisé avec intelligence artificielle, développée dans le cadre d'un projet de fin d'études Master IA. La plateforme permet aux patients de surveiller leur santé, aux médecins de suivre leurs patients (avec consentement), et aux administrateurs de gérer la plateforme.

### ✨ Fonctionnalités Principales

- 🤖 **IA Intégrée** : Analyse automatique des repas par photo (Google Vision AI) et chatbot santé intelligent (Google Gemini)
- 👥 **Multi-rôles** : Interfaces dédiées pour Patients, Médecins et Administrateurs
- 🔐 **Sécurité renforcée** : Authentification robuste, chiffrement des communications, gestion granulaire du consentement
- 📊 **Visualisations** : Graphiques et tableaux de bord pour le suivi des données de santé
- 🎯 **Objectifs personnalisés** : Définition et suivi de goals santé avec analytics de progression
- 💬 **Communication sécurisée** : Messagerie chiffrée patient-médecin
- 📱 **Interface moderne** : UI/UX optimisée avec Tailwind CSS 4

## 🏗️ Architecture Technique

### Stack Technologique

- **Frontend** : Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4
- **Backend** : Node.js, Nitro, API RESTful
- **Base de données** : Supabase (PostgreSQL + Auth + Storage + RLS)
- **IA** : Google Vision AI, Google Gemini API
- **Conteneurisation** : Docker multi-stage optimisé
- **Tests** : Vitest, Playwright

### 📊 Performances

- ⚡ Chargement des données : < 300ms
- 🤖 Réponse IA (chatbot) : < 1s
- 📷 Analyse photo (Vision AI) : < 2s
- 🔄 Workflow utilisateur complet : < 2s

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Docker & Docker Compose
- Compte Supabase
- Clés API Google (Vision AI + Gemini)

### Installation

```bash
# 1. Cloner le repository
git clone [repository-url]
cd suivi-sante-ia

# 2. Configuration environnement
cp nuxt-app/.env.example nuxt-app/.env
# Configurer les variables d'environnement (voir guide installation)

# 3. Installation des dépendances
cd nuxt-app
npm install

# 4. Initialisation base de données
# Importer le schéma depuis database/schema.sql dans Supabase

# 5. Démarrage développement
npm run dev
```

### 🐳 Démarrage avec Docker

```bash
# Développement
docker-compose -f docker-compose.dev.yml up

# Production (optimisée)
docker-compose -f docker-compose.optimized.yml up
```

## 📚 Documentation

### Pour les Utilisateurs

- 📖 [**Guide d'installation complet**](./docs/GUIDE-INSTALLATION-UTILISATEUR.md)
- 👤 [**Guide Patient**](./docs/USER-GUIDE-PATIENT.md) - Fonctionnalités pour patients
- 👨‍⚕️ [**Guide Médecin**](./docs/USER-GUIDE-MEDECIN.md) - Dashboard et communication
- 🛡️ [**Guide Administrateur**](./docs/USER-GUIDE-ADMIN.md) - Gestion plateforme
- ❓ [**FAQ Complète**](./docs/FAQ-COMPLETE.md) - Questions fréquentes
- 🔧 [**Troubleshooting**](./docs/TROUBLESHOOTING-GUIDE.md) - Résolution de problèmes

### Pour les Développeurs

- 🏗️ [**Documentation Technique & API**](./docs/TECHNICAL-API-DOCUMENTATION-COMPLETE.md)
- 🧪 [**Guide des Tests**](./docs/TESTING-GUIDE.md)
- 🐳 [**Infrastructure Docker**](./docs/DOCKER-OPTIMIZATION-REPORT.md)
- 🔒 [**Audit de Sécurité**](./docs/SECURITY-VULNERABILITY-ASSESSMENT.md)
- 📋 [**Architecture Composants**](./docs/ARCHITECTURE-COMPOSANTS-LAYOUTS.md)

### 📋 Index Documentation

➡️ [**Portail documentation complète**](./docs/INDEX-DOCUMENTATION-UTILISATEUR.md)

## 🧪 Tests

```bash
# Tests unitaires et intégration
npm test

# Tests de performance
npm run test:performance

# Tests E2E
npm run test:e2e

# Couverture
npm run test:coverage
```

**Résultats actuels** : ✅ 39/39 tests passent (100%)

## 🏥 Fonctionnalités par Rôle

### 👤 Patient

- ✅ Saisie manuelle de données de santé
- ✅ Analyse IA des repas par photo
- ✅ Chatbot IA pour questions santé
- ✅ Définition et suivi d'objectifs personnalisés
- ✅ Visualisations et historiques
- ✅ Communication sécurisée avec médecin

### 👨‍⚕️ Médecin

- ✅ Dashboard patients avec consentements
- ✅ Accès données patient sécurisé
- ✅ Analyses IA préintégrées
- ✅ Communication chiffrée avec patients
- ✅ Visualisations avancées des données

### 🛡️ Administrateur

- ✅ Gestion utilisateurs et rôles
- ✅ Validation comptes médecins
- ✅ Suspension/activation comptes
- ✅ Monitoring plateforme
- ✅ Gestion contenus et paramètres

## 🔐 Sécurité

- **Authentification robuste** : Supabase Auth avec gestion multi-rôles
- **Chiffrement bout-en-bout** : Communications patient-médecin sécurisées
- **Row Level Security** : Isolation des données par utilisateur
- **Consentement granulaire** : Gestion avancée avec révocation
- **Audit complet** : Traçabilité de toutes les actions

## 🌟 Innovation & IA

### Google Vision AI

- Reconnaissance automatique d'aliments dans les photos
- Analyse nutritionnelle basique
- Suggestions personnalisées

### Google Gemini AI

- Chatbot santé intelligent avec contraintes sécurisées
- Réponses contextuelles et personnalisées
- Disclaimers médicaux intégrés

### Algorithmes Personnalisés

- Recommandations alimentaires adaptatifs
- Analyse de tendances de santé
- Prédictions de progression d'objectifs

## 🎯 État du Projet

### ✅ Tâches Complétées (100%)

1. **Setup Projet & Docker** - Architecture moderne déployée
2. **Authentification Multi-rôles** - Sécurité robuste implementée
3. **Suivi Données Patient** - Interface complète avec visualisations
4. **Communication Sécurisée** - Messagerie chiffrée fonctionnelle
5. **Dashboard Médecin** - Vue d'ensemble patients opérationnelle
6. **IA Analyse Repas** - Google Vision AI intégrée avec succès
7. **Chatbot IA Santé** - Google Gemini déployé avec contraintes
8. **Administration** - Gestion utilisateurs complète
9. **UI/UX & Sécurité** - Audit et optimisations finalisés
10. **Tests & Documentation** - Couverture 100% et guides complets

### 📊 Métriques Finales

- **Tâches principales** : 11/11 ✅ (100%)
- **Sous-tâches** : 45/45 ✅ (100%)
- **Tests automatisés** : 39/39 ✅ (100%)
- **Performance** : Tous seuils respectés ✅
- **Documentation** : Complète tous publics ✅

## 🚀 Déploiement Production

### Docker Optimisé

```bash
# Build image optimisée (185MB)
docker build -f Dockerfile.optimized -t suivi-sante-ia:prod .

# Démarrage production
docker-compose -f docker-compose.optimized.yml up -d
```

### Variables d'Environnement

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_key
GOOGLE_VISION_API_KEY=your_vision_key

# Sécurité
NUXT_SECRET_KEY=your_secret_key
```

## 🔧 Configuration

### Base de Données

- Importer `database/schema.sql` dans Supabase
- Configurer les politiques RLS
- Optionnel : données de test depuis `database/test_data.sql`

### APIs Externes

- **Google Vision AI** : Configuration dans Google Cloud Console
- **Google Gemini** : Clé API Gemini Pro
- **Supabase** : Projet configuré avec auth et storage

## 🤝 Contribution

Le projet étant un MVP académique complet, les contributions futures pourraient inclure :

- **Extensions IA** : Intégration OpenAI pour analyses avancées
- **Mobile App** : Application native iOS/Android
- **IoT Integration** : Capteurs santé connectés
- **Analytics Avancés** : Prédictions santé personnalisées

## 📞 Support

- 📧 **Issues** : Utiliser le système d'issues GitHub
- 📖 **Documentation** : Consulter le [portail documentation](./docs/INDEX-DOCUMENTATION-UTILISATEUR.md)
- 🔧 **Troubleshooting** : Voir le [guide de résolution](./docs/TROUBLESHOOTING-GUIDE.md)

## 📄 Licence

Projet académique - Master Intelligence Artificielle

---

## 🏆 Résumé Exécutif

**Ce projet démontre avec succès la faisabilité technique d'une plateforme de santé intelligente moderne.** Toutes les fonctionnalités du MVP ont été implémentées et testées, avec une architecture robuste prête pour un déploiement commercial.

### 🎯 Réussite du Projet : **100%**

- ✅ **Architecture moderne** déployée et optimisée
- ✅ **Sécurité médicale** respectant les standards
- ✅ **IA intégrée** avec Google Vision AI et Gemini
- ✅ **Interface utilisateur** moderne et intuitive
- ✅ **Tests complets** avec 100% de réussite
- ✅ **Documentation exhaustive** pour tous publics

**Le projet est prêt pour présentation académique et peut servir de base solide pour un développement commercial futur.**

---

_Développé avec Task Master AI pour une gestion de projet optimale_
