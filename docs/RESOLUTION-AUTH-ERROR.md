# Guide de résolution - Erreur d'authentification Supabase

## Problème identifié

L'erreur `TypeError: Cannot read properties of undefined (reading 'auth')` était causée par plusieurs problèmes dans la configuration et l'ordre d'initialisation de Supabase :

1. **Ordre d'exécution des plugins** : Le plugin `auth.client.ts` tentait d'utiliser Supabase avant que le plugin `supabase.client.ts` soit complètement initialisé
2. **Gestion des erreurs manquante** : Absence de vérification de l'existence de l'instance Supabase
3. **Configuration environnement** : Variables d'environnement potentiellement manquantes

## Solutions appliquées

### 1. Amélioration du composable `useSupabase`

```typescript
export const useSupabase = () => {
  const nuxtApp = useNuxtApp();

  // Vérification de l'initialisation du plugin
  if (!nuxtApp.$supabase) {
    throw new Error(
      "Plugin Supabase non initialisé. Vérifiez votre configuration."
    );
  }

  return nuxtApp.$supabase as ReturnType<typeof createClient<Database>>;
};
```

### 2. Refactorisation du composable `useSupabaseUser`

- Suppression de la référence globale à `supabase`
- Utilisation de `useSupabase()` dans chaque méthode
- Ajout de gestion d'erreurs complète pour chaque fonction

### 3. Amélioration du plugin Supabase

```typescript
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Vérification des variables d'environnement
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw new Error("Configuration Supabase manquante");
  }

  const supabase = createClient<Database>(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return { provide: { supabase } };
});
```

### 4. Amélioration du plugin d'authentification

```typescript
export default defineNuxtPlugin(async () => {
  // Attendre l'initialisation complète
  await nextTick();

  try {
    const { initialize, getUser } = useSupabaseUser();
    await initialize();
    // ... reste du code
  } catch (error) {
    // Gestion d'erreur améliorée
  }
});
```

## Configuration requise

### Variables d'environnement (.env)

```env
NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vérification de la configuration

Un plugin de vérification a été ajouté (`config-check.client.ts`) qui affiche l'état de la configuration dans la console.

## Prévention

1. **Toujours vérifier** que les instances sont initialisées avant utilisation
2. **Utiliser des try-catch** pour toutes les opérations asynchrones avec Supabase
3. **Vérifier les variables d'environnement** au démarrage
4. **Respecter l'ordre d'initialisation** des plugins

## Test de la solution

Pour vérifier que l'erreur est résolue :

1. Configurez vos variables d'environnement Supabase
2. Redémarrez le serveur de développement
3. Vérifiez la console pour les messages de configuration
4. Testez l'authentification

L'erreur `TypeError: Cannot read properties of undefined (reading 'auth')` ne devrait plus apparaître.
