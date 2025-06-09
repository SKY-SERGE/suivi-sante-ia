# Composants de Base et Layouts - Documentation

## Vue d'ensemble

Ce document décrit l'architecture des composants de base et des layouts créés pour l'application de suivi de santé IA.

## Composants de Base (`components/base/`)

### 1. AppHeader.vue

**Rôle**: Navigation principale de l'application

**Fonctionnalités**:

- Logo et branding de l'application
- Navigation contextuelle selon l'état d'authentification
- Menu adaptatif selon les rôles d'utilisateur (patient, médecin, admin)
- Menu mobile responsive
- Boutons de connexion/déconnexion
- Affichage des informations utilisateur

**Navigation par rôle**:

- **Non-authentifié**: Fonctionnalités, À propos, Se connecter, S'inscrire
- **Patient**: Tableau de bord, Consentements, Profil, Déconnexion
- **Médecin**: Tableau de bord, Mes Patients, Consentements, Profil, Déconnexion
- **Admin**: Tableau de bord, Administration, Consentements, Profil, Déconnexion

### 2. AppSidebar.vue

**Rôle**: Navigation latérale pour les pages de dashboard

**Fonctionnalités**:

- Navigation collapsible avec persistance en localStorage
- Icônes et labels contextuels
- Mise en évidence de la page active
- Navigation spécialisée par rôle utilisateur
- Zone d'astuces en bas de sidebar

**Navigation par rôle**:

- **Patient**:

  - Tableau de bord
  - Mes Données (santé)
  - Mes Objectifs
  - Mes Repas
  - Chat IA
  - Consentements
  - Mon Profil

- **Médecin**:

  - Tableau de bord
  - Mes Patients
  - Messages
  - Consentements
  - Mon Profil

- **Admin**:
  - Tableau de bord
  - Administration
  - Utilisateurs
  - Statistiques
  - Consentements
  - Mon Profil

### 3. AppFooter.vue

**Rôle**: Pied de page avec informations et liens

**Fonctionnalités**:

- Informations sur l'application
- Liens de navigation rapide
- Liens de support (contact, confidentialité, etc.)
- Informations sur les technologies utilisées
- Copyright et année courante

## Layouts (`layouts/`)

### 1. default.vue

**Usage**: Pages publiques (accueil, marketing)

**Structure**:

```
Header (AppHeader)
├── Contenu principal (slot)
Footer (AppFooter)
```

**Appliqué à**:

- Page d'accueil (`/`)
- Pages marketing
- Pages d'erreur

### 2. auth.vue

**Usage**: Pages d'authentification

**Structure**:

```
Contenu centré (slot)
├── Logo en bas de page
```

**Caractéristiques**:

- Design minimaliste centré
- Fond gris clair
- Logo discret en bas
- Aucun header/footer pour éviter les distractions

**Appliqué à**:

- `/auth/login`
- `/auth/register`
- `/auth/reset-password`

### 3. dashboard.vue

**Usage**: Pages privées avec navigation complète

**Structure**:

```
Header (AppHeader)
├── Layout horizontal
    ├── Sidebar (AppSidebar)
    ├── Contenu principal (slot)
```

**Caractéristiques**:

- Navigation complète avec sidebar
- Contrôle d'accès par middleware
- Adaptable selon les rôles

**Appliqué à**:

- `/dashboard`
- `/profile`
- `/consents`
- `/admin/*`
- `/doctor/*`
- `/patient/*`

## Composables Utilisés

### useUserProfile

- Gère le profil utilisateur et les rôles
- Fournit les informations d'affichage
- Charge automatiquement le profil selon l'utilisateur authentifié

### useSupabaseUser

- Gère l'état d'authentification
- Fournit les méthodes de connexion/déconnexion
- Synchronise l'état utilisateur

### useToastStore

- Système de notifications
- Utilisé pour les confirmations et erreurs
- Intégré dans tous les composants de base

## Architecture Responsive

### Mobile-First Design

- Navigation mobile avec menu hamburger
- Sidebar collapsible sur desktop
- Textes adaptatifs (masqués sur petit écran)
- Boutons compacts avec icônes

### Breakpoints Tailwind

- `sm:` (640px+): Affichage des textes complets
- `md:` (768px+): Navigation desktop, sidebar visible
- `lg:` (1024px+): Layout optimisé pour grand écran

## Middleware et Sécurité

### Middleware Appliqués

- `guest`: Redirige les utilisateurs authentifiés
- `auth`: Nécessite une authentification
- `role`: Vérifie les permissions selon le rôle

### Protection des Routes

Chaque layout applique automatiquement les middlewares appropriés via `definePageMeta`.

## Personnalisation et Thème

### Variables CSS

- Utilise les tokens de couleur Tailwind CSS 4
- Thème cohérent bleu (`blue-600`) pour l'identité
- Palette de gris pour les éléments neutres

### Icônes

- Lucide Icons via Nuxt Icon
- Icônes sémantiques et cohérentes
- Taille standardisée (4x4, 5x5, 8x8)

## Maintenance et Evolution

### Ajout de Nouvelles Pages

1. Choisir le layout approprié avec `definePageMeta`
2. Appliquer les middleware nécessaires
3. Vérifier la navigation dans les composants de base si nécessaire

### Ajout de Nouveaux Rôles

1. Mettre à jour `useUserProfile.getRoleLabel()`
2. Ajouter la navigation dans `AppHeader` et `AppSidebar`
3. Créer les middleware de rôle appropriés

### Extension de la Navigation

1. Modifier `AppSidebar` pour ajouter de nouveaux liens
2. Mettre à jour la logique d'état actif
3. Tester sur mobile et desktop

Cette architecture modulaire permet une maintenance facile et une extension progressive des fonctionnalités selon les besoins du projet.
