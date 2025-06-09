# Guide d'intégration développeur - Suivi Santé IA

## Installation et configuration

### Prérequis

- Node.js 20+
- Docker et Docker Compose
- Compte Supabase
- Clés API Google (AI et Vision)

### Installation rapide

```bash
# Cloner le projet
git clone https://github.com/your-org/suivi-sante-ia.git
cd suivi-sante-ia/nuxt-app

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Démarrer en développement
npm run dev

# Ou avec Docker
docker-compose -f ../docker-compose.dev.yml up
```

### Configuration des API

#### Google AI (Gemini)

1. Créer un projet sur [Google AI Studio](https://makersuite.google.com/)
2. Générer une clé API
3. Ajouter à `.env` :

```env
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

#### Google Vision AI

1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Activer l'API Vision
3. Créer un compte de service et télécharger les credentials JSON
4. Configurer dans `.env` :

```env
GOOGLE_VISION_API_KEY=your_vision_api_key_here
```

#### Supabase

1. Créer un projet sur [Supabase](https://supabase.com/)
2. Récupérer les clés API
3. Configurer dans `.env` :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Intégration des composables

### Authentification

```vue
<script setup>
const { user, signIn, signOut, signUp } = useAuth();

// Connexion
const login = async () => {
  const { data, error } = await signIn(email.value, password.value);
  if (error) {
    console.error("Erreur connexion:", error);
  }
};

// Vérifier l'authentification
watchEffect(() => {
  if (!user.value) {
    // Rediriger vers login
    navigateTo("/auth/login");
  }
});
</script>
```

### Analyse de repas

```vue
<script setup>
const { analyzeMealImage, isLoading, error } = useGoogleVisionAI();
const { saveMeal } = useMeals();

const analyzePhoto = async (file: File) => {
  try {
    // Analyser l'image
    const analysis = await analyzeMealImage(file);

    if (analysis.success) {
      // Créer le repas
      const mealData = {
        type: "dejeuner",
        datetime: new Date().toISOString(),
        foods: analysis.foods,
        ai_analysis: JSON.stringify(analysis),
        ai_confidence: analysis.confidence,
      };

      // Sauvegarder
      await saveMeal(mealData);
    }
  } catch (err) {
    console.error("Erreur analyse:", err);
  }
};
</script>

<template>
  <div>
    <input
      type="file"
      accept="image/*"
      @change="analyzePhoto($event.target.files[0])"
    />
    <div v-if="isLoading">Analyse en cours...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>
```

### Chatbot santé

```vue
<script setup>
const { sendMessage, conversationHistory, isLoading } = useHealthChatbot();

const userMessage = ref("");

const sendChatMessage = async () => {
  if (!userMessage.value.trim()) return;

  try {
    await sendMessage(userMessage.value);
    userMessage.value = "";
  } catch (error) {
    console.error("Erreur chatbot:", error);
  }
};
</script>

<template>
  <div class="chat-container">
    <!-- Historique -->
    <div class="messages">
      <div
        v-for="message in conversationHistory"
        :key="message.timestamp"
        :class="['message', message.role]"
      >
        {{ message.content }}
      </div>
    </div>

    <!-- Input -->
    <form @submit.prevent="sendChatMessage">
      <input
        v-model="userMessage"
        placeholder="Posez votre question santé..."
        :disabled="isLoading"
      />
      <button type="submit" :disabled="isLoading">Envoyer</button>
    </form>
  </div>
</template>
```

### Gestion des repas

```vue
<script setup>
const { meals, loadMeals, saveMeal, updateMeal, deleteMeal, isLoading } =
  useMeals();

// Charger les repas au montage
onMounted(() => {
  loadMeals();
});

// Ajouter un repas
const addMeal = async () => {
  const mealData = {
    type: "petit-dejeuner",
    datetime: new Date().toISOString(),
    foods: [
      {
        name: "Pain complet",
        quantity: "2",
        unit: "tranches",
      },
    ],
    satisfaction: 4,
    hunger_level: 2,
  };

  await saveMeal(mealData);
  await loadMeals(); // Recharger la liste
};
</script>

<template>
  <div>
    <button @click="addMeal">Ajouter un repas</button>

    <div v-if="isLoading">Chargement...</div>

    <div class="meals-list">
      <div v-for="meal in meals" :key="meal.id" class="meal-card">
        <h3>{{ meal.type }}</h3>
        <p>{{ new Date(meal.datetime).toLocaleDateString() }}</p>
        <ul>
          <li v-for="food in meal.foods" :key="food.name">
            {{ food.name }} - {{ food.quantity }} {{ food.unit }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
```

---

## Appels API directs

### Avec protection CSRF

```typescript
// Récupérer le token CSRF
const getCsrfToken = async () => {
  const response = await $fetch("/api/auth/csrf-token");
  return response.csrfToken;
};

// Faire un appel sécurisé
const secureApiCall = async (endpoint: string, data: any) => {
  const csrfToken = await getCsrfToken();

  return await $fetch(endpoint, {
    method: "POST",
    headers: {
      "x-csrf-token": csrfToken,
    },
    body: data,
  });
};

// Exemple d'utilisation
const generateRecommendations = async (mealsData: any) => {
  return await secureApiCall("/api/ai/generate-recommendations", {
    meals: mealsData,
    userPreferences: {
      dietary_restrictions: ["végétarien"],
      goals: ["perte_poids"],
    },
  });
};
```

### Upload d'image

```typescript
const uploadMealImage = async (file: File) => {
  const csrfToken = await getCsrfToken();

  const formData = new FormData();
  formData.append("image", file);

  return await $fetch("/api/vision/analyze-meal", {
    method: "POST",
    headers: {
      "x-csrf-token": csrfToken,
    },
    body: formData,
  });
};
```

---

## Gestion des erreurs

### Intercepteur global

```typescript
// plugins/api-interceptor.ts
export default defineNuxtPlugin(() => {
  // Intercepteur pour les erreurs API
  $fetch.create({
    onResponseError({ response }) {
      const { statusCode, statusMessage } = response._data;

      // Gestion spécifique par code d'erreur
      switch (statusCode) {
        case 401:
          // Rediriger vers login
          navigateTo("/auth/login");
          break;
        case 403:
          // Token CSRF expiré, renouveler
          return refreshCsrfAndRetry();
        case 429:
          // Rate limit, afficher notification
          showNotification("Trop de requêtes, veuillez patienter");
          break;
        default:
          // Erreur générique
          showNotification(`Erreur: ${statusMessage}`);
      }
    },
  });
});
```

### Gestion d'erreur dans les composables

```typescript
// composables/useApiError.ts
export const useApiError = () => {
  const handleError = (error: any) => {
    console.error("API Error:", error);

    if (error.statusCode === 401) {
      // Non authentifié
      return "Veuillez vous connecter";
    } else if (error.statusCode === 403) {
      // Accès interdit
      return "Accès non autorisé";
    } else if (error.statusCode === 429) {
      // Rate limit
      return "Trop de requêtes, veuillez patienter";
    } else if (error.statusCode >= 500) {
      // Erreur serveur
      return "Erreur serveur, veuillez réessayer";
    } else {
      // Erreur client
      return error.statusMessage || "Une erreur est survenue";
    }
  };

  return { handleError };
};
```

---

## Composants UI

### Composant d'upload d'image

```vue
<!-- components/MealImageUpload.vue -->
<script setup lang="ts">
interface Props {
  modelValue?: File | null;
  disabled?: boolean;
}

interface Emits {
  "update:modelValue": [value: File | null];
  analyze: [file: File];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();
const isDragOver = ref(false);

const handleFileSelect = (file: File) => {
  // Validation
  if (!file.type.startsWith("image/")) {
    throw new Error("Veuillez sélectionner une image");
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    throw new Error("Image trop volumineuse (max 10MB)");
  }

  emit("update:modelValue", file);
  emit("analyze", file);
};

const onFileChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files?.[0]) {
    handleFileSelect(files[0]);
  }
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files?.[0]) {
    handleFileSelect(files[0]);
  }
};
</script>

<template>
  <div
    class="upload-zone"
    :class="{ 'drag-over': isDragOver, disabled }"
    @click="fileInput?.click()"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @drop="onDrop"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      :disabled="disabled"
      @change="onFileChange"
    />

    <div class="upload-content">
      <Icon name="camera" class="upload-icon" />
      <p>Cliquez ou glissez une image de repas</p>
      <p class="text-sm text-gray-500">JPG, PNG, WebP (max 10MB)</p>
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary-500;
}

.upload-zone.drag-over {
  @apply border-primary-500 bg-primary-50;
}

.upload-zone.disabled {
  @apply opacity-50 cursor-not-allowed;
}

.upload-content {
  @apply flex flex-col items-center gap-2;
}

.upload-icon {
  @apply w-12 h-12 text-gray-400;
}
</style>
```

### Composant de chatbot

```vue
<!-- components/HealthChatbot.vue -->
<script setup lang="ts">
const { sendMessage, conversationHistory, isLoading, error } =
  useHealthChatbot();

const messageInput = ref("");
const messagesContainer = ref<HTMLElement>();

const sendUserMessage = async () => {
  if (!messageInput.value.trim() || isLoading.value) return;

  try {
    await sendMessage(messageInput.value);
    messageInput.value = "";

    // Scroll vers le bas
    nextTick(() => {
      messagesContainer.value?.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: "smooth",
      });
    });
  } catch (err) {
    console.error("Erreur chatbot:", err);
  }
};
</script>

<template>
  <div class="chatbot-container">
    <!-- Messages -->
    <div ref="messagesContainer" class="messages-container">
      <div
        v-for="message in conversationHistory"
        :key="message.timestamp"
        class="message"
        :class="message.role"
      >
        <div class="message-content">
          {{ message.content }}
        </div>
        <div class="message-time">
          {{ new Date(message.timestamp).toLocaleTimeString() }}
        </div>
      </div>

      <!-- Indicateur de frappe -->
      <div v-if="isLoading" class="message assistant typing">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Input -->
    <form @submit.prevent="sendUserMessage" class="message-form">
      <div class="input-container">
        <textarea
          v-model="messageInput"
          placeholder="Posez votre question sur la santé et la nutrition..."
          class="message-input"
          :disabled="isLoading"
          rows="1"
          @keydown.enter.prevent="sendUserMessage"
        />
        <button
          type="submit"
          class="send-button"
          :disabled="isLoading || !messageInput.trim()"
        >
          <Icon name="send" />
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.chatbot-container {
  @apply flex flex-col h-96 border rounded-lg overflow-hidden;
}

.messages-container {
  @apply flex-1 p-4 space-y-4 overflow-y-auto;
}

.message {
  @apply flex flex-col;
}

.message.user {
  @apply items-end;
}

.message.assistant {
  @apply items-start;
}

.message-content {
  @apply max-w-xs lg:max-w-md px-4 py-2 rounded-lg;
}

.message.user .message-content {
  @apply bg-primary-500 text-white;
}

.message.assistant .message-content {
  @apply bg-gray-200 text-gray-900;
}

.message-time {
  @apply text-xs text-gray-500 mt-1;
}

.typing-indicator {
  @apply flex space-x-1 px-4 py-2;
}

.typing-indicator span {
  @apply w-2 h-2 bg-gray-400 rounded-full animate-pulse;
}

.message-form {
  @apply border-t p-4;
}

.input-container {
  @apply flex items-end space-x-2;
}

.message-input {
  @apply flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.send-button {
  @apply p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
```

---

## Tests

### Tests unitaires des composables

```typescript
// tests/unit/composables/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "~/composables/useAuth";

// Mock Supabase
vi.mock("@nuxtjs/supabase", () => ({
  useSupabaseClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  }),
  useSupabaseUser: () => ({ value: null }),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should sign in user", async () => {
    const { signIn } = useAuth();

    const result = await signIn("test@example.com", "password");

    expect(result.error).toBeNull();
  });

  it("should handle sign in errors", async () => {
    const { signIn } = useAuth();

    // Mock error
    vi.mocked(useSupabaseClient().auth.signInWithPassword).mockResolvedValue({
      data: null,
      error: { message: "Invalid credentials" },
    });

    const result = await signIn("test@example.com", "wrong-password");

    expect(result.error).toBeDefined();
  });
});
```

### Tests d'intégration API

```typescript
// tests/integration/api/vision.test.ts
import { describe, it, expect } from "vitest";

describe("Vision API Integration", () => {
  it("should analyze meal image", async () => {
    // Créer une image de test
    const testImage = new File(["test"], "test.jpg", { type: "image/jpeg" });

    // Récupérer token CSRF
    const csrfResponse = await $fetch("/api/auth/csrf-token");

    // Créer FormData
    const formData = new FormData();
    formData.append("image", testImage);

    // Appel API
    const response = await $fetch("/api/vision/analyze-meal", {
      method: "POST",
      headers: {
        "x-csrf-token": csrfResponse.csrfToken,
      },
      body: formData,
    });

    expect(response.success).toBe(true);
    expect(response.analysis).toBeDefined();
    expect(response.analysis.foods).toBeInstanceOf(Array);
  });
});
```

---

## Optimisation des performances

### Lazy loading des composants

```vue
<script setup>
// Chargement différé des composants lourds
const HealthChatbot = defineAsyncComponent(() =>
  import("~/components/HealthChatbot.vue")
);

const MealAnalysis = defineAsyncComponent(() =>
  import("~/components/MealAnalysis.vue")
);
</script>

<template>
  <div>
    <!-- Chargés seulement quand nécessaire -->
    <Suspense>
      <HealthChatbot v-if="showChatbot" />
      <template #fallback>
        <div>Chargement du chatbot...</div>
      </template>
    </Suspense>
  </div>
</template>
```

### Cache des appels API

```typescript
// composables/useApiCache.ts
export const useApiCache = () => {
  const cache = new Map();

  const cachedFetch = async (url: string, options: any = {}) => {
    const cacheKey = `${url}:${JSON.stringify(options)}`;

    // Vérifier le cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        // 5 min
        return cached.data;
      }
    }

    // Faire l'appel
    const data = await $fetch(url, options);

    // Mettre en cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  };

  return { cachedFetch };
};
```

### Optimisation des images

```vue
<template>
  <!-- Image optimisée avec lazy loading -->
  <NuxtImg
    :src="mealImage"
    :alt="mealDescription"
    loading="lazy"
    format="webp"
    quality="80"
    sizes="sm:300px md:500px lg:700px"
    class="meal-image"
  />
</template>
```

---

## Déploiement

### Variables d'environnement de production

```env
# Production
NODE_ENV=production
NUXT_PUBLIC_APP_URL=https://suivi-sante-ia.com

# API Keys (utiliser des secrets)
GOOGLE_AI_API_KEY=prod_api_key
GOOGLE_VISION_API_KEY=prod_vision_key

# Database
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_key

# Security
CSRF_SECRET=strong_random_secret_key
RATE_LIMIT_SECRET=another_random_secret
```

### Configuration Nginx

```nginx
# nginx.conf
server {
    listen 80;
    server_name suivi-sante-ia.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name suivi-sante-ia.com;

    ssl_certificate /etc/ssl/certs/suivi-sante-ia.crt;
    ssl_certificate_key /etc/ssl/private/suivi-sante-ia.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location / {
        proxy_pass http://nuxt-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://nuxt-app:3000;
        # ... autres configs proxy
    }
}
```

### Monitoring avec health checks

```typescript
// server/api/health.get.ts
export default defineEventHandler(async (event) => {
  try {
    // Vérifier la base de données
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error) throw error;

    // Vérifier les APIs externes
    const aiStatus = await checkGoogleAI();
    const visionStatus = await checkGoogleVision();

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "healthy",
        google_ai: aiStatus ? "healthy" : "degraded",
        google_vision: visionStatus ? "healthy" : "degraded",
      },
    };
  } catch (error) {
    setResponseStatus(event, 503);
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
});
```

---

## FAQ Développeur

### Comment ajouter un nouvel endpoint API ?

1. Créer le fichier dans `server/api/`
2. Implémenter la sécurité (CSRF, rate limiting)
3. Ajouter la validation des données
4. Documenter dans l'API doc
5. Créer les tests

### Comment personnaliser les recommandations IA ?

Modifier le prompt dans `useGoogleGenerativeAI` :

```typescript
const customPrompt = `
Vous êtes un nutritionniste expert. 
Analysez ces données de repas et fournissez des recommandations personnalisées.
Contexte utilisateur: ${userContext}
Données repas: ${mealData}
Format de réponse: JSON avec recommandations structurées.
`;
```

### Comment ajouter une nouvelle fonctionnalité ?

1. Créer le composable dans `composables/`
2. Ajouter les types dans `types/`
3. Créer les composants UI
4. Ajouter les tests
5. Documenter l'utilisation

---

_Guide mis à jour le 2024-01-15_
