# Architecture Technique - Suivi Santé IA

## Vue d'ensemble de l'architecture

### Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Nuxt 4)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Pages     │  │ Components  │  │  Layouts    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Composables │  │   Stores    │  │ Middleware  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Nitro Server)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ API Routes  │  │ Middleware  │  │   Utils     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Security   │  │ Validation  │  │   Logging   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Supabase      │  │   Google AI     │  │ Google Vision   │
│   (Database +   │  │   (Gemini)      │  │      AI         │
│   Auth)         │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Pile technologique

| Couche               | Technologies                                    |
| -------------------- | ----------------------------------------------- |
| **Frontend**         | Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4       |
| **Backend**          | Nitro (Nuxt Server), Node.js 20+                |
| **Base de données**  | PostgreSQL (Supabase)                           |
| **Authentification** | Supabase Auth (JWT)                             |
| **IA**               | Google Generative AI (Gemini), Google Vision AI |
| **Déploiement**      | Docker, Docker Compose, Nginx                   |
| **Tests**            | Vitest, Playwright, Testing Library             |
| **Monitoring**       | Logs structurés, Health checks                  |

---

## Architecture Frontend (Nuxt 4)

### Structure des dossiers

```
app/
├── assets/                 # Assets (CSS, images)
│   └── css/
├── components/            # Composants Vue réutilisables
│   ├── base/             # Composants de base (Button, Input, etc.)
│   ├── espace/           # Composants spécifiques aux espaces
│   ├── health/           # Composants santé
│   └── ui/               # Composants UI génériques
├── composables/          # Logique métier réutilisable
│   ├── useAuth.ts        # Authentification
│   ├── useMeals.ts       # Gestion des repas
│   ├── useGoogleAI.ts    # Intégration Google AI
│   └── ...
├── layouts/              # Layouts d'application
│   ├── default.vue       # Layout principal
│   ├── auth.vue          # Layout authentification
│   └── admin.vue         # Layout administration
├── pages/                # Pages routées automatiquement
│   ├── index.vue         # Page d'accueil
│   ├── auth/             # Pages d'authentification
│   ├── espace/           # Espaces utilisateur
│   └── admin/            # Interface d'administration
├── middleware/           # Middleware de route
│   ├── auth.ts           # Vérification authentification
│   └── admin.ts          # Vérification rôle admin
├── plugins/              # Plugins Nuxt
├── stores/               # Stores Pinia
├── types/                # Définitions TypeScript
└── utils/                # Utilitaires frontend
```

### Composables et logique métier

#### Architecture des composables

```typescript
// Composable de base
interface ComposableState<T> {
  data: Ref<T | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
}

// Pattern standard
export const useCustomComposable = () => {
  const data = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const operation = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Logique métier
      data.value = await apiCall();
    } catch (err) {
      error.value = handleError(err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    data: readonly(data),
    isLoading: readonly(isLoading),
    error: readonly(error),
    operation,
  };
};
```

#### Gestion des états globaux

```typescript
// stores/auth.ts (Pinia)
export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);

  const login = async (credentials: LoginCredentials) => {
    // Logique de connexion
  };

  const logout = async () => {
    // Logique de déconnexion
    user.value = null;
  };

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
  };
});
```

### Gestion du routing

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useSupabaseUser();

  if (!user.value) {
    return navigateTo("/auth/login");
  }
});

// middleware/admin.ts
export default defineNuxtRouteMiddleware(() => {
  const { user } = useSupabaseUser();

  if (user.value?.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Accès interdit",
    });
  }
});
```

---

## Architecture Backend (Nitro)

### Structure des API

```
server/
├── api/                   # Endpoints API
│   ├── auth/             # Authentification
│   │   └── csrf-token.get.ts
│   ├── vision/           # Analyse d'images
│   │   └── analyze-meal.post.ts
│   ├── ai/               # Intelligence artificielle
│   │   ├── health-chat.post.ts
│   │   ├── generate-recommendations.post.ts
│   │   └── explain-meal.post.ts
│   └── recommendations/  # Recommandations (legacy)
├── middleware/           # Middleware serveur
│   ├── security.ts       # Sécurité globale
│   └── cors.ts           # Configuration CORS
└── utils/                # Utilitaires serveur
    ├── security.ts       # Fonctions de sécurité
    ├── validation.ts     # Validation des données
    └── logger.ts         # Logging
```

### Pattern des endpoints API

```typescript
// server/api/example.post.ts
export default defineEventHandler(async (event) => {
  try {
    // 1. Vérification de la méthode HTTP
    if (!isMethod(event, "POST")) {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
      });
    }

    // 2. Rate limiting
    const clientIP = getClientIP(event);
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: "Trop de requêtes",
      });
    }

    // 3. Protection CSRF
    const csrfToken =
      getCookie(event, "csrf-token") || getHeader(event, "x-csrf-token");
    const sessionToken = getCookie(event, "csrf-session");

    if (!validateCSRFToken(csrfToken, sessionToken)) {
      throw createError({
        statusCode: 403,
        statusMessage: "Token de sécurité invalide",
      });
    }

    // 4. Validation des données
    const body = await readBody(event);
    const validatedData = validateRequestData(body);

    // 5. Logique métier
    const result = await processBusinessLogic(validatedData);

    // 6. Logging des succès
    logSecurityEvent(event, "API_SUCCESS", {
      endpoint: event.path,
      responseTime: Date.now() - startTime,
    });

    // 7. Réponse
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Gestion des erreurs
    logSecurityEvent(event, "API_ERROR", {
      endpoint: event.path,
      error: error.message,
    });

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Erreur interne",
    });
  }
});
```

### Sécurité

#### Protection CSRF

```typescript
// server/utils/security.ts
export const generateCSRFToken = (): string => {
  return jwt.sign(
    {
      type: "csrf",
      timestamp: Date.now(),
      random: crypto.randomBytes(16).toString("hex"),
    },
    config.csrfSecret,
    { expiresIn: "1h" }
  );
};

export const validateCSRFToken = (
  token: string,
  sessionToken: string
): boolean => {
  try {
    const decoded = jwt.verify(token, config.csrfSecret);
    return decoded.type === "csrf" && token === sessionToken;
  } catch {
    return false;
  }
};
```

#### Rate Limiting

```typescript
// Rate limiting en mémoire (production: Redis)
const rateLimitStore = new Map<
  string,
  {
    count: number;
    resetTime: number;
  }
>();

export const checkRateLimit = (
  clientIP: string,
  isUpload = false
): { allowed: boolean; remaining: number } => {
  const limit = isUpload ? 10 : 100; // 10 uploads, 100 requests par 15min
  const windowMs = 15 * 60 * 1000; // 15 minutes

  const now = Date.now();
  const key = `${clientIP}:${isUpload ? "upload" : "standard"}`;

  let entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
  } else {
    entry.count++;
  }

  rateLimitStore.set(key, entry);

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
  };
};
```

#### Validation des uploads

```typescript
export const validateUploadedFile = (
  file: MultiPartData
): { valid: boolean; error?: string } => {
  // Vérifier la taille
  if (file.data && file.data.length > 10 * 1024 * 1024) {
    // 10MB
    return { valid: false, error: "Fichier trop volumineux (max 10MB)" };
  }

  // Vérifier le type MIME
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!file.type || !allowedTypes.includes(file.type)) {
    return { valid: false, error: "Type de fichier non autorisé" };
  }

  // Vérifier l'extension
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const extension = file.filename?.split(".").pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(`.${extension}`)) {
    return { valid: false, error: "Extension de fichier non autorisée" };
  }

  // Validation du contenu (magic numbers)
  if (file.data) {
    const header = file.data.slice(0, 8);
    const isValidImage = validateImageHeader(header);
    if (!isValidImage) {
      return { valid: false, error: "Contenu de fichier invalide" };
    }
  }

  return { valid: true };
};
```

---

## Intégration des services externes

### Google Generative AI (Gemini)

```typescript
// composables/useGoogleGenerativeAI.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export const useGoogleGenerativeAI = () => {
  const config = useRuntimeConfig();

  const generateContent = async (
    prompt: string,
    options?: GenerationOptions
  ) => {
    if (!config.googleAiApiKey) {
      throw new Error("Google AI API key not configured");
    }

    const genAI = new GoogleGenerativeAI(config.googleAiApiKey);
    const model = genAI.getGenerativeModel({
      model: options?.model || "gemini-pro",
    });

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;

      return {
        text: response.text(),
        usage: response.usageMetadata,
        safety: response.candidates?.[0]?.safetyRatings,
      };
    } catch (error) {
      console.error("Google AI Error:", error);
      throw new Error("Erreur lors de la génération de contenu");
    }
  };

  return { generateContent };
};
```

### Google Vision AI

```typescript
// Configuration Vision AI
const createVisionClient = () => {
  const config = useRuntimeConfig();

  return new ImageAnnotatorClient({
    apiKey: config.googleVisionApiKey,
    projectId: config.googleVisionProjectId,
  });
};

// Analyse d'image
export const analyzeImage = async (imageBuffer: Buffer) => {
  const client = createVisionClient();

  const [result] = await client.annotateImage({
    image: { content: imageBuffer.toString("base64") },
    features: [
      { type: "LABEL_DETECTION", maxResults: 20 },
      { type: "OBJECT_LOCALIZATION", maxResults: 20 },
      { type: "TEXT_DETECTION", maxResults: 10 },
    ],
  });

  return {
    labels: result.labelAnnotations || [],
    objects: result.localizedObjectAnnotations || [],
    texts: result.textAnnotations || [],
  };
};
```

### Supabase

```typescript
// Configuration client Supabase
export const createSupabaseClient = () => {
  const config = useRuntimeConfig();

  return createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: "public",
      },
    }
  );
};

// Row Level Security (RLS)
// Les politiques RLS sont définies en SQL :
/*
-- Politique pour les repas
CREATE POLICY "Users can manage their own meals" ON meal_records
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
*/
```

---

## Schéma de base de données

### Tables principales

```sql
-- Table des utilisateurs (étendue de auth.users)
CREATE TABLE users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role user_role DEFAULT 'patient',
  first_name text,
  last_name text,
  phone text,
  date_of_birth date,
  avatar_url text,
  is_active boolean DEFAULT true,
  medical_license text, -- Pour les médecins
  specialization text,   -- Pour les médecins
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Profils utilisateur
CREATE TABLE user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  bio text,
  address text,
  city text,
  postal_code text,
  country text DEFAULT 'France',
  language_preference text DEFAULT 'fr',
  timezone text DEFAULT 'Europe/Paris',
  preferences jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enregistrements de repas
CREATE TABLE meal_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type meal_type NOT NULL, -- 'petit-dejeuner', 'dejeuner', 'diner', 'collation'
  datetime timestamp with time zone NOT NULL,
  foods jsonb NOT NULL DEFAULT '[]',
  notes text,
  satisfaction integer CHECK (satisfaction >= 1 AND satisfaction <= 5),
  hunger_level integer CHECK (hunger_level >= 1 AND hunger_level <= 5),
  photo_url text,
  ai_analysis_text text,
  ai_identified_foods text[],
  ai_confidence numeric(3,2),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Recommandations
CREATE TABLE meal_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  meal_id uuid REFERENCES meal_records(id) ON DELETE SET NULL,
  category recommendation_category NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority recommendation_priority DEFAULT 'medium',
  is_read boolean DEFAULT false,
  is_bookmarked boolean DEFAULT false,
  feedback recommendation_feedback,
  created_at timestamp with time zone DEFAULT now()
);

-- Objectifs de santé
CREATE TABLE health_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type goal_type NOT NULL,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  deadline date,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Messages (chat avec docteurs)
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type message_type DEFAULT 'text',
  is_read boolean DEFAULT false,
  attachments jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now()
);
```

### Types enum

```sql
-- Types énumérés
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE meal_type AS ENUM ('petit-dejeuner', 'dejeuner', 'diner', 'collation');
CREATE TYPE recommendation_category AS ENUM ('nutrition', 'variety', 'portion', 'timing');
CREATE TYPE recommendation_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE recommendation_feedback AS ENUM ('helpful', 'not_helpful', 'very_helpful');
CREATE TYPE goal_type AS ENUM ('weight_loss', 'weight_gain', 'muscle_gain', 'energy', 'nutrition');
CREATE TYPE message_type AS ENUM ('text', 'image', 'document');
```

### Indexes et optimisation

```sql
-- Index pour les performances
CREATE INDEX idx_meal_records_user_datetime ON meal_records(user_id, datetime DESC);
CREATE INDEX idx_meal_recommendations_user_unread ON meal_recommendations(user_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_messages_recipient_unread ON messages(recipient_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_health_goals_user_active ON health_goals(user_id, is_active) WHERE is_active;

-- Index pour la recherche full-text
CREATE INDEX idx_meal_records_foods_gin ON meal_records USING gin(foods);
CREATE INDEX idx_meal_records_ai_foods_gin ON meal_records USING gin(ai_identified_foods);
```

### Politiques RLS (Row Level Security)

```sql
-- Activer RLS
ALTER TABLE meal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour meal_records
CREATE POLICY "Users can manage their own meals" ON meal_records
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour messages
CREATE POLICY "Users can read their messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Politiques pour les docteurs
CREATE POLICY "Doctors can read patient data" ON meal_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'doctor'
    )
  );
```

---

## Tests et Qualité

### Stratégie de test

```typescript
// Configuration Vitest
export default defineConfig({
  test: {
    globals: true,
    environment: "nuxt",
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### Tests unitaires

```typescript
// tests/unit/composables/useMeals.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMeals } from "~/composables/useMeals";

describe("useMeals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load meals for authenticated user", async () => {
    const { loadMeals, meals } = useMeals();

    await loadMeals();

    expect(meals.value).toBeDefined();
    expect(Array.isArray(meals.value)).toBe(true);
  });

  it("should save new meal", async () => {
    const { saveMeal } = useMeals();

    const mealData = {
      type: "dejeuner",
      datetime: new Date().toISOString(),
      foods: [{ name: "Salade", quantity: "1", unit: "bol" }],
    };

    const result = await saveMeal(mealData);

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });
});
```

### Tests d'intégration

```typescript
// tests/integration/meal-workflow.test.ts
import { describe, it, expect } from "vitest";

describe("Meal Workflow Integration", () => {
  it("should complete full meal analysis workflow", async () => {
    // 1. Upload image
    const formData = new FormData();
    formData.append("image", mockImageFile);

    const analysisResponse = await $fetch("/api/vision/analyze-meal", {
      method: "POST",
      headers: { "x-csrf-token": await getCsrfToken() },
      body: formData,
    });

    expect(analysisResponse.success).toBe(true);

    // 2. Save meal with AI analysis
    const mealData = {
      type: "dejeuner",
      datetime: new Date().toISOString(),
      foods: analysisResponse.analysis.foods,
      ai_analysis: JSON.stringify(analysisResponse.analysis),
    };

    // 3. Generate recommendations
    const recommendationsResponse = await $fetch(
      "/api/ai/generate-recommendations",
      {
        method: "POST",
        headers: { "x-csrf-token": await getCsrfToken() },
        body: { meals: [mealData] },
      }
    );

    expect(recommendationsResponse.success).toBe(true);
    expect(recommendationsResponse.recommendations).toBeDefined();
  });
});
```

### Tests E2E avec Playwright

```typescript
// tests/e2e/meal-analysis.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Meal Analysis", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "password");
    await page.click('[data-testid="login-button"]');
  });

  test("should analyze meal image and display results", async ({ page }) => {
    await page.goto("/espace/repas/nouveau");

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("tests/fixtures/meal-image.jpg");

    // Wait for analysis
    await expect(
      page.locator('[data-testid="analysis-results"]')
    ).toBeVisible();

    // Check results
    const foodItems = page.locator('[data-testid="food-item"]');
    await expect(foodItems).toHaveCountGreaterThan(0);

    // Save meal
    await page.click('[data-testid="save-meal-button"]');
    await expect(page.locator(".success-message")).toBeVisible();
  });
});
```

---

## Performance et Optimisation

### Optimisations frontend

#### Lazy loading et code splitting

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: false, // Optimise les payloads
  },
  nitro: {
    minify: true,
    compressPublicAssets: true,
  },
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
      cssnano: process.env.NODE_ENV === "production" ? {} : false,
    },
  },
});
```

#### Optimisation des images

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxt/image"],
  image: {
    format: ["webp", "avif"],
    quality: 80,
    densities: [1, 2],
    sizes: "xs:300px sm:400px md:600px lg:800px xl:1000px",
    domains: ["your-cdn-domain.com"],
  },
});
```

### Optimisations backend

#### Cache et mémoire

```typescript
// server/utils/cache.ts
const cache = new Map<string, { data: any; expires: number }>();

export const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

export const setCachedData = <T>(
  key: string,
  data: T,
  ttlMs: number = 300000 // 5 minutes
): void => {
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs,
  });
};
```

#### Optimisation des requêtes DB

```typescript
// Exemple d'optimisation avec pagination et filtres
export const loadMealsOptimized = async (
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    dateFrom?: string;
    dateTo?: string;
  } = {}
) => {
  const { limit = 20, offset = 0, dateFrom, dateTo } = options;

  let query = supabase
    .from("meal_records")
    .select(
      `
      id,
      type,
      datetime,
      foods,
      satisfaction,
      ai_confidence
    `
    )
    .eq("user_id", userId)
    .order("datetime", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dateFrom) {
    query = query.gte("datetime", dateFrom);
  }
  if (dateTo) {
    query = query.lte("datetime", dateTo);
  }

  return await query;
};
```

---

## Monitoring et Observabilité

### Logging structuré

```typescript
// server/utils/logger.ts
interface LogEvent {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    const event: LogEvent = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    console.log(JSON.stringify(event));
  },

  error: (message: string, error?: Error, context?: Record<string, any>) => {
    const event: LogEvent = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      },
    };
    console.error(JSON.stringify(event));
  },
};
```

### Métriques de performance

```typescript
// server/middleware/metrics.ts
const metrics = {
  requestCount: 0,
  responseTime: [] as number[],
  errorCount: 0,
};

export default defineEventHandler(async (event) => {
  const start = Date.now();
  metrics.requestCount++;

  try {
    // Continuer avec la requête
  } catch (error) {
    metrics.errorCount++;
    throw error;
  } finally {
    const duration = Date.now() - start;
    metrics.responseTime.push(duration);

    // Garder seulement les 1000 dernières mesures
    if (metrics.responseTime.length > 1000) {
      metrics.responseTime = metrics.responseTime.slice(-1000);
    }
  }
});

// Endpoint pour les métriques
export default defineEventHandler(() => {
  const avgResponseTime =
    metrics.responseTime.length > 0
      ? metrics.responseTime.reduce((a, b) => a + b, 0) /
        metrics.responseTime.length
      : 0;

  return {
    requestCount: metrics.requestCount,
    errorCount: metrics.errorCount,
    avgResponseTime,
    uptime: process.uptime(),
  };
});
```

---

## Sécurité

### Headers de sécurité

```typescript
// server/middleware/security.ts
export default defineEventHandler(async (event) => {
  // Headers de sécurité
  setHeader(event, "X-Frame-Options", "DENY");
  setHeader(event, "X-Content-Type-Options", "nosniff");
  setHeader(event, "X-XSS-Protection", "1; mode=block");
  setHeader(event, "Referrer-Policy", "strict-origin-when-cross-origin");
  setHeader(
    event,
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // CSP
  setHeader(
    event,
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // À restreindre en production
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.supabase.co https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );
});
```

### Audit de sécurité

```typescript
// scripts/security-audit.ts
import { execSync } from "child_process";

const runSecurityAudit = () => {
  console.log("🔍 Audit de sécurité...");

  // Audit npm
  try {
    execSync("npm audit --audit-level moderate", { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Vulnérabilités détectées dans les dépendances");
    process.exit(1);
  }

  // Vérification des variables d'environnement
  const requiredEnvVars = [
    "GOOGLE_AI_API_KEY",
    "GOOGLE_VISION_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "CSRF_SECRET",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  if (missingVars.length > 0) {
    console.error(
      `❌ Variables d'environnement manquantes: ${missingVars.join(", ")}`
    );
    process.exit(1);
  }

  console.log("✅ Audit de sécurité réussi");
};

runSecurityAudit();
```

---

Cette architecture technique fournit une base solide, sécurisée et performante pour l'application Suivi Santé IA, avec une séparation claire des responsabilités et des patterns éprouvés pour la scalabilité.

_Dernière mise à jour : 2024-01-15_
