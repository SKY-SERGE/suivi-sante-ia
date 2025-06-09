# Guide d'Optimisation Performance - Suivi Santé IA

## Vue d'ensemble

Ce guide détaille les optimisations de performance mises en place et les bonnes pratiques à suivre pour maintenir une application rapide et efficace.

## 🚀 Optimisations actuelles

### 1. Frontend (Nuxt/Vue)

#### Code Splitting et Lazy Loading

```typescript
// Lazy loading des pages
const PatientDashboard = defineAsyncComponent(
  () => import("~/pages/patient/dashboard.vue")
);

// Lazy loading des composants lourds
const HealthChart = defineAsyncComponent(
  () => import("~/components/health/HealthChart.vue")
);

// Composables avec lazy evaluation
export const useHeavyProcessing = () => {
  const processor = computed(() => {
    // Calculs coûteux seulement si nécessaire
    return createExpensiveProcessor();
  });

  return { processor };
};
```

#### Optimisation des images

```vue
<template>
  <!-- Images optimisées avec Nuxt Image -->
  <NuxtImg
    :src="mealPhoto"
    :alt="mealDescription"
    format="webp"
    quality="80"
    sizes="sm:100vw md:50vw lg:400px"
    loading="lazy"
    placeholder
  />
</template>
```

#### Mise en cache intelligente

```typescript
// Cache des requêtes API avec TTL
export const useApiCache = () => {
  const cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  const getCached = <T>(key: string, ttl = 300000): T | null => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  };

  const setCached = <T>(key: string, data: T, ttl = 300000): void => {
    cache.set(key, { data, timestamp: Date.now(), ttl });
  };

  return { getCached, setCached };
};

// Utilisation dans les composables
export const useMealsOptimized = () => {
  const { getCached, setCached } = useApiCache();

  const fetchMeals = async (refresh = false) => {
    const cacheKey = `meals-${user.value?.id}`;

    if (!refresh) {
      const cached = getCached(cacheKey);
      if (cached) {
        meals.value = cached;
        return;
      }
    }

    // Fetch depuis l'API
    const data = await $fetch("/api/meals");
    setCached(cacheKey, data);
    meals.value = data;
  };
};
```

#### Virtualisation des listes

```vue
<template>
  <!-- Pour de grandes listes de données -->
  <VirtualList
    :items="meals"
    :item-height="120"
    :container-height="600"
    v-slot="{ item }"
  >
    <MealCard :meal="item" />
  </VirtualList>
</template>

<script setup>
// Composant de virtualisation personnalisé
const VirtualList = defineAsyncComponent(() =>
  import("~/components/ui/VirtualList.vue")
);
</script>
```

### 2. Backend API

#### Optimisation des requêtes Supabase

```typescript
// Requêtes optimisées avec select spécifique
export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseServiceClient();

  // ❌ Mauvais : sélectionne tout
  // const { data } = await supabase.from('meals').select('*')

  // ✅ Bon : sélectionne seulement les champs nécessaires
  const { data } = await supabase
    .from("meals")
    .select(
      `
      id,
      type,
      datetime,
      foods:meal_foods(
        name,
        quantity,
        calories
      )
    `
    )
    .eq("user_id", userId)
    .order("datetime", { ascending: false })
    .limit(20); // Pagination

  return data;
});
```

#### Cache des réponses API

```typescript
// Middleware de cache pour les endpoints
export default defineEventHandler(async (event) => {
  const url = getRouterParam(event, "url");
  const cacheKey = `api-${url}-${JSON.stringify(getQuery(event))}`;

  // Vérifier le cache Redis/Memory
  const cached = await getCachedResponse(cacheKey);
  if (cached) {
    setHeader(event, "X-Cache", "HIT");
    return cached;
  }

  // Traitement normal
  const response = await processRequest(event);

  // Mettre en cache pour 5 minutes
  await setCachedResponse(cacheKey, response, 300);
  setHeader(event, "X-Cache", "MISS");

  return response;
});
```

#### Compression des réponses

```typescript
// Compression automatique des réponses JSON
export default defineEventHandler(async (event) => {
  const response = await processApiRequest(event);

  // Compresser les grandes réponses
  if (JSON.stringify(response).length > 1024) {
    setHeader(event, "Content-Encoding", "gzip");
    return compressResponse(response);
  }

  return response;
});
```

### 3. Base de données

#### Index optimisés

```sql
-- Index pour les requêtes de repas par utilisateur
CREATE INDEX idx_meals_user_datetime ON meals(user_id, datetime DESC);

-- Index pour les recherches de nourriture
CREATE INDEX idx_foods_name_gin ON foods USING gin(to_tsvector('french', name));

-- Index partiel pour les messages non lus
CREATE INDEX idx_messages_unread ON messages(recipient_id, created_at)
WHERE read_at IS NULL;
```

#### Requêtes optimisées avec RLS

```sql
-- Policy optimisée pour l'accès aux repas
CREATE POLICY "Users can view own meals efficiently" ON meals
FOR SELECT USING (
  auth.uid() = user_id
);

-- Vue matérialisée pour les statistiques
CREATE MATERIALIZED VIEW meal_statistics AS
SELECT
  user_id,
  DATE_TRUNC('week', datetime) as week,
  COUNT(*) as meal_count,
  AVG(total_calories) as avg_calories
FROM meals
GROUP BY user_id, week;

-- Rafraîchissement automatique
SELECT cron.schedule('refresh-meal-stats', '0 2 * * *',
  'REFRESH MATERIALIZED VIEW meal_statistics;');
```

### 4. Intégrations externes

#### Optimisation des appels API

```typescript
// Batch des requêtes Google Vision
export const useBatchVisionAnalysis = () => {
  const queue = ref<File[]>([]);
  const results = ref<Map<string, any>>(new Map());

  const processQueue = debounce(async () => {
    if (queue.value.length === 0) return;

    // Traiter par batch de 5 images max
    const batch = queue.value.splice(0, 5);

    try {
      const batchResults = await $fetch("/api/vision/batch-analyze", {
        method: "POST",
        body: { images: batch },
      });

      batchResults.forEach((result, index) => {
        results.value.set(batch[index].name, result);
      });
    } catch (error) {
      console.error("Batch analysis failed:", error);
    }
  }, 1000);

  const addToQueue = (file: File) => {
    queue.value.push(file);
    processQueue();
  };

  return { addToQueue, results };
};
```

#### Cache intelligent des réponses IA

```typescript
// Cache des réponses Gemini par hash du contenu
export const useGeminiCache = () => {
  const getCachedResponse = async (prompt: string): Promise<string | null> => {
    const hash = await hashPrompt(prompt);
    const cached = await kv.get(`gemini:${hash}`);
    return cached?.response || null;
  };

  const setCachedResponse = async (
    prompt: string,
    response: string
  ): Promise<void> => {
    const hash = await hashPrompt(prompt);
    await kv.set(
      `gemini:${hash}`,
      { response, timestamp: Date.now() },
      {
        ex: 86400, // 24h TTL
      }
    );
  };

  const hashPrompt = async (prompt: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(prompt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  return { getCachedResponse, setCachedResponse };
};
```

## 📊 Métriques de performance

### 1. Web Vitals cibles

- **FCP (First Contentful Paint)** : < 1.5s
- **LCP (Largest Contentful Paint)** : < 2.5s
- **FID (First Input Delay)** : < 100ms
- **CLS (Cumulative Layout Shift)** : < 0.1
- **TTFB (Time to First Byte)** : < 600ms

### 2. Métriques API

- **Response Time** : < 200ms (95e percentile)
- **Throughput** : > 1000 req/s
- **Error Rate** : < 0.1%
- **Availability** : > 99.9%

### 3. Monitoring

```typescript
// Monitoring des performances en temps réel
export const usePerformanceMonitoring = () => {
  const trackPageLoad = (pageName: string) => {
    const navigationStart = performance.timeOrigin;
    const loadComplete = performance.now();

    // Envoyer les métriques
    $fetch("/api/analytics/performance", {
      method: "POST",
      body: {
        page: pageName,
        loadTime: loadComplete,
        timestamp: navigationStart,
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType,
      },
    }).catch(console.error);
  };

  const trackApiCall = async (endpoint: string, startTime: number) => {
    const duration = performance.now() - startTime;

    if (duration > 1000) {
      // Log slow queries
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
    }

    // Métriques pour dashboard
    await $fetch("/api/analytics/api-performance", {
      method: "POST",
      body: {
        endpoint,
        duration,
        timestamp: Date.now(),
      },
    }).catch(console.error);
  };

  return { trackPageLoad, trackApiCall };
};
```

## 🛠️ Optimisations avancées

### 1. Service Worker pour cache offline

```typescript
// sw.js - Service Worker pour cache intelligent
const CACHE_NAME = "suivi-sante-v1";
const STATIC_CACHE = [
  "/",
  "/patient/dashboard",
  "/assets/css/main.css",
  "/assets/js/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE))
  );
});

self.addEventListener("fetch", (event) => {
  // Stratégie Cache First pour les assets statiques
  if (event.request.url.includes("/assets/")) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => response || fetch(event.request))
    );
    return;
  }

  // Stratégie Network First pour les API
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

### 2. Optimisation du rendu

```vue
<template>
  <div>
    <!-- Utiliser v-memo pour éviter les re-rendus inutiles -->
    <MealCard
      v-for="meal in meals"
      :key="meal.id"
      :meal="meal"
      v-memo="[meal.id, meal.updated_at]"
    />

    <!-- Lazy loading conditionnel -->
    <LazyComponent v-if="shouldLoadHeavyComponent">
      <HeavyDataVisualization :data="chartData" />
    </LazyComponent>
  </div>
</template>

<script setup>
// Optimiser les computed avec shallow ref
const meals = shallowRef([]);
const chartData = computed(() => {
  // Calcul coûteux seulement si nécessaire
  return processChartData(meals.value);
});

// Utiliser des watchers optimisés
watchEffect(
  () => {
    // Re-exécute seulement si meals change
    updateMealStatistics(meals.value);
  },
  { flush: "post" }
);

// Debounce des actions utilisateur
const searchQuery = ref("");
const debouncedSearch = debounce((query) => {
  searchMeals(query);
}, 300);

watch(searchQuery, debouncedSearch);
</script>
```

### 3. Optimisation des WebSockets

```typescript
// Connexion WebSocket optimisée pour les messages temps réel
export const useOptimizedWebSocket = () => {
  const ws = ref<WebSocket | null>(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (ws.value?.readyState === WebSocket.OPEN) return;

    ws.value = new WebSocket(wsUrl);

    ws.value.onopen = () => {
      reconnectAttempts.value = 0;
      console.log("WebSocket connected");
    };

    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Traitement optimisé des messages
      nextTick(() => {
        handleMessage(data);
      });
    };

    ws.value.onclose = () => {
      if (reconnectAttempts.value < maxReconnectAttempts) {
        const delay = Math.pow(2, reconnectAttempts.value) * 1000;
        setTimeout(() => {
          reconnectAttempts.value++;
          connect();
        }, delay);
      }
    };
  };

  const sendMessage = (message: any) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message));
    } else {
      // Queue messages si déconnecté
      messageQueue.push(message);
    }
  };

  return { connect, sendMessage };
};
```

## 📈 Tests de performance

### 1. Benchmarks automatisés

```typescript
// tests/performance/api-benchmarks.test.ts
import { describe, it, expect } from "vitest";
import { performance } from "perf_hooks";

describe("API Performance", () => {
  it("should respond to /api/meals within 200ms", async () => {
    const start = performance.now();

    const response = await $fetch("/api/meals", {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    const duration = performance.now() - start;

    expect(response).toBeDefined();
    expect(duration).toBeLessThan(200);
  });

  it("should handle 100 concurrent requests", async () => {
    const promises = Array.from({ length: 100 }, () => $fetch("/api/health"));

    const start = performance.now();
    const results = await Promise.allSettled(promises);
    const duration = performance.now() - start;

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    expect(successCount).toBeGreaterThan(95); // 95% success rate
    expect(duration).toBeLessThan(5000); // 5s pour 100 requêtes
  });
});
```

### 2. Tests de charge avec k6

```javascript
// tests/load/api-load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // Montée
    { duration: "1m", target: 50 }, // Plateau
    { duration: "30s", target: 0 }, // Descente
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"], // 95% sous 200ms
    http_req_failed: ["rate<0.01"], // Moins de 1% d'erreurs
  },
};

export default function () {
  const response = http.get("https://app.example.com/api/meals", {
    headers: { Authorization: `Bearer ${__ENV.API_TOKEN}` },
  });

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 200ms": (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

## 🔧 Outils et monitoring

### 1. Performance Budget

```json
{
  "budgets": [
    {
      "type": "bundle",
      "name": "initial",
      "maximumWarning": "300kb",
      "maximumError": "500kb"
    },
    {
      "type": "initial",
      "maximumWarning": "2s",
      "maximumError": "3s"
    }
  ]
}
```

### 2. Monitoring continu

```typescript
// Monitoring des métriques critiques
export const setupPerformanceMonitoring = () => {
  // Core Web Vitals
  import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });

  // Long tasks monitoring
  if ("PerformanceObserver" in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn("Long task detected:", entry);
          // Envoyer à analytics
        }
      });
    });
    observer.observe({ entryTypes: ["longtask"] });
  }
};
```

## 📋 Checklist d'optimisation

### Frontend

- [ ] Lazy loading des routes et composants
- [ ] Optimisation des images (WebP, tailles multiples)
- [ ] Minification CSS/JS
- [ ] Tree shaking des dépendances inutiles
- [ ] Service Worker pour cache offline
- [ ] Preloading des ressources critiques
- [ ] Virtual scrolling pour grandes listes
- [ ] Debounce des actions utilisateur

### Backend

- [ ] Index de base de données optimisés
- [ ] Cache des requêtes fréquentes
- [ ] Compression des réponses
- [ ] Pagination des grandes listes
- [ ] Connection pooling
- [ ] Rate limiting
- [ ] Monitoring des requêtes lentes

### Infrastructure

- [ ] CDN pour assets statiques
- [ ] Compression Gzip/Brotli
- [ ] HTTP/2 activé
- [ ] Certificats SSL optimisés
- [ ] Load balancing si nécessaire
- [ ] Base de données répliquée
- [ ] Monitoring des métriques système

---

💡 **Performance is a feature** - Ces optimisations garantissent une expérience utilisateur fluide et réactive sur tous les appareils.
