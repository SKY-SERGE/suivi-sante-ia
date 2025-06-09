# Guide de Standardisation UI/UX - Suivi Santé IA

## Vue d'ensemble

Ce guide établit les standards et conventions pour maintenir la cohérence de l'interface utilisateur et de l'expérience utilisateur dans l'application Suivi Santé IA.

**Version :** 1.0  
**Date de création :** 8 juin 2025  
**Dernière mise à jour :** 8 juin 2025

---

## 1. Architecture des Layouts

### 1.1 Layouts disponibles

- **`default.vue`** : Pages publiques (accueil, marketing)
- **`dashboard.vue`** : Pages avec navigation latérale (patient, médecin, admin)
- **`auth.vue`** : Pages d'authentification

### 1.2 Utilisation des layouts

```vue
<script setup lang="ts">
definePageMeta({
  layout: "dashboard", // ou "default" ou "auth"
  middleware: ["auth", "role"], // si nécessaire
});
</script>
```

**Règle :** Toujours utiliser le layout approprié plutôt que de recréer la navigation.

---

## 2. Composants de structure

### 2.1 Container standardisé

Utilisez le composant `Container` pour tous les espacements et conteneurs :

```vue
<template>
  <Container size="default" spacing="default">
    <!-- Contenu -->
  </Container>
</template>

<script setup>
import { Container } from "@/components/ui/container";
</script>
```

**Variants disponibles :**

- **Size :** `default`, `sm`, `lg`, `full`, `none`
- **Spacing :** `default`, `sm`, `lg`, `xl`, `none`

### 2.2 Cards standardisées

Utilisez les variants de Card appropriés :

```vue
<template>
  <!-- Card interactive avec hover -->
  <Card variant="interactive" class="text-center">
    <CardContent>
      <!-- Contenu -->
    </CardContent>
  </Card>

  <!-- Card élevée -->
  <Card variant="elevated">
    <CardHeader>
      <CardTitle>Titre</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Contenu -->
    </CardContent>
  </Card>
</template>
```

**Variants disponibles :**

- **`default`** : Apparence standard
- **`interactive`** : Avec hover effects, pour les éléments cliquables
- **`elevated`** : Ombre plus prononcée
- **`flat`** : Sans ombre, bordure subtile

---

## 3. Standards de design

### 3.1 Couleurs et thème

Utilisez les variables CSS personnalisées définies dans `tailwind.css` :

```css
/* Couleurs principales */
--color-primary: var(--primary);
--color-secondary: var(--secondary);
--color-background: var(--background);
--color-foreground: var(--foreground);

/* Couleurs sémantiques */
--color-destructive: var(--destructive);
--color-muted: var(--muted);
```

### 3.2 Typographie

- **Titres :** Utiliser les classes Tailwind `text-3xl font-bold` pour H1, `text-xl font-semibold` pour H2, etc.
- **Corps de texte :** `text-gray-600` pour le texte secondaire, `text-gray-900` pour le texte principal
- **Taille responsive :** Utiliser les variants responsive `md:text-4xl`, `sm:text-lg`, etc.

### 3.3 Espacements

- **Conteneurs :** Utiliser le composant `Container` avec les variants appropriés
- **Sections :** `py-20` pour les sections principales, `py-12` pour les sous-sections
- **Éléments :** Suivre l'échelle Tailwind (4, 6, 8, 12, 16, 20, 24)

---

## 4. Composants Shadcn Vue

### 4.1 Imports standardisés

```vue
<script setup lang="ts">
// Composants UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

// Composants Nuxt
import { Icon } from "#components";
</script>
```

### 4.2 Boutons

```vue
<template>
  <!-- Bouton principal -->
  <Button size="lg" class="bg-blue-600 hover:bg-blue-700">
    <Icon name="lucide:rocket" class="h-5 w-5 mr-2" />
    Action principale
  </Button>

  <!-- Bouton secondaire -->
  <Button variant="outline" size="sm">
    <Icon name="lucide:settings" class="h-4 w-4 mr-2" />
    Action secondaire
  </Button>
</template>
```

---

## 5. Navigation et UX

### 5.1 Navigation cohérente

- **Header :** Géré par `BaseAppHeader.vue`
- **Sidebar :** Géré par `BaseAppSidebar.vue` avec navigation contextuelle
- **Breadcrumbs :** À implémenter pour les pages profondes

### 5.2 États et feedback

```vue
<template>
  <!-- État de chargement -->
  <Button :disabled="isLoading">
    <Icon
      v-if="isLoading"
      name="lucide:loader-2"
      class="h-4 w-4 mr-2 animate-spin"
    />
    {{ isLoading ? "Chargement..." : "Valider" }}
  </Button>
</template>
```

### 5.3 Messages d'erreur et de succès

```vue
<script setup>
const { toast } = useToast();

const handleSuccess = () => {
  toast.success("Opération réussie");
};

const handleError = () => {
  toast.error("Une erreur est survenue");
};
</script>
```

---

## 6. Accessibilité (WCAG 2.1)

### 6.1 Attributs ARIA obligatoires

```vue
<template>
  <!-- Navigation -->
  <nav role="navigation" aria-label="Navigation principale">
    <!-- Contenu -->
  </nav>

  <!-- Boutons -->
  <Button aria-label="Fermer le dialogue" aria-describedby="close-description">
    <Icon name="lucide:x" />
  </Button>

  <!-- Formulaires -->
  <Label for="email">Adresse email</Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-error"
  />
</template>
```

### 6.2 Navigation au clavier

- Tous les éléments interactifs doivent être accessibles via Tab
- Ordre de tabulation logique
- Focus indicators visibles

### 6.3 Contrastes

- Minimum 4.5:1 pour le texte normal
- Minimum 3:1 pour les textes larges
- Tester avec les outils de développement

---

## 7. Performance et optimisation

### 7.1 Images

```vue
<template>
  <!-- Toujours utiliser NuxtImg pour l'optimisation -->
  <NuxtImg
    src="/images/hero.jpg"
    alt="Description descriptive"
    width="800"
    height="600"
    loading="lazy"
  />
</template>
```

### 7.2 Icônes

```vue
<template>
  <!-- Utiliser Nuxt Icon pour tous les icônes -->
  <Icon name="lucide:heart-pulse" class="h-6 w-6 text-blue-600" />
</template>
```

---

## 8. Tests et validation

### 8.1 Checklist de validation UI

- [ ] Layout approprié utilisé
- [ ] Composants standardisés (Container, Card)
- [ ] Hover effects cohérents
- [ ] Responsive design testé
- [ ] Accessibilité validée
- [ ] Performance optimisée

### 8.2 Tests manuels

- Navigation au clavier
- Lecteur d'écran
- Responsive sur mobile/tablette
- Contraste de couleurs

---

## 9. Règles de contribution

### 9.1 Avant de créer un nouveau composant

1. Vérifier si un composant Shadcn Vue existe
2. Consulter ce guide pour les patterns existants
3. Documenter les nouveaux composants créés

### 9.2 Révision de code

- Vérifier l'utilisation des layouts
- Valider la cohérence des espacements
- Tester l'accessibilité
- Contrôler les performances

---

## 10. Ressources

### 10.1 Documentation

- [Shadcn Vue](https://www.shadcn-vue.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### 10.2 Outils de test

- Lighthouse (Performance et Accessibilité)
- axe DevTools (Accessibilité)
- WAVE (Accessibilité web)

---

_Guide créé dans le cadre de la tâche 9.1 - Comprehensive UI Audit and Standardization_
_Maintenir ce guide à jour avec les évolutions du projet_
