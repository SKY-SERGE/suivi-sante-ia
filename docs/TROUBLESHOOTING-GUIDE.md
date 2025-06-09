# Guide de Dépannage - Suivi Santé IA

## 🎯 Vue d'ensemble

Ce guide complet vous aide à résoudre les problèmes courants rencontrés avec **Suivi Santé IA**, que vous soyez utilisateur final, développeur ou administrateur.

## 📱 Problèmes utilisateur (Patients)

### 1. Connexion et authentification

#### ❌ "Email ou mot de passe incorrect"

**Causes possibles :**

- Mot de passe oublié
- Email non confirmé
- Compte suspendu/désactivé
- Erreur de saisie

**Solutions :**

1. **Vérifiez la saisie** :

   ```
   ✅ Email exact (sans espaces)
   ✅ Majuscules/minuscules du mot de passe
   ✅ Caractères spéciaux corrects
   ```

2. **Réinitialisation mot de passe** :

   - Cliquez sur "Mot de passe oublié"
   - Vérifiez votre boîte email (+ spam)
   - Suivez le lien de réinitialisation

3. **Vérification email** :

   - Cherchez l'email de confirmation dans votre boîte
   - Cliquez sur "Renvoyer l'email de confirmation"

4. **Contact support** si le problème persiste :
   - Email : support@suivi-sante-ia.app
   - Chat en ligne dans l'application

#### ❌ "Votre compte est temporairement bloqué"

**Causes :**

- Trop de tentatives de connexion échouées
- Activité suspecte détectée

**Solutions :**

1. **Attendre 30 minutes** avant nouvelle tentative
2. **Changer de mot de passe** par précaution
3. **Contacter le support** si récurrent

### 2. Analyse de photos de repas

#### ❌ "Impossible d'analyser cette photo"

**Causes courantes :**

- Photo floue ou mal éclairée
- Format de fichier non supporté
- Taille de fichier trop importante
- Problème de connexion

**Solutions :**

1. **Optimisez vos photos** :

   ```
   ✅ Bonne lumière (naturelle de préférence)
   ✅ Vue claire de l'assiette complète
   ✅ Distance optimale (30-50 cm)
   ✅ Pas de doigt sur l'objectif
   ✅ Formats supportés : JPEG, PNG, WebP
   ✅ Taille max : 10 MB
   ```

2. **Vérifiez votre connexion** :

   - Wi-Fi stable ou 4G/5G
   - Réessayez si déconnexion

3. **Réessayez avec une nouvelle photo** :
   - Prenez une photo plus claire
   - Essayez un autre angle

#### ❌ "L'IA n'a pas bien identifié mon repas"

**C'est normal !** L'IA n'est pas parfaite.

**Solutions :**

1. **Corrigez manuellement** :

   - Utilisez l'option "Modifier l'analyse"
   - Ajoutez les aliments manqués
   - Supprimez les erreurs

2. **Améliorez vos futures photos** :
   - Séparez visuellement les aliments
   - Évitez les plats trop mélangés
   - Ajoutez une description textuelle

### 3. Chatbot IA santé

#### ❌ "Le chatbot ne répond pas"

**Causes :**

- Surcharge temporaire du service
- Connexion internet instable
- Maintenance en cours

**Solutions :**

1. **Attendez quelques minutes** et réessayez
2. **Rafraîchissez la page** (F5)
3. **Vérifiez votre connexion**
4. **Formulez différemment** votre question

#### ❌ "Réponses non pertinentes"

**Conseils pour de meilleures réponses :**

```
✅ Questions claires et précises
✅ Contexte suffisant
✅ Une question à la fois
✅ En français correct

❌ Évitez :
❌ Questions trop vagues
❌ Argot ou abbreviations
❌ Plusieurs sujets à la fois
❌ Demandes de diagnostic médical
```

### 4. Problèmes de synchronisation

#### ❌ "Mes données ne se sauvegardent pas"

**Diagnostic :**

1. **Vérifiez la connexion** internet
2. **Regardez l'indicateur de synchronisation** (icône en haut)
3. **Actualisez la page**

**Solutions :**

1. **Connexion instable** :

   - Changez de réseau Wi-Fi
   - Utilisez la 4G/5G
   - Rapprochez-vous du routeur

2. **Cache navigateur** :

   ```
   Chrome : Ctrl+Shift+R (force refresh)
   Firefox : Ctrl+F5
   Safari : Cmd+Shift+R
   ```

3. **Stockage local plein** :
   - Videz le cache du navigateur
   - Libérez de l'espace disque

## 👨‍⚕️ Problèmes spécifiques médecins

### 1. Validation de compte

#### ❌ "Mon compte médecin n'est pas validé"

**Processus normal :**

- ⏳ Validation sous 24-48h ouvrées
- 📧 Email de confirmation automatique
- 🔍 Vérification manuelle si nécessaire

**Si délai dépassé :**

1. **Vérifiez vos spams** pour l'email de validation
2. **Contactez l'administration** :
   - Email : validation-medecin@suivi-sante-ia.app
   - Précisez votre numéro RPPS
3. **Fournissez des justificatifs** si demandés

### 2. Liaison avec patients

#### ❌ "Impossible d'inviter un patient"

**Vérifications :**

1. **Email patient correct** (vérifiez la saisie)
2. **Patient déjà inscrit** sur la plateforme
3. **Pas de liaison existante** avec un autre médecin

**Solutions :**

1. **Demandez au patient** de vérifier son email
2. **Utilisez la recherche par nom** si disponible
3. **Le patient peut faire la demande** de son côté

### 3. Accès aux données patient

#### ❌ "Données patient non visibles"

**Causes possibles :**

- Consentement révoqué par le patient
- Liaison expirée
- Problème de synchronisation

**Vérifications :**

1. **Statut de la liaison** dans "Mes Patients"
2. **Date de dernière synchronisation**
3. **Paramètres de partage** du patient

## 🌐 Problèmes navigateur web

### 1. Performance lente

#### ❌ Application lente ou qui rame

**Optimisations :**

1. **Fermer les onglets inutiles**
2. **Redémarrer le navigateur**
3. **Vider le cache** :

   ```
   Chrome :
   Paramètres > Confidentialité > Effacer données

   Firefox :
   Historique > Effacer l'historique récent
   ```

4. **Désactiver les extensions** temporairement
5. **Mettre à jour le navigateur**

### 2. Problèmes d'affichage

#### ❌ Interface déformée ou cassée

**Solutions rapides :**

1. **Actualiser la page** (Ctrl+F5)
2. **Changer le niveau de zoom** (100%)
3. **Redimensionner la fenêtre**
4. **Tester en navigation privée**

**Si problème persiste :**

1. **Vider complètement le cache**
2. **Désactiver bloqueur de publicité**
3. **Tester avec un autre navigateur**

### 3. Fonctionnalités JavaScript

#### ❌ "Cette fonctionnalité nécessite JavaScript"

**Solutions :**

1. **Activer JavaScript** :

   ```
   Chrome : Paramètres > Confidentialité > Paramètres de contenu > JavaScript
   Firefox : about:config > javascript.enabled > true
   ```

2. **Autoriser les cookies** de suivi-sante-ia.app
3. **Désactiver mode strict** des bloqueurs

## 🚨 Problèmes d'infrastructure

### 1. Container Docker ne démarre pas

#### Symptômes

- Error: `Cannot start container`
- Logs vides ou erreurs de bind mount
- Port déjà utilisé

#### Diagnostic

```bash
# Vérifier les logs détaillés
docker-compose -f docker-compose.dev.yml logs --tail=50

# Vérifier les ports utilisés
netstat -tulpn | grep :3000

# Vérifier l'état des containers
docker ps -a
```

#### Solutions

**Port déjà utilisé :**

```bash
# Tuer le processus utilisant le port
sudo lsof -ti:3000 | xargs kill -9

# Ou changer le port dans docker-compose.yml
ports:
  - "3001:3000"
```

**Problème de permissions :**

```bash
# Corriger les permissions
sudo chown -R $USER:$USER ./nuxt-app
sudo chmod -R 755 ./nuxt-app
```

**Variables d'environnement manquantes :**

```bash
# Vérifier la présence du fichier .env
ls -la .env*

# Copier depuis l'exemple
cp .env.example .env
```

### 2. Build Docker échoue

#### Symptômes

- `npm install` fails
- Node modules not found
- Out of memory

#### Solutions

**Dépendances manquantes :**

```bash
# Nettoyer le cache Docker
docker system prune -f

# Rebuild sans cache
docker-compose build --no-cache

# Vérifier les versions Node
docker run node:20-alpine node --version
```

**Manque de mémoire :**

```bash
# Augmenter la mémoire Docker
# Dans Docker Desktop : Settings > Resources > Memory > 8GB

# Ou utiliser swap
sudo swapon -s
```

### 3. Problèmes de réseau Docker

#### Symptômes

- Cannot connect to Supabase
- External APIs unreachable
- CORS errors in development

#### Solutions

**Réseau Docker :**

```bash
# Vérifier les réseaux
docker network ls

# Recréer le réseau par défaut
docker-compose down
docker network prune
docker-compose up
```

**Proxy/Firewall :**

```bash
# Tester la connectivité
docker run --rm curlimages/curl curl -I https://supabase.com

# Configurer proxy si nécessaire
ENV http_proxy=http://proxy:8080
ENV https_proxy=http://proxy:8080
```

## 🔌 Problèmes d'API et intégrations

### 1. Erreurs Supabase

#### Symptômes

- `Invalid API key`
- `Row Level Security policy violation`
- Connection timeouts

#### Diagnostic

```typescript
// Test de connectivité Supabase
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });
    console.log("Supabase OK:", data);
  } catch (error) {
    console.error("Supabase Error:", error);
  }
};
```

#### Solutions

**Clés API invalides :**

```bash
# Vérifier les variables d'environnement
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Régénérer les clés dans Supabase Dashboard
# Settings > API > Reset keys
```

**Politiques RLS :**

```sql
-- Vérifier les politiques existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'meals';

-- Désactiver temporairement RLS pour debug
ALTER TABLE meals DISABLE ROW LEVEL SECURITY;
-- N'oubliez pas de la réactiver !
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
```

**Timeout de connexion :**

```typescript
// Configurer timeout plus élevé
const supabase = createClient(url, key, {
  db: {
    schema: "public",
  },
  global: {
    headers: { "x-my-custom-header": "my-app-name" },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});
```

### 2. Erreurs Google APIs

#### Symptômes

- `API key not valid`
- `Quota exceeded`
- `Service unavailable`

#### Diagnostic

```bash
# Tester l'API Vision
curl -X POST \
  "https://vision.googleapis.com/v1/images:annotate?key=$GOOGLE_VISION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "image": {
          "content": "base64_image_string"
        },
        "features": [
          {
            "type": "LABEL_DETECTION",
            "maxResults": 5
          }
        ]
      }
    ]
  }'

# Tester l'API Gemini
curl -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=$GOOGLE_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Test message"
          }
        ]
      }
    ]
  }'
```

#### Solutions

**Clé API invalide :**

```bash
# Vérifier la clé dans Google Cloud Console
# APIs & Services > Credentials

# Vérifier les restrictions d'API
# Limiter aux IPs autorisées si nécessaire
```

**Quota dépassé :**

```javascript
// Implémenter retry avec backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

## 🔐 Problèmes d'authentification

### 1. Sessions expirées

#### Symptômes

- Redirections inattendues vers login
- `Invalid JWT token`
- User object null après rafraîchissement

#### Solutions

```typescript
// Gestion automatique du refresh token
export const useAuthRefresh = () => {
  const { auth } = useSupabaseClient();

  // Écouter les changements de session
  auth.onAuthStateChange((event, session) => {
    if (event === "TOKEN_REFRESHED") {
      console.log("Token refreshed successfully");
    }

    if (event === "SIGNED_OUT") {
      // Nettoyer le state local
      clearUserData();
      navigateTo("/auth/login");
    }
  });

  // Vérifier la validité du token
  const checkTokenValidity = async () => {
    const {
      data: { session },
    } = await auth.getSession();
    if (!session) {
      await auth.signOut();
      return false;
    }
    return true;
  };

  return { checkTokenValidity };
};
```

### 2. Problèmes de rôles

#### Symptômes

- Access denied malgré authentification
- Mauvaise redirection selon le rôle
- Permissions incorrectes

#### Solutions

```typescript
// Middleware robuste de vérification des rôles
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo("/auth/login");
  }

  const requiredRole = to.meta.requiresRole;
  const userRole = user.value.user_metadata?.role || "patient";

  if (requiredRole && userRole !== requiredRole) {
    console.error(`Access denied. Required: ${requiredRole}, Got: ${userRole}`);
    throw createError({
      statusCode: 403,
      statusMessage: "Accès non autorisé",
    });
  }
});

// Vérification côté serveur
export default defineEventHandler(async (event) => {
  const user = await requireAuthenticatedUser(event);

  if (!user.user_metadata?.role) {
    throw createError({
      statusCode: 403,
      statusMessage: "Rôle utilisateur non défini",
    });
  }

  return { user };
});
```

## 🎨 Problèmes d'interface

### 1. Styles Tailwind non appliqués

#### Symptômes

- Classes CSS ignorées
- Styles par défaut du navigateur
- Mise en page cassée

#### Solutions

```bash
# Vérifier la configuration Tailwind
npx tailwindcss --init

# Vérifier le scan des fichiers
# tailwind.config.js
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

# Rebuilder les styles
npm run build
```

### 2. Hydratation mismatches

#### Symptômes

- Warning hydration mismatch
- Interface différente côté client/serveur
- Flash of unstyled content

#### Solutions

```vue
<template>
  <div>
    <!-- Utiliser ClientOnly pour contenu client uniquement -->
    <ClientOnly>
      <UserSpecificContent />
      <template #fallback>
        <div>Chargement...</div>
      </template>
    </ClientOnly>

    <!-- Ou condition basée sur mounted -->
    <div v-if="mounted">
      {{ userPreferences }}
    </div>
  </div>
</template>

<script setup>
const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});
</script>
```

## 📊 Problèmes de performance

### 1. Temps de chargement lents

#### Diagnostic

```bash
# Analyser le bundle
npm run analyze

# Profiler les composants
npm run dev
# Ouvrir Vue DevTools > Performance
```

#### Solutions

```vue
<script setup>
// Lazy loading des composants lourds
const HeavyChart = defineAsyncComponent(() =>
  import("~/components/HeavyChart.vue")
);

// Optimiser les computed
const expensiveComputation = computed(() => {
  // Utiliser shallowRef si les objets sont volumineux
  return processLargeDataset(data.value);
});

// Debounce des recherches
const searchQuery = ref("");
const debouncedSearch = useDebounceFn((query) => {
  performSearch(query);
}, 300);

watch(searchQuery, debouncedSearch);
</script>
```

### 2. Fuites mémoire

#### Diagnostic

```javascript
// Monitoring de la mémoire
if (typeof window !== "undefined") {
  setInterval(() => {
    if (performance.memory) {
      console.log("Memory usage:", {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      });
    }
  }, 10000);
}
```

#### Solutions

```vue
<script setup>
// Nettoyer les listeners
const cleanup = () => {
  // Nettoyer les timers
  clearInterval(intervalId);
  clearTimeout(timeoutId);

  // Nettoyer les listeners
  window.removeEventListener("scroll", scrollHandler);

  // Nettoyer les observers
  observer.disconnect();
};

onUnmounted(cleanup);

// Utiliser weak references pour éviter les cycles
const cache = new WeakMap();

// Éviter les références circulaires
const handleData = (data) => {
  // Process data without storing references
  processData(data);
};
</script>
```

## 🧪 Problèmes de tests

### 1. Tests qui échouent de manière intermittente

#### Solutions

```typescript
// Utiliser fake timers pour les tests temporels
import { vi } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

// Attendre les mises à jour du DOM
import { nextTick } from "vue";

test("should update DOM", async () => {
  // Déclencher changement
  await wrapper.find("button").trigger("click");

  // Attendre mise à jour
  await nextTick();

  // Vérifier résultat
  expect(wrapper.text()).toContain("Updated");
});

// Mocker les APIs externes de manière stable
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
  })),
};
```

### 2. Mocks incorrects

#### Solutions

```typescript
// Centraliser les mocks
// tests/setup/mocks.ts
export const createMockUser = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  role: "patient",
  ...overrides,
});

export const createMockSupabase = () => ({
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: createMockUser() } })),
    signIn: vi.fn(() => Promise.resolve({ data: {}, error: null })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    then: vi.fn((callback) => callback({ data: [], error: null })),
  })),
});

// Utiliser dans les tests
beforeEach(() => {
  vi.mocked(useSupabaseClient).mockReturnValue(createMockSupabase());
});
```

## 📋 Outils de diagnostic

### 1. Logs détaillés

```typescript
// Configuration de logging avancée
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);

    // Envoyer à un service de monitoring
    if (process.env.NODE_ENV === "production") {
      sendToErrorTracking(message, error);
    }
  },

  performance: (operation: string, duration: number) => {
    if (duration > 1000) {
      console.warn(`[PERF] Slow operation: ${operation} took ${duration}ms`);
    }
  },
};
```

### 2. Health checks

```typescript
// Endpoint de santé complet
export default defineEventHandler(async (event) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {} as Record<string, string>,
  };

  try {
    // Test base de données
    const supabase = await getSupabaseServiceClient();
    await supabase
      .from("users")
      .select("count", { count: "exact", head: true });
    health.services.database = "connected";
  } catch (error) {
    health.services.database = "error";
    health.status = "unhealthy";
  }

  try {
    // Test Google APIs
    await $fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GOOGLE_AI_API_KEY}`
    );
    health.services.google_ai = "available";
  } catch (error) {
    health.services.google_ai = "unavailable";
  }

  setResponseStatus(event, health.status === "healthy" ? 200 : 503);
  return health;
});
```

### 3. Monitoring en temps réel

```bash
# Script de monitoring système
#!/bin/bash

echo "=== System Health Check ==="
echo "Date: $(date)"
echo ""

echo "=== Docker Status ==="
docker-compose ps

echo ""
echo "=== Application Health ==="
curl -s http://localhost:3000/api/health | jq .

echo ""
echo "=== System Resources ==="
echo "Memory usage:"
free -h

echo "Disk usage:"
df -h

echo "CPU usage:"
top -bn1 | grep "Cpu(s)"

echo ""
echo "=== Recent Logs ==="
docker-compose logs --tail=10 nuxt-app
```

## 🆘 Escalade des problèmes

### Niveaux de support

1. **Auto-diagnostic** : Utiliser ce guide
2. **Documentation** : Consulter les guides techniques
3. **Logs** : Analyser les logs d'application et système
4. **Tests** : Reproduire en environnement de test
5. **Support équipe** : Créer une issue détaillée

### Informations à collecter

Pour tout problème, rassembler :

- **Version** : Commit hash, tag de version
- **Environnement** : Développement, test, production
- **Logs** : Logs d'erreur complets avec timestamps
- **Contexte** : Actions utilisateur précédentes
- **Configuration** : Variables d'environnement (sans secrets)
- **Reproduction** : Étapes pour reproduire le problème

---

💡 **La plupart des problèmes ont des solutions simples** - Ce guide couvre 90% des cas rencontrés en production.
