# Documentation Technique et API - Suivi Santé IA

## Vue d'ensemble

**Suivi Santé IA** est une application web de suivi nutritionnel alimentée par l'intelligence artificielle, construite avec Nuxt 4, TypeScript, et intégrée avec Google AI (Gemini) et Google Vision AI pour l'analyse d'images de repas.

### Technologies principales

- **Frontend**: Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4
- **Backend**: Nitro (Nuxt server), Supabase
- **IA**: Google Generative AI (Gemini), Google Vision AI
- **Base de données**: PostgreSQL via Supabase
- **Authentification**: Supabase Auth
- **Conteneurisation**: Docker, Docker Compose

## Architecture

### Structure du projet

```
nuxt-app/
├── app/                     # Code source principal
│   ├── components/          # Composants Vue réutilisables
│   ├── composables/         # Logique métier réutilisable
│   ├── layouts/            # Layouts d'application
│   ├── pages/              # Pages de l'application
│   ├── types/              # Définitions TypeScript
│   └── utils/              # Utilitaires
├── server/                 # API server-side
│   ├── api/                # Endpoints API
│   ├── middleware/         # Middleware serveur
│   └── utils/              # Utilitaires serveur
├── tests/                  # Tests (unit, integration, e2e)
└── public/                 # Assets statiques
```

### Composables principales

#### useAuth

Gestion de l'authentification et des sessions utilisateur.

```typescript
interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  first_name?: string;
  last_name?: string;
}

// Fonctions principales
signIn(email: string, password: string): Promise<AuthResponse>
signUp(email: string, password: string, userData?: UserData): Promise<AuthResponse>
signOut(): Promise<void>
updateProfile(data: UserProfileData): Promise<AuthResponse>
```

#### useMeals

Gestion des données de repas et analyse nutritionnelle.

```typescript
interface MealData {
  id?: string;
  user_id?: string;
  type: string; // petit-dejeuner, dejeuner, diner, collation
  datetime: string;
  foods: FoodItem[];
  notes?: string;
  satisfaction?: number; // 1-5
  hunger_level?: number; // 1-5
  photo_url?: string;
  ai_analysis?: string;
  ai_identified_foods?: string[];
  ai_confidence?: number; // 0-1
}

interface FoodItem {
  name: string;
  quantity?: string;
  unit?: string;
  calories?: number;
  category?: string;
  confidence?: number;
  nutritionalInfo?: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
  };
}
```

#### useGoogleVisionAI

Interface avec l'API Google Vision pour l'analyse d'images.

```typescript
// Analyse d'image de repas
analyzeMealImage(imageFile: File): Promise<{
  success: boolean;
  foods: FoodItem[];
  confidence: number;
  labels: VisionLabel[];
  objects: VisionObject[];
  text?: VisionText[];
}>
```

#### useHealthChatbot

Chatbot de santé alimenté par Google AI.

```typescript
// Envoi de message au chatbot
sendMessage(message: string, conversationHistory?: ChatMessage[]): Promise<{
  response: string;
  conversationId: string;
  timestamp: string;
}>

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```

---

## API Documentation

### Authentification et sécurité

Toutes les API (sauf `/api/auth/csrf-token`) nécessitent :

1. **Protection CSRF** : Token CSRF via cookie `csrf-session` et header `x-csrf-token`
2. **Rate limiting** : Limitation par IP (standard: 100 req/15min, upload: 10 req/15min)
3. **Validation des données** : Sanitisation et validation stricte des entrées
4. **Logging de sécurité** : Enregistrement des événements sécuritaires

### Endpoints disponibles

#### 1. `/api/auth/csrf-token` [GET]

**Description** : Génère un token CSRF pour sécuriser les requêtes.

**Paramètres** : Aucun

**Réponse** :

```json
{
  "success": true,
  "csrfToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Codes d'erreur** :

- `405` : Method Not Allowed
- `500` : Erreur interne du serveur

---

#### 2. `/api/vision/analyze-meal` [POST]

**Description** : Analyse une image de repas avec Google Vision AI.

**Content-Type** : `multipart/form-data`

**Headers requis** :

```
x-csrf-token: [token CSRF]
Cookie: csrf-session=[session token]
```

**Paramètres** :

- `image` (File) : Fichier image (JPG, PNG, WebP, max 10MB)

**Validation fichier** :

- Types autorisés : `image/jpeg`, `image/png`, `image/webp`
- Taille maximale : 10 MB
- Validation MIME type et extension

**Réponse réussie** :

```json
{
  "success": true,
  "analysis": {
    "foods": [
      {
        "name": "salade verte",
        "confidence": 0.95,
        "category": "légumes",
        "nutritionalInfo": {
          "calories": 25,
          "proteins": 1.2,
          "carbs": 4.5,
          "fats": 0.2
        }
      }
    ],
    "labels": [
      {
        "description": "Food",
        "score": 0.98
      }
    ],
    "objects": [
      {
        "name": "Salad",
        "score": 0.92,
        "boundingPoly": {...}
      }
    ],
    "confidence": 0.89,
    "processingTime": 1250
  }
}
```

**Codes d'erreur** :

- `400` : Fichier invalide ou données manquantes
- `403` : Token CSRF invalide
- `405` : Method Not Allowed
- `413` : Fichier trop volumineux
- `415` : Type de fichier non supporté
- `429` : Rate limit dépassé
- `500` : Erreur Google Vision API
- `503` : Service indisponible (clé API manquante)

---

#### 3. `/api/ai/health-chat` [POST]

**Description** : Chatbot de santé alimenté par Google AI (Gemini).

**Content-Type** : `application/json`

**Headers requis** :

```
x-csrf-token: [token CSRF]
Cookie: csrf-session=[session token]
```

**Paramètres** :

```json
{
  "message": "J'ai mal à l'estomac après avoir mangé",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Bonjour",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Bonjour ! Comment puis-je vous aider ?",
      "timestamp": "2024-01-15T10:30:05.000Z"
    }
  ]
}
```

**Validation** :

- `message` : Requis, string, max 5000 caractères
- `conversationHistory` : Optionnel, array, max 50 éléments

**Réponse** :

```json
{
  "success": true,
  "response": "Il pourrait y avoir plusieurs raisons à votre inconfort gastrique...",
  "conversationId": "conv_abc123",
  "confidence": 0.85,
  "timestamp": "2024-01-15T10:35:00.000Z",
  "tokensUsed": 125
}
```

**Mode simulation** (si clé API non configurée) :

```json
{
  "success": true,
  "response": "Merci pour votre message. En mode simulation, je vous recommande de consulter un professionnel de santé pour des conseils personnalisés.",
  "simulationMode": true,
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

**Codes d'erreur** :

- `400` : Message invalide ou trop long
- `403` : Token CSRF invalide
- `405` : Method Not Allowed
- `429` : Rate limit dépassé
- `500` : Erreur Google AI API

---

#### 4. `/api/ai/generate-recommendations` [POST]

**Description** : Génère des recommandations nutritionnelles personnalisées.

**Content-Type** : `application/json`

**Headers requis** :

```
x-csrf-token: [token CSRF]
Cookie: csrf-session=[session token]
```

**Paramètres** :

```json
{
  "meals": [
    {
      "type": "petit-dejeuner",
      "datetime": "2024-01-15T07:30:00.000Z",
      "foods": [
        {
          "name": "pain complet",
          "quantity": "2",
          "unit": "tranches"
        }
      ],
      "satisfaction": 4,
      "hunger_level": 2
    }
  ],
  "currentMeal": {
    "type": "dejeuner",
    "foods": [...]
  },
  "userPreferences": {
    "dietary_restrictions": ["végétarien"],
    "allergies": ["lactose"],
    "goals": ["perte_poids", "energie"]
  },
  "context": "Recherche suggestions pour augmenter l'apport en protéines"
}
```

**Réponse** :

```json
{
  "success": true,
  "recommendations": [
    {
      "category": "nutrition",
      "title": "Augmenter l'apport en protéines",
      "description": "Ajoutez des légumineuses ou du tofu à vos repas",
      "priority": "high",
      "actionable_steps": [
        "Intégrer 100g de lentilles au déjeuner",
        "Ajouter 80g de tofu grillé"
      ]
    }
  ],
  "explanation": "Basé sur votre historique, vous pourriez bénéficier...",
  "confidence": 0.92,
  "generationTime": 2100
}
```

**Codes d'erreur** :

- `400` : Données de repas invalides
- `403` : Token CSRF invalide
- `405` : Method Not Allowed
- `429` : Rate limit dépassé
- `500` : Erreur génération IA

---

#### 5. `/api/ai/explain-meal` [POST]

**Description** : Génère une explication nutritionnelle détaillée d'un repas.

**Content-Type** : `application/json`

**Headers requis** :

```
x-csrf-token: [token CSRF]
Cookie: csrf-session=[session token]
```

**Paramètres** :

```json
{
  "meal": {
    "type": "dejeuner",
    "foods": [
      {
        "name": "saumon grillé",
        "quantity": "150",
        "unit": "g"
      },
      {
        "name": "brocolis",
        "quantity": "200",
        "unit": "g"
      }
    ]
  },
  "analysis": {
    "total_calories": 320,
    "macros": {
      "proteins": 35,
      "carbs": 12,
      "fats": 18
    }
  }
}
```

**Réponse** :

```json
{
  "success": true,
  "explanation": {
    "summary": "Ce repas offre un excellent équilibre nutritionnel...",
    "nutritional_benefits": [
      "Riche en oméga-3 grâce au saumon",
      "Apport important en fibres avec les brocolis"
    ],
    "recommendations": [
      "Excellent choix pour la récupération musculaire",
      "Pourrait être accompagné d'une source de glucides complexes"
    ],
    "health_impact": "Favorise la santé cardiovasculaire et le maintien musculaire"
  }
}
```

**Codes d'erreur** :

- `400` : Données de repas invalides
- `403` : Token CSRF invalide
- `405` : Method Not Allowed
- `429` : Rate limit dépassé
- `500` : Erreur génération explication

---

#### 6. `/api/recommendations/generate` [POST]

**Description** : Endpoint legacy qui redirige vers `/api/ai/generate-recommendations`.

**Note** : Maintenu pour compatibilité, redirige automatiquement vers le nouvel endpoint Google AI.

---

## Gestion des erreurs

### Codes de statut standardisés

- **200** : Succès
- **400** : Requête invalide (données manquantes/incorrectes)
- **401** : Non authentifié
- **403** : Accès interdit (CSRF invalide)
- **404** : Ressource non trouvée
- **405** : Méthode non autorisée
- **413** : Payload trop volumineux
- **415** : Type de média non supporté
- **429** : Rate limit dépassé
- **500** : Erreur interne du serveur
- **503** : Service indisponible

### Format de réponse d'erreur

```json
{
  "success": false,
  "statusCode": 400,
  "statusMessage": "Données de repas invalides",
  "timestamp": "2024-01-15T10:35:00.000Z",
  "path": "/api/ai/generate-recommendations"
}
```

### Logging des erreurs

Tous les événements de sécurité et erreurs sont loggés avec :

- IP client
- Timestamp
- Endpoint concerné
- Type d'événement
- Détails de l'erreur

---

## Rate Limiting

### Limites par endpoint

| Endpoint                   | Limite  | Fenêtre |
| -------------------------- | ------- | ------- |
| `/api/auth/csrf-token`     | 20 req  | 15 min  |
| `/api/vision/analyze-meal` | 10 req  | 15 min  |
| `/api/ai/*`                | 100 req | 15 min  |
| Autres endpoints           | 100 req | 15 min  |

### Headers de réponse

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705314900
```

---

## Configuration

### Variables d'environnement requises

```env
# Google AI
GOOGLE_AI_API_KEY=your_gemini_api_key
GOOGLE_VISION_API_KEY=your_vision_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Security
CSRF_SECRET=your_csrf_secret_key
RATE_LIMIT_SECRET=your_rate_limit_secret

# App
NUXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Configuration Nuxt

```typescript
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    experimental: {
      wasm: true,
    },
  },
  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss", "@pinia/nuxt"],
  runtimeConfig: {
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
    googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    csrfSecret: process.env.CSRF_SECRET,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
});
```

---

## Intégration avec les services externes

### Google Generative AI (Gemini)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(config.googleAiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Génération de contenu
const result = await model.generateContent(prompt);
```

### Google Vision AI

```typescript
const visionClient = new ImageAnnotatorClient({
  credentials: {
    type: "service_account",
    project_id: config.googleVisionProjectId,
    private_key: config.googleVisionPrivateKey,
    client_email: config.googleVisionClientEmail,
  },
});

// Analyse d'image
const [result] = await visionClient.annotateImage({
  image: { content: imageBase64 },
  features: [
    { type: "LABEL_DETECTION", maxResults: 20 },
    { type: "OBJECT_LOCALIZATION", maxResults: 20 },
  ],
});
```

### Supabase

```typescript
// Configuration client
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Exemple d'utilisation
const { data, error } = await supabase
  .from("meal_records")
  .select("*")
  .eq("user_id", userId)
  .order("datetime", { ascending: false });
```

---

## Performance et optimisation

### Optimisations frontend

1. **Lazy loading** : Chargement différé des composants et images
2. **Code splitting** : Division automatique du bundle par Nuxt
3. **Compression** : Gzip/Brotli activé en production
4. **CDN** : Assets statiques servis via CDN
5. **Prefetching** : Préchargement intelligent des pages

### Optimisations backend

1. **Connection pooling** : Pool de connexions Supabase
2. **Caching** : Cache Redis pour les réponses API
3. **Rate limiting** : Protection contre les abus
4. **Compression de réponse** : Compression automatique JSON

### Métriques de performance

- **Time to First Byte (TTFB)** : < 200ms
- **First Contentful Paint (FCP)** : < 1s
- **Largest Contentful Paint (LCP)** : < 2.5s
- **Cumulative Layout Shift (CLS)** : < 0.1

---

## Sécurité

### Mesures de sécurité implémentées

1. **CSRF Protection** : Tokens CSRF pour toutes les mutations
2. **Rate Limiting** : Limitation des requêtes par IP
3. **Input Validation** : Validation et sanitisation strictes
4. **File Upload Security** : Validation MIME type et taille
5. **HTTPS Enforcement** : Redirection automatique HTTPS
6. **Headers de sécurité** : CSP, HSTS, X-Frame-Options
7. **Logging de sécurité** : Enregistrement des événements suspects

### Authentification

- **Sessions sécurisées** : Gestion via Supabase Auth
- **JWT tokens** : Tokens signés et vérifiés
- **Refresh tokens** : Renouvellement automatique
- **Role-based access** : Contrôle d'accès par rôles

### Données sensibles

- **Chiffrement en transit** : TLS 1.3
- **Chiffrement au repos** : Chiffrement base de données
- **Anonymisation** : Logs sans données personnelles
- **RGPD compliance** : Respect des réglementations

---

## Tests

### Stratégie de test

1. **Tests unitaires** : Composables et utilitaires (Vitest)
2. **Tests d'intégration** : Workflows utilisateur (Vitest)
3. **Tests de performance** : Charge et stress (Vitest + k6)
4. **Tests E2E** : Scénarios complets (Playwright)

### Couverture de test

- **Composables** : 95%+ de couverture
- **API endpoints** : 90%+ de couverture
- **Composants UI** : 85%+ de couverture
- **Workflows critiques** : 100% de couverture E2E

### Exécution des tests

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Tests de performance
npm run test:performance

# Couverture complète
npm run test:coverage
```

---

## Déploiement

### Environnements

1. **Développement** : Local avec Docker Compose
2. **Staging** : Environnement de test
3. **Production** : Déploiement conteneurisé

### Docker

```dockerfile
# Production optimisée
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 3000
USER node
CMD ["npm", "start"]
```

### Health checks

```yaml
# docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## Monitoring

### Métriques surveillées

1. **Performance** : Temps de réponse, throughput
2. **Erreurs** : Taux d'erreur, erreurs 5xx
3. **Utilisation** : CPU, mémoire, disque
4. **Business** : Utilisateurs actifs, requêtes API

### Alerting

- **Erreurs critiques** : Notification immédiate
- **Performance dégradée** : Alerte après 5 minutes
- **Ressources système** : Seuils configurable

---

## Support et maintenance

### Logs

- **Application** : Logs structurés JSON
- **Accès** : Logs nginx/reverse proxy
- **Erreurs** : Stack traces et contexte
- **Sécurité** : Événements de sécurité

### Maintenance

- **Mises à jour** : Déploiement zero-downtime
- **Sauvegarde** : Snapshots automatiques base de données
- **Monitoring** : Surveillance continue 24/7

---

## Contact et support

- **Documentation** : `/docs/`
- **Issues** : GitHub Issues
- **Support** : support@suivi-sante-ia.com

---

_Dernière mise à jour : 2024-01-15_
