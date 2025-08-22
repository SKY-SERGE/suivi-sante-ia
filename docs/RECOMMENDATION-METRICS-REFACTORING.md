# Refactorisation du Système de Métriques des Recommandations

## Vue d'ensemble

La refactorisation du système de métriques des recommandations intègre maintenant des appels API côté serveur pour améliorer les performances et ajouter des fonctionnalités d'intelligence artificielle avancées.

## Nouvelles APIs créées

### 1. `/api/recommendations/metrics.get.ts`

- **Purpose**: Calculer les métriques de recommandations côté serveur
- **Fonctionnalités**:
  - Récupération des recommandations et repas depuis Supabase
  - Calcul des métriques (taux de suivi, répartitions par catégorie/priorité)
  - Analyse de la progression hebdomadaire
  - Insights de régularité des repas
- **Paramètres**: `userId`, `period` (7d, 30d, 90d, 1y)
- **Sécurité**: Rate limiting, validation utilisateur

### 2. `/api/recommendations/insights.post.ts`

- **Purpose**: Générer des insights IA personnalisés avancés
- **Fonctionnalités**:
  - Analyse comportementale via Google AI
  - Recommandations d'actions concrètes
  - Insights priorisés et actionnables
- **IA**: Utilise Gemini 1.5 Flash pour analyser les patterns
- **Sécurité**: CSRF protection, rate limiting

## Composable refactorisé

### `useRecommendationMetrics.ts`

**Nouvelles fonctionnalités**:

- État réactif avec gestion d'erreurs
- Appels API asynchrones
- Fallback sur calculs clients
- Support insights IA + insights basiques

**API exposée**:

```typescript
const {
  // État
  isLoading,
  error,
  metricsData,
  aiInsights,

  // Méthodes API
  fetchMetrics,
  generateAIInsights,

  // Méthodes legacy
  calculateMetrics,
  generateInsights,
} = useRecommendationMetrics();
```

## Composant refactorisé

### `RecommendationMetrics.vue`

**Améliorations majeures**:

- Interface utilisateur enrichie avec sélecteur de période
- Insights IA en temps réel avec bouton de régénération
- Actions suggérées par l'IA avec niveaux de difficulté/impact
- Indicateurs de chargement et gestion d'erreur
- Support backward compatibility avec props

**Nouvelles fonctionnalités UI**:

- Sélecteur de période (7j, 30j, 90j, 1an)
- Insights avec badges de priorité
- Actions IA avec métriques de difficulté/impact
- States de chargement pour les insights IA

## Migration et Compatibilité

### Backward Compatibility

Le composant maintient la compatibilité avec l'ancienne approche :

```vue
<!-- Nouvelle approche (recommandée) -->
<RecommendationMetrics :user-profile="profile" />

<!-- Ancienne approche (supportée) -->
<RecommendationMetrics
  :recommendations="recs"
  :meals="meals"
  :user-profile="profile"
/>
```

### Performance

- Calculs déplacés côté serveur
- Requêtes optimisées Supabase
- Mise en cache des métriques
- Insights IA générés à la demande

## Utilisation

### Configuration requise

1. Google AI API key dans `runtimeConfig.googleAiApiKey`
2. Table Supabase `meal_recommendations` avec colonnes : `user_id`, `category`, `priority`, `title`, `description`, `feedback`, `created_at`
3. Table Supabase `meals` avec colonnes : `user_id`, `datetime`, `created_at`

### Exemple d'utilisation

```vue
<template>
  <!-- Le composant gère automatiquement le chargement des données -->
  <RecommendationMetrics :user-profile="userProfile" />
</template>

<script setup>
const userProfile = {
  health_goals: ["perte de poids"],
  dietary_restrictions: ["végétarien"],
};
</script>
```

## Avantages

1. **Performance**: Calculs serveur vs client
2. **Intelligence**: Insights IA personnalisés
3. **UX**: Interface utilisateur enrichie
4. **Maintenabilité**: Code mieux structuré
5. **Évolutivité**: API extensible pour futures fonctionnalités
6. **Sécurité**: Protection CSRF et rate limiting

## Tests

Une page de test a été créée : `/test/recommendation-metrics` pour valider les deux modes d'utilisation (API et legacy) avec données de démonstration.

## Next Steps

1. Implémenter la mise en cache Redis pour les métriques
2. Ajouter des graphiques interactifs (Chart.js)
3. Notifications push pour les insights critiques
4. Export des métriques au format PDF/CSV
5. Intégration avec d'autres modules du système de santé
