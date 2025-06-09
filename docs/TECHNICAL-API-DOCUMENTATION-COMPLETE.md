# Documentation Technique et API Complète - Suivi Santé IA

## Vue d'ensemble

Cette documentation détaille l'architecture technique et les API de l'application de suivi de santé par IA développée avec Nuxt 4, Supabase et des services d'IA Google. Cette application propose des fonctionnalités d'analyse de repas par photo, un chatbot santé, et des recommandations alimentaires personnalisées.

## Table des matières

1. [Architecture du système](#1-architecture-du-système)
2. [Endpoints API](#2-endpoints-api)
3. [Authentification et sécurité](#3-authentification-et-sécurité)
4. [Types de données](#4-types-de-données)
5. [Codes d'erreur](#5-codes-derreur)
6. [Guide d'intégration](#6-guide-dintégration)
7. [Configuration et déploiement](#7-configuration-et-déploiement)
8. [Composables et services](#8-composables-et-services)
9. [Base de données](#9-base-de-données)
10. [Tests et validation](#10-tests-et-validation)

## 1. Architecture du système

### 1.1 Stack technique

- **Frontend** : Nuxt 4 (Vue.js 3, TypeScript)
- **Backend** : Nuxt 4 Nitro Server
- **Base de données** : Supabase (PostgreSQL avec RLS)
- **Authentification** : Supabase Auth
- **IA/ML** : Google Generative AI (Gemini), Google Vision AI
- **Stockage** : Supabase Storage
- **Conteneurisation** : Docker & Docker Compose
- **Tests** : Vitest, Playwright
- **Styling** : Tailwind CSS 4

### 1.2 Architecture des composants

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Services      │
│   (Nuxt App)    │◄──►│   (Nitro)       │◄──►│   Externes      │
│                 │    │                 │    │                 │
│ • Pages Vue     │    │ • API Routes    │    │ • Supabase      │
│ • Composables   │    │ • Middleware    │    │ • Google AI     │
│ • Components    │    │ • Utils         │    │ • Google Vision │
│ • Stores        │    │ • Security      │    │ • Docker        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.3 Flux de données

```
Utilisateur → Interface → Composable → API Route → Service Externe
    ↓             ↓           ↓           ↓            ↓
Interaction → Validation → Logique → Sécurité → Traitement IA
    ↓             ↓           ↓           ↓            ↓
 Affichage ← Réponse ← Store ← Base de données ← Résultat
```

### 1.4 Sécurité

- **Protection CSRF** : Tokens de sécurité pour toutes les opérations sensibles
- **Rate Limiting** : Limitation des requêtes par IP
- **Validation** : Sanitisation et validation des entrées
- **Logging** : Journalisation sécurisée des événements
- **Headers** : Configuration sécurisée des en-têtes HTTP
- **RLS** : Row Level Security sur Supabase
- **File Upload** : Validation et restrictions de fichiers

## 2. Endpoints API

### 2.1 Authentification

#### GET `/api/auth/csrf-token`

Génère un token CSRF pour sécuriser les requêtes.

**Réponse**

```json
{
  "success": true,
  "csrfToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Codes d'état**

- `200` : Token généré avec succès
- `405` : Méthode non autorisée
- `500` : Erreur serveur

**Utilisation**

```typescript
const { csrfToken } = await $fetch("/api/auth/csrf-token");
// Stocker le token pour les requêtes suivantes
```

---

### 2.2 Vision AI - Analyse de repas

#### POST `/api/vision/analyze-meal`

Analyse une image de repas avec Google Vision AI pour identifier les aliments et fournir des insights nutritionnels.

**Headers requis**

```
Content-Type: multipart/form-data
X-CSRF-Token: {csrf_token}
Cookie: csrf-session={session_token}
```

**Corps de la requête**

```
FormData:
- image: File (jpg, png, webp, max 10MB)
```

**Réponse réussie**

```json
{
  "success": true,
  "analysis": {
    "identifiedFoods": [
      {
        "name": "Salade verte",
        "confidence": 0.95,
        "category": "légume",
        "description": "Légumes verts feuillus"
      },
      {
        "name": "Poulet grillé",
        "confidence": 0.88,
        "category": "protéine",
        "description": "Viande blanche grillée"
      }
    ],
    "nutritionalCategories": {
      "vegetables": 40,
      "proteins": 35,
      "carbohydrates": 15,
      "fats": 10
    },
    "healthScore": 8.5,
    "recommendations": [
      "Excellent équilibre légumes/protéines",
      "Ajouter des glucides complexes pour plus d'énergie"
    ],
    "portions": {
      "estimated": "normale",
      "suggestions": "Portion équilibrée"
    }
  },
  "metadata": {
    "processingTime": 2340,
    "imageSize": "1.2MB",
    "confidence": 0.91
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Codes d'état**

- `200` : Analyse réussie
- `400` : Image manquante ou invalide
- `403` : Token CSRF invalide
- `413` : Fichier trop volumineux (>10MB)
- `415` : Type de fichier non supporté
- `429` : Trop de requêtes (limit: 10/min)
- `503` : Service temporairement indisponible

**Validation des fichiers**

- Formats acceptés : JPEG, PNG, WebP
- Taille maximale : 10 MB
- Résolution minimale : 300x300 pixels
- Validation du contenu MIME

---

### 2.3 Chatbot Santé IA

#### POST `/api/ai/health-chat`

Interaction avec le chatbot de santé basé sur l'IA Gemini, avec des contraintes strictes pour éviter les diagnostics médicaux.

**Headers requis**

```
Content-Type: application/json
```

**Corps de la requête**

```json
{
  "message": "J'ai mal à la tête depuis ce matin, que puis-je faire ?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Comment améliorer mon sommeil ?"
    },
    {
      "role": "assistant",
      "content": "Voici quelques conseils pour améliorer votre sommeil..."
    }
  ]
}
```

**Réponse normale**

```json
{
  "success": true,
  "message": "Les maux de tête peuvent avoir plusieurs causes. Il est important de consulter un professionnel de santé si la douleur persiste. En attendant, assurez-vous de bien vous hydrater et de vous reposer dans un environnement calme.",
  "type": "warning",
  "requiresDisclaimer": true,
  "suggestedActions": [
    "Consulter votre médecin",
    "Prendre rendez-vous",
    "En savoir plus"
  ],
  "generationTime": 1234,
  "disclaimerText": "Cette information ne remplace pas un avis médical professionnel."
}
```

**Réponse d'urgence**

```json
{
  "success": true,
  "message": "🚨 URGENCE DÉTECTÉE 🚨 Ces symptômes nécessitent une attention médicale immédiate. Contactez les services d'urgence ou rendez-vous aux urgences sans délai.",
  "type": "emergency",
  "requiresDisclaimer": true,
  "suggestedActions": [
    "Appeler le 15 (SAMU)",
    "Appeler le 112",
    "Se rendre aux urgences"
  ],
  "generationTime": 1100
}
```

**Types de réponse**

- `text` : Réponse informative standard
- `warning` : Recommandation de consultation médicale
- `emergency` : Urgence détectée (préfixée par 🚨)

**Contraintes de sécurité**

- Aucun diagnostic médical
- Aucune prescription de médicaments
- Redirection systématique vers les professionnels
- Détection d'urgences médicales
- Limitation de la longueur des réponses (200 mots max)

**Codes d'état**

- `200` : Réponse générée
- `400` : Message invalide ou trop long (>5000 chars)
- `429` : Trop de requêtes (limit: 5/min)
- `500` : Erreur de génération

---

### 2.4 Recommandations IA

#### POST `/api/ai/generate-recommendations`

Génère des recommandations alimentaires personnalisées basées sur l'historique des repas et les préférences utilisateur.

**Headers requis**

```
Content-Type: application/json
X-CSRF-Token: {csrf_token}
Cookie: csrf-session={session_token}
```

**Corps de la requête**

```json
{
  "meals": [
    {
      "id": "1",
      "type": "breakfast",
      "foods": ["pain complet", "avocat", "œuf"],
      "timestamp": "2024-01-15T08:00:00.000Z",
      "nutrition": {
        "calories": 450,
        "proteins": 20,
        "carbs": 35,
        "fats": 25
      }
    }
  ],
  "currentMeal": {
    "type": "lunch",
    "foods": ["salade", "poulet"],
    "context": "repas au travail"
  },
  "userPreferences": {
    "diet": "balanced",
    "allergies": ["nuts", "shellfish"],
    "goals": ["weight_loss", "muscle_gain"],
    "restrictions": ["no_red_meat"],
    "activityLevel": "moderate"
  },
  "context": "Je cherche à perdre du poids tout en gardant de l'énergie pour mes entraînements"
}
```

**Réponse**

```json
{
  "success": true,
  "recommendations": [
    {
      "id": "rec_1",
      "type": "meal_suggestion",
      "title": "Complétez avec des glucides complexes",
      "description": "Ajoutez du quinoa ou du riz brun (100g) pour maintenir l'énergie lors de vos entraînements",
      "priority": "high",
      "category": "energy",
      "reasoning": "Vos objectifs nécessitent des glucides pour la performance sportive"
    },
    {
      "id": "rec_2",
      "type": "portion_adjustment",
      "title": "Optimisation des protéines",
      "description": "150g de poulet vous apporteront 30g de protéines, idéal pour la récupération musculaire",
      "priority": "medium",
      "category": "muscle_building",
      "reasoning": "Votre objectif de gain musculaire nécessite 1.6-2.2g de protéines par kg"
    }
  ],
  "explanation": "Votre repas actuel est bien équilibré en protéines et légumes. Pour optimiser la perte de poids tout en maintenant l'énergie pour vos entraînements, ajoutez des glucides complexes en quantité modérée et surveillez la timing de vos repas.",
  "nutritionalAnalysis": {
    "currentBalance": {
      "proteins": 65,
      "carbs": 20,
      "fats": 15
    },
    "idealBalance": {
      "proteins": 30,
      "carbs": 40,
      "fats": 30
    }
  },
  "confidence": 0.85,
  "generationTime": 2340
}
```

---

### 2.5 Explication de repas IA

#### POST `/api/ai/explain-meal`

Génère une explication détaillée et éducative d'un repas analysé.

**Headers requis**

```
Content-Type: application/json
X-CSRF-Token: {csrf_token}
Cookie: csrf-session={session_token}
```

**Corps de la requête**

```json
{
  "meal": {
    "type": "dinner",
    "foods": ["saumon", "brocolis", "quinoa"],
    "timestamp": "2024-01-15T19:00:00.000Z",
    "portions": {
      "saumon": "150g",
      "brocolis": "200g",
      "quinoa": "80g cru"
    }
  },
  "analysis": {
    "healthScore": 9.2,
    "nutritionalBalance": {
      "proteins": 35,
      "carbs": 30,
      "fats": 25,
      "fiber": 10
    },
    "estimatedCalories": 520
  }
}
```

**Réponse**

```json
{
  "success": true,
  "explanation": {
    "summary": "Ce repas présente un excellent équilibre nutritionnel et constitue un modèle de repas santé.",
    "details": {
      "proteins": "Le saumon (150g) apporte environ 30g de protéines complètes et des oméga-3 anti-inflammatoires",
      "vegetables": "Les brocolis (200g) fournissent vitamines C, K, acide folique et fibres essentielles",
      "carbohydrates": "Le quinoa (80g cru) offre des glucides complexes, des protéines végétales et tous les acides aminés essentiels"
    },
    "nutritionalBenefits": [
      "Anti-inflammatoire naturel grâce aux oméga-3",
      "Favorise la satiété avec ses fibres et protéines",
      "Bon pour la santé cardiovasculaire",
      "Soutient la fonction cognitive",
      "Aide à la récupération musculaire"
    ],
    "suggestions": [
      "Ajouter un filet d'huile d'olive pour améliorer l'absorption des vitamines liposolubles",
      "Accompagner d'une source de vitamine C (citron) pour optimiser l'absorption du fer"
    ],
    "timing": "Parfait pour un dîner, permet une bonne digestion et récupération nocturne",
    "alternatives": [
      "Remplacer le saumon par du maquereau pour plus d'oméga-3",
      "Substituer le quinoa par du riz brun ou des patates douces"
    ]
  },
  "educationalContent": {
    "didYouKnow": "Le saumon contient de l'astaxanthine, un antioxydant qui lui donne sa couleur rose et protège contre le stress oxydatif",
    "nutritionTip": "Consommer des oméga-3 régulièrement peut réduire l'inflammation et améliorer la santé cardiaque"
  },
  "generationTime": 1890
}
```

---

### 2.6 Recommandations (Legacy)

#### POST `/api/recommendations/generate`

Endpoint de compatibilité qui redirige vers `/api/ai/generate-recommendations` pour maintenir la rétrocompatibilité.

## 3. Authentification et sécurité

### 3.1 Tokens CSRF

Tous les endpoints qui modifient des données ou accèdent à des services externes nécessitent un token CSRF :

**Workflow**

1. **Obtenir un token** : `GET /api/auth/csrf-token`
2. **Stocker le token** : Cookie `csrf-session` (httpOnly, secure)
3. **Utiliser le token** : Header `X-CSRF-Token` dans les requêtes

**Exemple d'implémentation**

```typescript
// Obtenir le token
const { csrfToken } = await $fetch("/api/auth/csrf-token");

// Utiliser dans une requête
await $fetch("/api/vision/analyze-meal", {
  method: "POST",
  headers: {
    "X-CSRF-Token": csrfToken,
  },
  body: formData,
});
```

### 3.2 Rate Limiting

| Endpoint              | Limite | Fenêtre  | Type                 |
| --------------------- | ------ | -------- | -------------------- |
| `/api/vision/*`       | 10 req | 1 minute | Upload intensif      |
| `/api/ai/health-chat` | 5 req  | 1 minute | IA conversationnelle |
| `/api/ai/generate-*`  | 20 req | 1 minute | IA générative        |
| `/api/auth/*`         | 30 req | 1 minute | Authentification     |
| Autres endpoints      | 60 req | 1 minute | Usage général        |

**Gestion côté client**

```typescript
try {
  const result = await $fetch("/api/endpoint");
} catch (error) {
  if (error.statusCode === 429) {
    const retryAfter = error.headers["retry-after"] || 60;
    // Attendre avant de réessayer
    setTimeout(() => retry(), retryAfter * 1000);
  }
}
```

### 3.3 Validation des fichiers

**Contraintes de sécurité**

- Types MIME vérifiés côté serveur
- Signature de fichier validée
- Taille limitée (10MB pour images)
- Scan antivirus en production
- Stockage isolé

**Validation d'upload**

```typescript
function validateUploadedFile(file: File) {
  // Vérification du type MIME
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Type de fichier non supporté");
  }

  // Vérification de la taille
  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    throw new Error("Fichier trop volumineux");
  }

  // Vérification de la signature
  // ...
}
```

### 3.4 Headers de sécurité

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 3.5 Logging sécurisé

**Événements tracés**

```typescript
logSecurityEvent(event, "VISION_API_SUCCESS", {
  endpoint: "/api/vision/analyze-meal",
  itemsDetected: 3,
  processingTime: 2340,
  // Pas d'informations sensibles
});

logSecurityEvent(event, "RATE_LIMIT_EXCEEDED", {
  endpoint: "/api/ai/health-chat",
  clientIP: hashIP(getClientIP(event)), // IP hashée
  remaining: 0,
});
```

## 4. Types de données

### 4.1 Types d'interface principaux

#### MealData

```typescript
interface MealData {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  foods: string[];
  timestamp: string;
  portions?: Record<string, string>;
  nutrition?: NutritionInfo;
  analysis?: MealAnalysis;
  imageUrl?: string;
  userId?: string;
}

interface NutritionInfo {
  calories: number;
  proteins: number; // en grammes
  carbs: number;
  fats: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
}
```

#### VisionAnalysisResult

```typescript
interface VisionAnalysisResult {
  identifiedFoods: FoodItem[];
  nutritionalCategories: NutritionCategories;
  healthScore: number; // 0-10
  recommendations: string[];
  confidence: number; // 0-1
  portions?: PortionEstimate;
  processingTime: number;
}

interface FoodItem {
  name: string;
  confidence: number;
  category: "légume" | "protéine" | "glucide" | "lipide" | "fruit" | "autre";
  description?: string;
  estimatedQuantity?: string;
}

interface NutritionCategories {
  vegetables: number; // pourcentage
  proteins: number;
  carbohydrates: number;
  fats: number;
  fruits?: number;
}
```

#### HealthChatTypes

```typescript
interface HealthChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface HealthChatResponse {
  success: boolean;
  message: string;
  type: "text" | "warning" | "emergency";
  requiresDisclaimer: boolean;
  suggestedActions: string[];
  generationTime: number;
  disclaimerText?: string;
}
```

#### UserPreferences

```typescript
interface UserPreferences {
  diet: DietType;
  allergies: string[];
  goals: HealthGoal[];
  restrictions?: string[];
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  medicalConditions?: string[];
}

type DietType =
  | "balanced"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "mediterranean"
  | "paleo"
  | "low_carb"
  | "low_fat";

type HealthGoal =
  | "weight_loss"
  | "muscle_gain"
  | "maintenance"
  | "health"
  | "performance"
  | "energy";
```

### 4.2 Types de base de données

Référez-vous à `nuxt-app/app/types/database.ts` pour les types Supabase complets.

#### Principales tables

```typescript
interface UsersTable {
  Row: {
    id: string;
    email: string;
    role: "patient" | "doctor" | "admin";
    created_at: string;
    updated_at: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
  };
}

interface MealsTable {
  Row: {
    id: string;
    user_id: string;
    type: string;
    foods: string[];
    timestamp: string;
    analysis?: any;
    image_url?: string;
  };
}
```

## 5. Codes d'erreur

### 5.1 Codes HTTP standards

| Code | Description            | Cas d'usage             | Action recommandée    |
| ---- | ---------------------- | ----------------------- | --------------------- |
| 200  | OK                     | Succès                  | Traiter la réponse    |
| 400  | Bad Request            | Données invalides       | Valider les données   |
| 401  | Unauthorized           | Non authentifié         | Rediriger vers login  |
| 403  | Forbidden              | Token CSRF invalide     | Rafraîchir le token   |
| 405  | Method Not Allowed     | Mauvaise méthode HTTP   | Vérifier la méthode   |
| 413  | Payload Too Large      | Fichier trop volumineux | Réduire la taille     |
| 415  | Unsupported Media Type | Format non supporté     | Changer le format     |
| 429  | Too Many Requests      | Rate limit dépassé      | Attendre et réessayer |
| 500  | Internal Server Error  | Erreur serveur          | Signaler l'erreur     |
| 503  | Service Unavailable    | Service indisponible    | Réessayer plus tard   |

### 5.2 Messages d'erreur détaillés

#### Erreurs de validation

```json
{
  "statusCode": 400,
  "statusMessage": "Données de repas invalides",
  "data": {
    "field": "foods",
    "message": "Le tableau 'foods' ne peut pas être vide",
    "received": "[]"
  }
}
```

#### Erreurs de rate limiting

```json
{
  "statusCode": 429,
  "statusMessage": "Trop de requêtes. Veuillez réessayer plus tard.",
  "data": {
    "retryAfter": 60,
    "limit": 10,
    "window": "1 minute",
    "endpoint": "/api/vision/analyze-meal"
  }
}
```

#### Erreurs de fichier

```json
{
  "statusCode": 415,
  "statusMessage": "Type de fichier non supporté",
  "data": {
    "allowedTypes": ["image/jpeg", "image/png", "image/webp"],
    "receivedType": "image/gif"
  }
}
```

## 6. Guide d'intégration

### 6.1 Configuration initiale

#### Installation des dépendances

```bash
npm install @supabase/supabase-js
npm install @google/generative-ai
```

#### Configuration du client

```typescript
// Configuration Nuxt
export default defineNuxtConfig({
  runtimeConfig: {
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
    googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
});

// Utilisation dans un composable
const config = useRuntimeConfig();
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseAnonKey
);
```

### 6.2 Authentification et tokens

```typescript
// Composable d'authentification
export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const getCsrfToken = async () => {
    const { csrfToken } = await $fetch("/api/auth/csrf-token");
    return csrfToken;
  };

  return {
    user,
    getCsrfToken,
    signIn: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };
};
```

### 6.3 Analyse d'image

```typescript
// Composable pour l'analyse de repas
export const useGoogleVisionAI = () => {
  const { getCsrfToken } = useAuth();

  const analyzeMealPhoto = async (imageFile: File) => {
    // Validation côté client
    if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
      throw new Error("Type de fichier non supporté");
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error("Fichier trop volumineux (max 10MB)");
    }

    // Préparer la requête
    const csrfToken = await getCsrfToken();
    const formData = new FormData();
    formData.append("image", imageFile);

    // Analyser
    const result = await $fetch("/api/vision/analyze-meal", {
      method: "POST",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      body: formData,
    });

    return result;
  };

  return {
    analyzeMealPhoto,
    isAnalyzing: ref(false),
    error: ref(null),
  };
};
```

### 6.4 Chat santé

```typescript
// Composable pour le chatbot santé
export const useHealthChatbot = () => {
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);

  const sendMessage = async (message: string) => {
    isLoading.value = true;

    try {
      // Ajouter le message utilisateur
      messages.value.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      // Envoyer à l'API
      const response = await $fetch("/api/ai/health-chat", {
        method: "POST",
        body: {
          message,
          conversationHistory: messages.value.slice(-10), // Derniers 10 messages
        },
      });

      // Ajouter la réponse
      messages.value.push({
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString(),
      });

      // Gérer les urgences
      if (response.type === "emergency") {
        await showEmergencyAlert(response.message, response.suggestedActions);
      }

      return response;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory: () => (messages.value = []),
  };
};
```

### 6.5 Gestion des erreurs

```typescript
// Middleware global de gestion d'erreurs
export default defineNuxtPlugin(() => {
  const handleApiError = (error: any) => {
    const toast = useToast();

    switch (error.statusCode) {
      case 400:
        toast.add({
          title: "Données invalides",
          description: error.statusMessage,
          color: "red",
        });
        break;

      case 403:
        // Token CSRF expiré, rafraîchir la page
        window.location.reload();
        break;

      case 429:
        const retryAfter = error.data?.retryAfter || 60;
        toast.add({
          title: "Trop de requêtes",
          description: `Veuillez attendre ${retryAfter} secondes`,
          color: "orange",
        });
        break;

      case 500:
        toast.add({
          title: "Erreur serveur",
          description: "Une erreur interne est survenue",
          color: "red",
        });
        break;

      default:
        toast.add({
          title: "Erreur",
          description: "Une erreur inattendue est survenue",
          color: "red",
        });
    }
  };

  return {
    provide: {
      handleApiError,
    },
  };
});
```

## 7. Configuration et déploiement

### 7.1 Variables d'environnement

#### Développement (.env.local)

```bash
# API Keys Google
GOOGLE_AI_API_KEY=your_google_ai_key_here
GOOGLE_VISION_API_KEY=your_google_vision_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Sécurité
NUXT_SECRET_KEY=your_very_long_random_secret_key_for_csrf_tokens

# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/suivi_sante

# Environnement
NODE_ENV=development
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Production

```bash
# Utiliser des secrets sécurisés
GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
GOOGLE_VISION_API_KEY=${GOOGLE_VISION_API_KEY}
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
NUXT_SECRET_KEY=${NUXT_SECRET_KEY}

NODE_ENV=production
NUXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

### 7.2 Configuration Docker

#### Dockerfile optimisé (production)

```dockerfile
# Multi-stage build optimisé
FROM node:20-alpine AS base
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime
FROM base AS runner
USER nuxtjs
COPY --from=deps --chown=nuxtjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME 0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node .output/server/index.mjs --health-check || exit 1

CMD ["node", ".output/server/index.mjs"]
```

#### docker-compose.yml optimisé

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.optimized
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
      - GOOGLE_VISION_API_KEY=${GOOGLE_VISION_API_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - NUXT_SECRET_KEY=${NUXT_SECRET_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", ".output/server/index.mjs", "--health-check"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 7.3 Scripts de déploiement

#### Script PowerShell pour Windows

```powershell
# deploy.ps1
param(
    [string]$Environment = "development",
    [switch]$Build = $false,
    [switch]$Push = $false
)

Write-Host "Déploiement pour l'environnement: $Environment" -ForegroundColor Green

# Build de l'image si demandé
if ($Build) {
    Write-Host "Construction de l'image Docker..." -ForegroundColor Yellow
    docker build -f Dockerfile.optimized -t suivi-sante-ia:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Échec de la construction"
        exit 1
    }
}

# Test de l'image
Write-Host "Test de l'image..." -ForegroundColor Yellow
docker run --rm -d --name test-container -p 3001:3000 suivi-sante-ia:latest
Start-Sleep -Seconds 30

$healthCheck = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get -TimeoutSec 10
if ($healthCheck.status -eq "ok") {
    Write-Host "✓ Test de santé réussi" -ForegroundColor Green
} else {
    Write-Error "✗ Test de santé échoué"
    docker stop test-container
    exit 1
}

docker stop test-container

# Déploiement
if ($Environment -eq "production") {
    Write-Host "Déploiement en production..." -ForegroundColor Red
    docker-compose -f docker-compose.optimized.yml up -d
} else {
    Write-Host "Déploiement en développement..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.optimized.yml up -d
}

Write-Host "Déploiement terminé avec succès!" -ForegroundColor Green
```

### 7.4 Monitoring et logs

#### Configuration de logging

```typescript
// server/utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "suivi-sante-api" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
```

#### Health check endpoint

```typescript
// server/api/health.get.ts
export default defineEventHandler(async (event) => {
  const startTime = Date.now();

  try {
    // Test de connectivité Supabase
    const supabase = serverSupabaseClient(event);
    await supabase.from("users").select("count").limit(1);

    // Test des APIs externes (optionnel)
    const googleAiStatus = await testGoogleAI();
    const googleVisionStatus = await testGoogleVision();

    const responseTime = Date.now() - startTime;

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      responseTime,
      services: {
        database: "ok",
        googleAI: googleAiStatus,
        googleVision: googleVisionStatus,
      },
    };
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: "Service temporairement indisponible",
    });
  }
});
```

## 8. Composables et services

### 8.1 Composables principaux

#### useAuth.ts

```typescript
export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const router = useRouter();

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await router.push("/auth/login");
  };

  const updateProfile = async (updates: any) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;
    return data;
  };

  return {
    user: readonly(user),
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: computed(() => !!user.value),
    isLoading: computed(() => user.value === undefined),
  };
};
```

#### useMeals.ts

```typescript
export const useMeals = () => {
  const supabase = useSupabaseClient();
  const { user } = useAuth();

  const meals = ref<MealData[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchMeals = async (dateRange?: { from: Date; to: Date }) => {
    if (!user.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      let query = supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.value.id)
        .order("timestamp", { ascending: false });

      if (dateRange) {
        query = query
          .gte("timestamp", dateRange.from.toISOString())
          .lte("timestamp", dateRange.to.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      meals.value = data || [];
    } catch (err: any) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const addMeal = async (meal: Omit<MealData, "id" | "userId">) => {
    if (!user.value) throw new Error("Non authentifié");

    const { data, error: addError } = await supabase
      .from("meals")
      .insert({
        ...meal,
        user_id: user.value.id,
      })
      .select()
      .single();

    if (addError) throw addError;

    meals.value.unshift(data);
    return data;
  };

  const updateMeal = async (id: string, updates: Partial<MealData>) => {
    const { data, error: updateError } = await supabase
      .from("meals")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.value?.id)
      .select()
      .single();

    if (updateError) throw updateError;

    const index = meals.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      meals.value[index] = data;
    }

    return data;
  };

  const deleteMeal = async (id: string) => {
    const { error: deleteError } = await supabase
      .from("meals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.value?.id);

    if (deleteError) throw deleteError;

    meals.value = meals.value.filter((m) => m.id !== id);
  };

  return {
    meals: readonly(meals),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchMeals,
    addMeal,
    updateMeal,
    deleteMeal,
  };
};
```

### 8.2 Services utilitaires

#### Validation service

```typescript
// utils/validation.ts
export const validateMealData = (meal: any): meal is MealData => {
  if (!meal || typeof meal !== "object") return false;

  const requiredFields = ["type", "foods", "timestamp"];
  for (const field of requiredFields) {
    if (!(field in meal)) return false;
  }

  const validTypes = ["breakfast", "lunch", "dinner", "snack"];
  if (!validTypes.includes(meal.type)) return false;

  if (!Array.isArray(meal.foods) || meal.foods.length === 0) return false;

  try {
    new Date(meal.timestamp);
  } catch {
    return false;
  }

  return true;
};

export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Supprime les balises HTML basiques
    .trim()
    .substring(0, 5000); // Limite la longueur
};
```

## 9. Base de données

### 9.1 Structure des tables principales

#### Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  medical_license VARCHAR(100), -- pour les médecins
  specialization VARCHAR(100), -- pour les médecins
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20)
);
```

#### Meals

```sql
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  foods TEXT[] NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url TEXT,
  analysis JSONB,
  nutrition JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Health Goals

```sql
CREATE TABLE health_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit VARCHAR(50),
  target_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9.2 Politiques RLS (Row Level Security)

#### Users

```sql
-- Les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Les médecins peuvent voir les profils de leurs patients (avec consentement)
CREATE POLICY "Doctors can view patients with consent" ON users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT doctor_id FROM doctor_patient_relations
      WHERE patient_id = users.id AND status = 'approved'
    )
  );
```

#### Meals

```sql
-- Les utilisateurs peuvent gérer leurs propres repas
CREATE POLICY "Users can manage own meals" ON meals
  FOR ALL USING (auth.uid() = user_id);

-- Les médecins peuvent voir les repas de leurs patients (avec consentement)
CREATE POLICY "Doctors can view patient meals" ON meals
  FOR SELECT USING (
    auth.uid() IN (
      SELECT doctor_id FROM doctor_patient_relations
      WHERE patient_id = meals.user_id AND status = 'approved'
    )
  );
```

### 9.3 Indexes pour performance

```sql
-- Index pour les requêtes fréquentes
CREATE INDEX idx_meals_user_timestamp ON meals(user_id, timestamp DESC);
CREATE INDEX idx_meals_type ON meals(type);
CREATE INDEX idx_health_goals_user_status ON health_goals(user_id, status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Index GIN pour les recherches JSON
CREATE INDEX idx_meals_analysis ON meals USING GIN(analysis);
CREATE INDEX idx_meals_nutrition ON meals USING GIN(nutrition);
```

## 10. Tests et validation

### 10.1 Tests unitaires

Les tests sont organisés dans `nuxt-app/tests/` :

- `unit/` : Tests unitaires des composables et utilitaires
- `integration/` : Tests d'intégration des API
- `e2e/` : Tests end-to-end avec Playwright

#### Exemple de test de composable

```typescript
// tests/unit/composables/useAuth.test.ts
import { describe, it, expect, vi } from "vitest";
import { useAuth } from "~/composables/useAuth";

describe("useAuth", () => {
  it("should handle user sign in", async () => {
    const { signIn } = useAuth();

    const result = await signIn("test@example.com", "password");

    expect(result).toBeDefined();
    expect(result.user).toBeTruthy();
  });

  it("should handle sign in errors", async () => {
    const { signIn } = useAuth();

    await expect(
      signIn("invalid@example.com", "wrongpassword")
    ).rejects.toThrow();
  });
});
```

#### Test d'API

```typescript
// tests/integration/api/vision.test.ts
import { describe, it, expect } from "vitest";

describe("/api/vision/analyze-meal", () => {
  it("should analyze meal image successfully", async () => {
    const formData = new FormData();
    const mockImage = new File([""], "test.jpg", { type: "image/jpeg" });
    formData.append("image", mockImage);

    const response = await $fetch("/api/vision/analyze-meal", {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRF-Token": "mock-token",
      },
    });

    expect(response.success).toBe(true);
    expect(response.analysis).toBeDefined();
    expect(response.analysis.identifiedFoods).toBeInstanceOf(Array);
  });
});
```

### 10.2 Tests de performance

```typescript
// tests/integration/performance.test.ts
import { describe, it, expect } from "vitest";

describe("API Performance", () => {
  it("should respond to health chat within 5 seconds", async () => {
    const startTime = Date.now();

    const response = await $fetch("/api/ai/health-chat", {
      method: "POST",
      body: {
        message: "Comment ça va ?",
      },
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(5000); // 5 secondes max
    expect(response.success).toBe(true);
  });

  it("should handle multiple concurrent requests", async () => {
    const requests = Array(10)
      .fill(null)
      .map(() => $fetch("/api/auth/csrf-token"));

    const results = await Promise.all(requests);

    results.forEach((result) => {
      expect(result.success).toBe(true);
      expect(result.csrfToken).toBeDefined();
    });
  });
});
```

### 10.3 Validation continue

#### GitHub Actions workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run e2e tests
        run: npm run test:e2e

      - name: Build production
        run: npm run build
```

---

## Conclusion

Cette documentation technique couvre tous les aspects essentiels de l'application de suivi de santé par IA. Elle est conçue pour être :

- **Complète** : Tous les endpoints et fonctionnalités sont documentés
- **Pratique** : Exemples de code et guides d'intégration
- **Sécurisée** : Bonnes pratiques de sécurité détaillées
- **Maintenable** : Structure claire et types TypeScript
- **Évolutive** : Architecture modulaire et extensible

Pour toute question ou contribution, consultez la documentation de développement dans le dossier `/docs` du projet.

---

_Version 1.0.0 - Dernière mise à jour : Janvier 2024_
