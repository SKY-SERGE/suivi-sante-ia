# Guide de résolution - Problèmes d'initialisation et de toasts

## Problèmes identifiés

1. **Plugin Supabase non initialisé** - Ordre d'exécution des plugins incorrect
2. **Toast store non fonctionnel** - Conflit entre approches directe et bus dans le système de notifications

## Solutions appliquées

### 1. Ordre des plugins corrigé

Renommage des plugins pour contrôler l'ordre d'exécution :

- `01.supabase.client.ts` - Initialisation de Supabase en premier
- `02.config-check.client.ts` - Vérification de configuration
- `03.auth.client.ts` - Initialisation de l'authentification
- `04.toast.client.ts` - Initialisation des toasts

### 2. Composable Supabase renforcé

Création de `useSupabaseSafe.ts` qui permet une initialisation alternative si le plugin n'est pas disponible :

```typescript
export const useSupabaseSafe = () => {
  const nuxtApp = useNuxtApp();

  // Si le plugin est déjà initialisé, l'utiliser
  if (nuxtApp.$supabase) {
    return nuxtApp.$supabase;
  }

  // Sinon, créer une instance directement
  const config = useRuntimeConfig();
  return createClient(config.public.supabaseUrl, config.public.supabaseAnonKey);
};
```

### 3. Plugin d'authentification amélioré

```typescript
export default defineNuxtPlugin(async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    // Vérifier que Supabase est disponible
    const nuxtApp = useNuxtApp();
    if (!nuxtApp.$supabase) {
      console.warn("Plugin Supabase non disponible, initialisation différée");
      return;
    }

    // Initialiser l'auth normalement
  } catch (error) {
    // Gestion d'erreur robuste
  }
});
```

### 4. Système de toast simplifié

- Suppression du watcher complexe dans `app.vue`
- Utilisation directe de `vue-sonner` dans le store
- Plugin de test pour vérifier le fonctionnement

## Tests et vérification

### Page de test créée

Accédez à `/test-config` pour :

- ✅ Tester les toasts (store + direct)
- ✅ Tester la connexion Supabase
- ✅ Voir le status en temps réel

### Console de développement

Vérifiez ces messages au démarrage :

- 🔧 Vérification de la configuration Supabase
- 🔔 Plugin toast initialisé
- ⚠️ Warnings éventuels (non bloquants)

## Ordre de démarrage optimal

1. **Supabase** s'initialise avec les variables d'environnement
2. **Config-check** vérifie que tout est en place
3. **Auth** initialise l'authentification (peut être différée)
4. **Toast** prépare le système de notifications

## Commandes utiles

```bash
# Redémarrer le serveur (nécessaire après changement de plugins)
npm run dev

# Tester les toasts en console
$testToast()

# Vérifier les variables d'environnement
console.log(useRuntimeConfig().public)
```

## Prévention future

1. **Toujours respecter l'ordre des plugins** avec des préfixes numériques
2. **Utiliser des délais d'attente** pour les initialisations complexes
3. **Créer des fallbacks** pour les services critiques
4. **Tester l'initialisation** avec une page dédiée

Les erreurs de plugin et de toast devraient maintenant être résolues !
