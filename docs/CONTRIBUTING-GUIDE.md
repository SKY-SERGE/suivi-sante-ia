# Guide de Contribution - Développement de Nouvelles Fonctionnalités

## Vue d'ensemble

Ce guide explique comment contribuer au projet **Suivi Santé IA** en ajoutant de nouvelles fonctionnalités, en respectant l'architecture existante et les bonnes pratiques.

## 🏗️ Architecture du projet

### Structure des dossiers

```
nuxt-app/
├── app/
│   ├── components/          # Composants Vue réutilisables
│   │   ├── base/           # Composants de base (Button, Input, etc.)
│   │   ├── ui/             # Composants UI complexes
│   │   ├── espace/         # Composants spécifiques aux espaces utilisateur
│   │   └── health/         # Composants liés à la santé
│   ├── composables/        # Logique métier réutilisable
│   ├── layouts/           # Layouts d'application
│   ├── pages/             # Pages de l'application (router automatique)
│   ├── types/             # Définitions TypeScript
│   ├── utils/             # Fonctions utilitaires
│   └── stores/            # État global (Pinia)
├── server/
│   ├── api/               # Endpoints API
│   ├── middleware/        # Middleware serveur
│   └── utils/             # Utilitaires serveur
└── tests/                 # Tests (unit, integration, e2e)
```

### Conventions de nommage

- **Composants** : PascalCase (`HealthGoalCard.vue`)
- **Composables** : camelCase avec préfixe `use` (`useHealthData.ts`)
- **Pages** : kebab-case (`patient-dashboard.vue`)
- **Types** : PascalCase avec suffixe approprié (`UserProfile`, `ApiResponse`)
- **Utilitaires** : camelCase (`formatDate.ts`)

## 🔧 Ajout d'une nouvelle fonctionnalité

### 1. Planification

Avant de commencer, documenter :

- **Objectif** : Que fait la fonctionnalité ?
- **Utilisateurs cibles** : Patient, Docteur, Admin ?
- **API requises** : Nouveaux endpoints nécessaires ?
- **Tests** : Scénarios de test principaux

### 2. Création d'un composable

Les composables encapsulent la logique métier. Exemple pour une nouvelle fonctionnalité de suivi d'exercices :

```typescript
// app/composables/useExerciseTracking.ts
import type { Database } from "~/types/database";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export const useExerciseTracking = () => {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const exercises = ref<Exercise[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchExercises = async (): Promise<void> => {
    if (!user.value) return;

    try {
      isLoading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from("exercises")
        .select("*")
        .eq("user_id", user.value.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      exercises.value = data || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur inconnue";
    } finally {
      isLoading.value = false;
    }
  };

  const addExercise = async (
    exerciseData: Partial<Exercise>
  ): Promise<Exercise | null> => {
    if (!user.value) return null;

    try {
      isLoading.value = true;
      error.value = null;

      const { data, error: insertError } = await supabase
        .from("exercises")
        .insert({
          ...exerciseData,
          user_id: user.value.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      exercises.value.unshift(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Erreur lors de l'ajout";
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    exercises: readonly(exercises),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchExercises,
    addExercise,
  };
};
```

### 3. Création des types TypeScript

Ajouter les types dans `app/types/` :

```typescript
// app/types/exercise.ts
export interface ExerciseSession {
  id: string;
  user_id: string;
  type: "cardio" | "strength" | "flexibility" | "sport";
  name: string;
  duration_minutes: number;
  intensity: "low" | "moderate" | "high";
  calories_burned?: number;
  notes?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseGoal {
  id: string;
  user_id: string;
  type: ExerciseSession["type"];
  target_frequency: number; // sessions per week
  target_duration: number; // minutes per session
  start_date: string;
  end_date?: string;
  is_active: boolean;
}
```

### 4. Création d'endpoints API

Créer les endpoints dans `server/api/` :

```typescript
// server/api/exercises/index.post.ts
import { z } from "zod";

const exerciseSchema = z.object({
  type: z.enum(["cardio", "strength", "flexibility", "sport"]),
  name: z.string().min(1).max(100),
  duration_minutes: z.number().min(1).max(480),
  intensity: z.enum(["low", "moderate", "high"]),
  calories_burned: z.number().optional(),
  notes: z.string().max(500).optional(),
  date: z.string().datetime(),
});

export default defineEventHandler(async (event) => {
  try {
    // Vérification de l'authentification
    const user = await requireAuthenticatedUser(event);

    // Validation des données
    const body = await readBody(event);
    const validatedData = exerciseSchema.parse(body);

    // Sauvegarde en base
    const supabase = await getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("exercises")
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la sauvegarde",
      });
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Données invalides",
        data: error.errors,
      });
    }
    throw error;
  }
});
```

### 5. Création des composants

Créer les composants dans `app/components/` :

```vue
<!-- app/components/exercise/ExerciseForm.vue -->
<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-semibold text-gray-900">
      Enregistrer un exercice
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700">
          Type d'exercice
        </label>
        <select
          id="type"
          v-model="form.type"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Sélectionner un type</option>
          <option value="cardio">Cardio</option>
          <option value="strength">Musculation</option>
          <option value="flexibility">Flexibilité</option>
          <option value="sport">Sport</option>
        </select>
      </div>

      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">
          Nom de l'exercice
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="ex: Course à pied"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="duration" class="block text-sm font-medium text-gray-700">
            Durée (minutes)
          </label>
          <input
            id="duration"
            v-model.number="form.duration_minutes"
            type="number"
            min="1"
            max="480"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label
            for="intensity"
            class="block text-sm font-medium text-gray-700"
          >
            Intensité
          </label>
          <select
            id="intensity"
            v-model="form.intensity"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="low">Faible</option>
            <option value="moderate">Modérée</option>
            <option value="high">Élevée</option>
          </select>
        </div>
      </div>

      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700">
          Notes (optionnel)
        </label>
        <textarea
          id="notes"
          v-model="form.notes"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Commentaires sur la séance..."
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isLoading ? "Enregistrement..." : "Enregistrer" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ExerciseSession } from "~/types/exercise";

const emit = defineEmits<{
  success: [exercise: ExerciseSession];
}>();

const { addExercise, isLoading, error } = useExerciseTracking();
const { showToast } = useToast();

const form = reactive({
  type: "" as ExerciseSession["type"] | "",
  name: "",
  duration_minutes: 30,
  intensity: "moderate" as ExerciseSession["intensity"],
  notes: "",
  date: new Date().toISOString(),
});

const handleSubmit = async () => {
  if (!form.type) return;

  const exercise = await addExercise(
    form as Omit<
      ExerciseSession,
      "id" | "user_id" | "created_at" | "updated_at"
    >
  );

  if (exercise) {
    showToast("Exercice enregistré avec succès", "success");
    emit("success", exercise);
    resetForm();
  } else if (error.value) {
    showToast(error.value, "error");
  }
};

const resetForm = () => {
  Object.assign(form, {
    type: "",
    name: "",
    duration_minutes: 30,
    intensity: "moderate",
    notes: "",
    date: new Date().toISOString(),
  });
};
</script>
```

### 6. Création de pages

Ajouter les pages dans `app/pages/` :

```vue
<!-- app/pages/patient/exercices.vue -->
<template>
  <PatientLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Suivi d'exercices</h1>
        <button
          @click="showForm = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nouveau
        </button>
      </div>

      <!-- Statistiques -->
      <ExerciseStats :exercises="exercises" />

      <!-- Formulaire -->
      <ExerciseForm
        v-if="showForm"
        @success="handleExerciseAdded"
        @cancel="showForm = false"
      />

      <!-- Liste des exercices -->
      <ExerciseList :exercises="exercises" :loading="isLoading" />
    </div>
  </PatientLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "patient-only"],
});

const { exercises, isLoading, fetchExercises } = useExerciseTracking();
const showForm = ref(false);

const handleExerciseAdded = () => {
  showForm.value = false;
  fetchExercises(); // Recharger la liste
};

onMounted(() => {
  fetchExercises();
});
</script>
```

### 7. Tests

Créer les tests correspondants :

```typescript
// tests/unit/composables/useExerciseTracking.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useExerciseTracking } from "~/composables/useExerciseTracking";

describe("useExerciseTracking", () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: mockExercise, error: null })
          ),
        })),
      })),
    })),
  };

  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSupabaseClient).mockReturnValue(mockSupabase as any);
    vi.mocked(useSupabaseUser).mockReturnValue(ref(mockUser) as any);
  });

  it("should fetch exercises for authenticated user", async () => {
    const { fetchExercises, exercises } = useExerciseTracking();

    await fetchExercises();

    expect(mockSupabase.from).toHaveBeenCalledWith("exercises");
    expect(exercises.value).toEqual([]);
  });

  it("should add new exercise", async () => {
    const { addExercise } = useExerciseTracking();

    const exerciseData = {
      type: "cardio" as const,
      name: "Course",
      duration_minutes: 30,
      intensity: "moderate" as const,
      date: "2024-01-01T10:00:00Z",
    };

    const result = await addExercise(exerciseData);

    expect(mockSupabase.from).toHaveBeenCalledWith("exercises");
    expect(result).toBeDefined();
  });
});
```

## 🔒 Bonnes pratiques de sécurité

### 1. Validation des données

- ✅ Valider côté client ET serveur
- ✅ Utiliser Zod pour la validation TypeScript
- ✅ Sanitiser les entrées utilisateur
- ✅ Limiter la taille des uploads

### 2. Authentification et autorisation

- ✅ Vérifier l'authentification sur tous les endpoints sensibles
- ✅ Implémenter les middlewares de rôle appropriés
- ✅ Utiliser RLS (Row Level Security) dans Supabase

### 3. Gestion des erreurs

- ✅ Ne jamais exposer d'informations sensibles
- ✅ Logger les erreurs côté serveur
- ✅ Messages utilisateur clairs et utiles

## 🧪 Stratégie de test

### 1. Tests unitaires

- **Composables** : Logique métier isolée
- **Utilitaires** : Fonctions pures
- **Composants** : Rendering et interactions

### 2. Tests d'intégration

- **API endpoints** : Requêtes/réponses complètes
- **Workflows utilisateur** : Scénarios complets
- **Intégrations externes** : APIs tierces

### 3. Tests E2E

- **Parcours critiques** : Inscription, connexion, fonctionnalités principales
- **Cross-browser** : Chrome, Firefox, Safari
- **Responsive** : Mobile, tablette, desktop

## 📚 Ressources et outils

### Documentation officielle

- [Nuxt 3](https://nuxt.com/docs)
- [Vue 3](https://vuejs.org/guide/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Outils de développement

- **TypeScript** : Typage statique
- **ESLint** : Linting du code
- **Prettier** : Formatage du code
- **Vitest** : Tests unitaires et d'intégration
- **Playwright** : Tests E2E

### Extensions VS Code recommandées

- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- ESLint
- Prettier

## 🤝 Processus de contribution

### 1. Préparation

```bash
# Fork et clone
git clone https://github.com/your-username/suivi-sante-ia.git
cd suivi-sante-ia

# Créer une branche feature
git checkout -b feature/exercise-tracking

# Installer les dépendances
cd nuxt-app
npm install
```

### 2. Développement

```bash
# Démarrer en mode développement
npm run dev

# Lancer les tests pendant le développement
npm run test:watch

# Vérifier le linting
npm run lint
```

### 3. Validation

```bash
# Tests complets
npm run test

# Build de production
npm run build

# Tests E2E
npm run test:e2e
```

### 4. Soumission

```bash
# Commit avec message descriptif
git add .
git commit -m "feat: add exercise tracking functionality"

# Push et création de PR
git push origin feature/exercise-tracking
```

## 📋 Checklist pour nouvelle fonctionnalité

### Développement

- [ ] Composable créé avec types TypeScript
- [ ] Endpoints API avec validation Zod
- [ ] Composants Vue avec props typés
- [ ] Pages avec meta et middleware appropriés
- [ ] Tests unitaires et d'intégration
- [ ] Documentation des fonctions complexes

### Qualité

- [ ] Pas d'erreurs ESLint/TypeScript
- [ ] Tests passent (unit, integration, e2e)
- [ ] Performance acceptable
- [ ] Accessibilité validée
- [ ] Design responsive

### Sécurité

- [ ] Authentification vérifiée
- [ ] Autorisation par rôle
- [ ] Validation des entrées
- [ ] Gestion des erreurs

### Documentation

- [ ] README mis à jour si nécessaire
- [ ] Types documentés
- [ ] Exemples d'utilisation
- [ ] Tests de régression ajoutés

---

💡 **Besoin d'aide ?** Consultez la [documentation technique](./TECHNICAL-API-DOCUMENTATION.md) ou créez une issue sur GitHub.
