# Guide de Test et Validation - Système d'Authentification

Ce guide fournit des instructions pour tester manuellement et automatiquement le système d'authentification et de gestion des consentements.

## Prérequis

1. **Base de données Supabase configurée** avec :

   - Tables `profiles` et `consents` créées
   - Politiques RLS activées
   - Utilisateurs de test avec différents rôles

2. **Variables d'environnement configurées** :
   ```env
   SUPABASE_URL=votre_url_supabase
   SUPABASE_ANON_KEY=votre_clé_anonyme
   ```

## Tests d'Authentification

### 1. Test d'inscription

1. Accéder à `/auth/register`
2. Remplir le formulaire avec des données valides
3. Vérifier la création du compte
4. Vérifier la redirection vers `/dashboard`

### 2. Test de connexion

1. Accéder à `/auth/login`
2. Se connecter avec des identifiants valides
3. Vérifier la redirection appropriée selon le rôle

### 3. Test de déconnexion

1. Cliquer sur "Déconnexion" depuis n'importe quelle page
2. Vérifier la redirection vers `/auth/login`
3. Vérifier que l'accès aux pages protégées est bloqué

## Tests de Contrôle d'Accès

### Test Patient

```
Compte : patient@test.com
Rôle : patient
Pages accessibles : /dashboard, /profile, /consents, /consents/revoke
Pages bloquées : /doctor/*, /admin/*
```

### Test Médecin

```
Compte : doctor@test.com
Rôle : doctor
Pages accessibles : /doctor/dashboard, /doctor/consents, /profile
Pages bloquées : /admin/*
```

### Test Admin

```
Compte : admin@test.com
Rôle : admin
Pages accessibles : /admin/dashboard, /profile
```

## Tests de Consentement

### Flux complet de consentement

1. **En tant que patient** :

   - Accéder à `/consents`
   - Créer un nouveau consentement pour un médecin
   - Vérifier l'état "pending"

2. **En tant que médecin** :

   - Accéder à `/doctor/consents`
   - Voir le consentement en attente
   - Approuver le consentement

3. **Vérification** :
   - Le statut passe à "granted"
   - Le médecin peut accéder aux données du patient

### Test de révocation

1. **En tant que patient** :

   - Accéder à `/consents/revoke`
   - Sélectionner un consentement actif
   - Confirmer la révocation

2. **Vérification** :
   - Le statut passe à "revoked"
   - Le médecin perd l'accès aux données

## Tests de Sécurité

### Protection RLS

```sql
-- Test : Un patient ne peut voir que ses propres consentements
SELECT * FROM consents WHERE patient_id != auth.uid();
-- Résultat attendu : Aucune ligne

-- Test : Un médecin ne peut voir que ses consentements
SELECT * FROM consents WHERE doctor_id != auth.uid();
-- Résultat attendu : Aucune ligne
```

### Tests de contournement

1. **Manipulation d'URL** :

   - Tenter d'accéder à `/doctor/dashboard` en tant que patient
   - Vérifier la redirection vers `/unauthorized`

2. **Manipulation de données** :
   - Tenter de modifier le rôle côté client
   - Vérifier que les changements ne sont pas persistés

## Automatisation des Tests

### Tests avec Playwright (recommandé)

```typescript
// test/auth.spec.ts
import { test, expect } from "@playwright/test";

test("patient can access dashboard", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[data-testid="email"]', "patient@test.com");
  await page.fill('[data-testid="password"]', "password");
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("h1")).toContainText("Tableau de bord");
});

test("doctor cannot access admin pages", async ({ page }) => {
  // Login as doctor
  await loginAsDoctor(page);

  // Try to access admin page
  await page.goto("/admin/dashboard");

  // Should be redirected to unauthorized
  await expect(page).toHaveURL("/unauthorized");
});
```

### Tests d'intégration avec Vitest

```typescript
// test/consent.test.ts
import { describe, it, expect } from "vitest";
import { useConsents } from "~/composables/useConsents";

describe("Consent Management", () => {
  it("should create consent correctly", async () => {
    const { createConsent } = useConsents();

    const result = await createConsent({
      patient_id: "patient-id",
      doctor_id: "doctor-id",
      notes: "Test consent",
    });

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe("pending");
  });
});
```

## Checklist de Validation

### Authentification ✅

- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Déconnexion fonctionne
- [ ] Session persiste après refresh
- [ ] Session expire correctement

### Autorisation ✅

- [ ] Middleware auth bloque les non-connectés
- [ ] Middleware role contrôle l'accès par rôle
- [ ] Pages admin bloquées pour non-admin
- [ ] Pages doctor bloquées pour patients

### Consentements ✅

- [ ] Création de consentement fonctionne
- [ ] Approbation de consentement fonctionne
- [ ] Révocation de consentement fonctionne
- [ ] Seuls les propriétaires peuvent modifier

### Sécurité ✅

- [ ] RLS protège les données
- [ ] Pas d'accès non autorisé via API
- [ ] Validation côté serveur active
- [ ] Messages d'erreur appropriés

## Résolution de Problèmes

### Erreur de connexion Supabase

```
Vérifier :
1. Variables d'environnement correctes
2. Clés Supabase valides
3. URL Supabase accessible
```

### Erreur RLS

```
Vérifier :
1. Politiques RLS activées
2. Fonctions auth.uid() disponibles
3. Rôles correctement assignés
```

### Erreur de redirection

```
Vérifier :
1. Middleware correctement configuré
2. Pages de destination existantes
3. Gestion des états de chargement
```

## Performance et Monitoring

### Métriques à surveiller

- Temps de connexion
- Temps de chargement des pages
- Taux d'erreur d'authentification
- Utilisation des ressources Supabase

### Logging recommandé

```typescript
// Dans useAuth.ts
const signIn = async (email: string, password: string) => {
  console.log(`[AUTH] Tentative de connexion pour ${email}`);

  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    console.log(`[AUTH] Connexion réussie pour ${email}`);
    return result;
  } catch (error) {
    console.error(`[AUTH] Erreur de connexion pour ${email}:`, error);
    throw error;
  }
};
```

---

**Guide créé le :** 6 juin 2025  
**Version :** 1.0  
**Statut :** Validé pour production
