# Google Vision AI Integration Guide

Ce guide explique comment configurer et utiliser l'intégration Google Vision AI dans l'application Suivi Santé IA.

## Configuration

### 1. Prérequis

- Un compte Google Cloud Platform
- Un projet activé avec facturation (l'API Vision AI nécessite un compte avec facturation)
- Node.js et l'application Nuxt configurée

### 2. Activation de l'API Vision AI

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionner votre projet ou en créer un nouveau
3. Aller dans "APIs & Services" > "Library"
4. Rechercher "Cloud Vision API"
5. Cliquer sur "Enable"

### 3. Création d'une clé API

1. Aller dans "APIs & Services" > "Credentials"
2. Cliquer sur "+ CREATE CREDENTIALS" > "API key"
3. Copier la clé générée
4. (Optionnel) Restreindre la clé aux APIs Vision uniquement pour la sécurité

### 4. Configuration de l'application

1. Copier `.env.example` vers `.env`
2. Ajouter votre clé API :
   ```bash
   GOOGLE_VISION_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   GOOGLE_VISION_PROJECT_ID=votre-projet-id
   ```
3. Redémarrer l'application

## Fonctionnement

### Mode Automatique

L'application détecte automatiquement si Google Vision AI est configuré :

- **Avec clé API** : Utilise l'API Google Vision pour l'analyse réelle
- **Sans clé API** : Utilise un mode simulation pour le développement

### Endpoint API

L'analyse se fait via l'endpoint serveur `/api/vision/analyze-meal` :

- **Méthode** : POST
- **Format** : multipart/form-data
- **Champ** : `image` (fichier Blob)

### Réponse de l'API

```typescript
{
  success: boolean;
  analysis: {
    identifiedFoods: Array<{
      name: string;
      confidence: number;
      category: string;
    }>;
    nutritionalAnalysis: {
      totalCalories: number;
      macronutrients: {
        proteins: number;
        carbohydrates: number;
        fats: number;
      };
      foodGroups: { [key: string]: number };
      healthScore: number;
    };
    recommendations: string[];
    feedback: string;
    confidence: number;
    processingTime: number;
  };
  timestamp: string;
}
```

## Sécurité

### Bonnes Pratiques

1. **Clé API côté serveur** : La clé API n'est jamais exposée au client
2. **Restrictions** : Restreindre l'API key aux seules APIs Vision nécessaires
3. **Rate limiting** : Google Vision API a des limites de quota
4. **Validation** : Les images sont validées avant envoi à l'API

### Gestion des Erreurs

L'application gère automatiquement :

- **Erreurs API** : Basculement vers le mode simulation
- **Limites de quota** : Message d'erreur informatif
- **Images invalides** : Validation côté client et serveur

## Coûts

### Tarification Google Vision API

- **Gratuit** : 1000 requêtes/mois
- **Au-delà** : ~$1.50 pour 1000 requêtes
- **Détection d'objets** : Légèrement plus cher que la détection de labels

### Optimisation

1. **Compression d'images** : Les images sont automatiquement compressées
2. **Cache** : Éviter les analyses répétées de la même image
3. **Fallback** : Mode simulation en cas de quota dépassé

## Développement

### Mode Simulation

Quand Google Vision n'est pas configuré, l'application utilise un algorithme de simulation qui :

1. Génère des aliments aléatoires plausibles
2. Calcule des scores nutritionnels basiques
3. Fournit des recommandations génériques
4. Maintient la même interface que l'API réelle

### Tests

```bash
# Test sans Google Vision (simulation)
npm run dev

# Test avec Google Vision
# 1. Configurer GOOGLE_VISION_API_KEY dans .env
# 2. npm run dev
# 3. Uploader une photo via l'interface
```

## Dépannage

### Erreurs Communes

1. **"API key not configured"**

   - Vérifier que `GOOGLE_VISION_API_KEY` est défini dans `.env`
   - Redémarrer l'application

2. **"403 Forbidden"**

   - Vérifier que l'API Vision est activée
   - Vérifier les restrictions sur la clé API

3. **"Quota exceeded"**

   - Vérifier les quotas dans Google Cloud Console
   - L'application bascule automatiquement en mode simulation

4. **"Invalid image format"**
   - Seuls JPEG, PNG, WebP sont supportés
   - Taille maximum : 20MB (recommandé : <2MB)

### Debug

Activer les logs détaillés :

```bash
DEBUG=vision:* npm run dev
```

## Production

### Recommandations

1. **Service Account** : Utiliser un service account au lieu d'une clé API
2. **Monitoring** : Surveiller l'usage et les coûts
3. **Backup** : Toujours avoir un fallback fonctionnel
4. **Rate Limiting** : Implémenter une limitation côté application

### Variables d'Environnement Production

```bash
GOOGLE_VISION_API_KEY=production_api_key
GOOGLE_VISION_PROJECT_ID=production-project-id
NODE_ENV=production
```

---

## Support

Pour toute question ou problème :

1. Vérifier ce guide
2. Consulter la [documentation Google Vision AI](https://cloud.google.com/vision/docs)
3. Vérifier les logs de l'application
