# Chatbot Santé IA - Documentation Technique

## Vue d'ensemble

Le chatbot santé IA est un assistant virtuel intégré dans l'application Suivi Santé IA qui fournit des informations générales sur la santé en utilisant l'API Google Generative AI (Gemini) avec des prompts contraints et des mesures de sécurité strictes.

## Fonctionnalités Principales

### 1. Interface Utilisateur

- **Interface conversationnelle** : Chat en temps réel avec historique des messages
- **Design responsive** : Compatible mobile et desktop
- **Composants UI** : Utilise Shadcn Vue pour un design cohérent
- **Accessibilité** : Support clavier, ARIA labels, contraste élevé

### 2. Intégration IA Sécurisée

#### API Google Generative AI

- **Modèle** : Google Gemini Pro avec prompts contraints
- **Sécurité** : Prompts système pour limiter les réponses médicales directes
- **Fallback** : Simulation intelligente si pas de clé API

#### Contraintes et Limitations

- **Détection d'urgence** : Reconnaissance automatique des mots-clés d'urgence
- **Contenu interdit** : Blocage des demandes de diagnostic ou prescription
- **Limite d'utilisation** : Protection contre l'usage excessif (20 conversations/jour)
- **Validation des réponses** : Vérification du contenu inapproprié

### 3. Gestion des Disclaimers

#### Modal de Disclaimer Détaillé

- **Consentement obligatoire** : L'utilisateur doit accepter avant d'utiliser
- **Informations complètes** : Limitations techniques, situations d'urgence, confidentialité
- **Persistance** : Sauvegarde du consentement en localStorage
- **Accessibility** : Modal accessible avec gestion du focus

#### Disclaimers Permanents

- **Banner persistant** : Rappel constant des limitations
- **Messages contextuels** : Disclaimers adaptés au type de réponse
- **Actions suggérées** : Redirection vers professionnels de santé

### 4. Détection et Gestion des Urgences

#### Détection Automatique

```typescript
const emergencyKeywords = [
  "urgence",
  "emergency",
  "douleur intense",
  "crise cardiaque",
  "difficulté à respirer",
  "saignement abondant",
  "perte de conscience",
  "overdose",
  "suicide",
  "empoisonnement",
  "convulsion",
  "avc",
];
```

#### Réponse d'Urgence

- **Message immédiat** : Alerte avec numéros d'urgence (15, 112)
- **Actions suggérées** : Boutons pour contacter les services d'urgence
- **Priorité absolue** : Bypass de l'IA pour réponse immédiate

### 5. Protection Contre les Conseils Médicaux

#### Contenu Interdit

```typescript
const prohibitedKeywords = [
  "diagnostiquer",
  "prescrire",
  "traitement pour",
  "médicament pour",
  "dose de",
  "arrêter le traitement",
  "remplacer le médicament",
  "automédication",
  "opération chirurgicale",
];
```

#### Validation des Réponses

- **Filtrage automatique** : Détection de conseil médical direct
- **Réponses sécurisées** : Redirection vers professionnels
- **Messages d'avertissement** : Explication des limitations

## Architecture Technique

### Composants Principaux

#### 1. `useHealthChatbot.ts` - Composable Principal

```typescript
interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "warning" | "emergency";
  suggestedActions?: readonly string[];
  isVerified?: boolean;
}
```

**Fonctions clés :**

- `sendMessage()` : Envoi et traitement des messages
- `detectEmergency()` : Détection des situations d'urgence
- `detectProhibitedContent()` : Validation du contenu interdit
- `checkUsageLimits()` : Vérification des limites d'utilisation

#### 2. `HealthChatbot.vue` - Composant UI

- **Gestion d'état** : Réactivité Vue 3 avec Composition API
- **Interface** : Chat responsive avec Tailwind CSS
- **Intégration modal** : Disclaimer obligatoire au premier usage

#### 3. `HealthDisclaimerModal.vue` - Modal de Consentement

- **Informations détaillées** : Limitations, urgences, confidentialité
- **Consentement éclairé** : Checkbox obligatoire pour continuer
- **Sauvegarde** : Persistance du consentement utilisateur

#### 4. `/api/ai/health-chat.post.ts` - API Serveur

- **Intégration Google AI** : Appel sécurisé à l'API Gemini
- **Prompt Engineering** : Contraintes strictes pour la santé
- **Gestion d'erreurs** : Fallback et validation

### Sécurité et Conformité

#### Protection des Données

- **Chiffrement** : Communications HTTPS
- **Pas de stockage médical** : Aucune donnée médicale persistante
- **Consentement** : Acceptation explicite des conditions

#### Conformité Réglementaire

- **RGPD** : Respect de la vie privée
- **Recommandations médicales** : Conformité aux bonnes pratiques
- **Responsabilité limitée** : Disclaimers clairs

## Configuration et Déploiement

### Variables d'Environnement

```env
# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### Installation

```bash
# Installation des dépendances
npm install @google/generative-ai

# Démarrage en développement
npm run dev
```

### Tests Recommandés

#### 1. Tests Fonctionnels

- ✅ Envoi de messages normaux
- ✅ Détection d'urgence
- ✅ Blocage de contenu interdit
- ✅ Affichage des disclaimers
- ✅ Limites d'utilisation

#### 2. Tests d'Interface

- ✅ Responsive design
- ✅ Accessibilité
- ✅ Modal de disclaimer
- ✅ Actions suggérées

#### 3. Tests de Sécurité

- ✅ Validation des entrées
- ✅ Gestion d'erreurs API
- ✅ Protection contre l'abus
- ✅ Conformité des réponses

## Utilisation

### Accès au Chatbot

1. **Navigation** : `Patient Dashboard > Assistant IA`
2. **URL directe** : `/patient/chatbot`
3. **Consentement** : Acceptation obligatoire du disclaimer

### Cas d'Usage Typiques

- **Questions générales** : "Comment améliorer mon sommeil ?"
- **Prévention** : "Conseils pour une alimentation équilibrée"
- **Bien-être** : "Gestion du stress au quotidien"

### Limitations Importantes

- ❌ Pas de diagnostic médical
- ❌ Pas de prescription de médicaments
- ❌ Pas de conseil personnalisé
- ✅ Informations générales uniquement
- ✅ Redirection vers professionnels

## Maintenance et Évolution

### Améliorations Futures

1. **IA plus avancée** : Modèles spécialisés santé
2. **Multilangue** : Support autres langues
3. **Intégration calendrier** : Prise de rendez-vous automatique
4. **Analytics** : Métriques d'utilisation et satisfaction

### Surveillance

- **Logs d'utilisation** : Monitoring des conversations
- **Détection d'abus** : Alertes sur usage inapproprié
- **Performance API** : Surveillance Google AI
- **Satisfaction utilisateur** : Feedback et amélioration continue

---

**Important** : Ce chatbot est un outil d'information générale et ne remplace en aucun cas un avis médical professionnel. Consultez toujours votre médecin pour des conseils personnalisés.
