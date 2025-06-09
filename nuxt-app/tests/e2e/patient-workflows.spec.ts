import { test, expect } from "@playwright/test";

/**
 * Tests End-to-End pour les workflows Patient
 * TC-PAT-001, TC-PAT-002, TC-PAT-005, TC-PAT-009
 */
test.describe("Workflows Patient", () => {
  test.beforeEach(async ({ page }) => {
    // Navigation vers la page d'accueil
    await page.goto("/");
  });

  test("TC-PAT-001: Inscription et profil patient complet", async ({
    page,
  }) => {
    // Navigation vers la page d'inscription
    await page.click('a[href="/auth/register"]');
    await expect(page).toHaveURL("/auth/register");

    // Remplissage du formulaire d'inscription
    await page.fill('[data-testid="email-input"]', "patient.test@example.com");
    await page.fill('[data-testid="password-input"]', "MotDePasse123!");
    await page.fill('[data-testid="firstName-input"]', "Jean");
    await page.fill('[data-testid="lastName-input"]', "Dupont");
    await page.selectOption('[data-testid="role-select"]', "patient");

    // Soumission du formulaire
    await page.click('[data-testid="register-button"]');

    // Vérification de la redirection vers le dashboard patient
    await expect(page).toHaveURL("/patient/dashboard");
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText(
      "Bienvenue Jean"
    );
  });

  test("TC-PAT-002: Connexion patient existant", async ({ page }) => {
    // Navigation vers la page de connexion
    await page.click('a[href="/auth/login"]');
    await expect(page).toHaveURL("/auth/login");

    // Remplissage des identifiants
    await page.fill(
      '[data-testid="email-input"]',
      "patient.existing@example.com"
    );
    await page.fill('[data-testid="password-input"]', "MotDePasse123!");

    // Connexion
    await page.click('[data-testid="login-button"]');

    // Vérification de la connexion réussie
    await expect(page).toHaveURL("/patient/dashboard");
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test("TC-PAT-005: Saisie manuelle de données de santé", async ({ page }) => {
    // Connexion préalable (en utilisant l'API ou un utilisateur de test)
    await page.goto("/patient/dashboard");

    // Navigation vers la saisie de données
    await page.click('[data-testid="add-health-data-button"]');
    await expect(page).toHaveURL("/patient/health-data/add");

    // Saisie d'une donnée d'humeur
    await page.click('[data-testid="mood-tab"]');
    await page.fill('[data-testid="mood-value"]', "8");
    await page.fill(
      '[data-testid="mood-notes"]',
      "Très bonne journée au travail"
    );
    await page.click('[data-testid="save-mood-button"]');

    // Vérification de la sauvegarde
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      "Données sauvegardées"
    );

    // Vérification dans l'historique
    await page.goto("/patient/health-data/history");
    await expect(
      page.locator('[data-testid="mood-entry"]').first()
    ).toContainText("8");
  });

  test("TC-PAT-009: Création d'objectif personnalisé", async ({ page }) => {
    // Navigation vers la gestion des objectifs
    await page.goto("/patient/goals");

    // Création d'un nouvel objectif
    await page.click('[data-testid="create-goal-button"]');
    await expect(page.locator('[data-testid="goal-form"]')).toBeVisible();

    // Remplissage du formulaire d'objectif
    await page.fill('[data-testid="goal-title"]', "Boire 2L d'eau par jour");
    await page.fill(
      '[data-testid="goal-description"]',
      "Maintenir une bonne hydratation"
    );
    await page.fill('[data-testid="goal-target-value"]', "2000");
    await page.selectOption('[data-testid="goal-unit"]', "ml");
    await page.selectOption('[data-testid="goal-frequency"]', "daily");

    // Sauvegarde de l'objectif
    await page.click('[data-testid="save-goal-button"]');

    // Vérification de la création
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      "Objectif créé"
    );
    await expect(page.locator('[data-testid="goal-card"]')).toContainText(
      "Boire 2L d'eau par jour"
    );
  });

  test("Workflow complet: Inscription → Saisie données → Objectifs → Visualisation", async ({
    page,
  }) => {
    // 1. Inscription
    await page.goto("/auth/register");
    await page.fill('[data-testid="email-input"]', "workflow.test@example.com");
    await page.fill('[data-testid="password-input"]', "MotDePasse123!");
    await page.fill('[data-testid="firstName-input"]', "Marie");
    await page.fill('[data-testid="lastName-input"]', "Martin");
    await page.selectOption('[data-testid="role-select"]', "patient");
    await page.click('[data-testid="register-button"]');

    // 2. Saisie de données de santé
    await page.click('[data-testid="add-health-data-button"]');
    await page.click('[data-testid="mood-tab"]');
    await page.fill('[data-testid="mood-value"]', "7");
    await page.click('[data-testid="save-mood-button"]');

    // 3. Création d'objectif
    await page.goto("/patient/goals");
    await page.click('[data-testid="create-goal-button"]');
    await page.fill('[data-testid="goal-title"]', "Marcher 10000 pas");
    await page.fill('[data-testid="goal-target-value"]', "10000");
    await page.selectOption('[data-testid="goal-unit"]', "steps");
    await page.click('[data-testid="save-goal-button"]');

    // 4. Visualisation des données
    await page.goto("/patient/charts");
    await expect(page.locator('[data-testid="mood-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="goals-progress"]')).toBeVisible();
  });
});

/**
 * Tests End-to-End pour les fonctionnalités IA
 * TC-PAT-018, TC-PAT-024
 */
test.describe("Fonctionnalités IA", () => {
  test.beforeEach(async ({ page }) => {
    // Connexion avec un patient de test
    await page.goto("/auth/login");
    await page.fill('[data-testid="email-input"]', "patient.ai@example.com");
    await page.fill('[data-testid="password-input"]', "MotDePasse123!");
    await page.click('[data-testid="login-button"]');
  });

  test("TC-PAT-018: Upload et analyse de photo de repas", async ({ page }) => {
    // Navigation vers l'ajout de repas
    await page.goto("/patient/meals/add");

    // Upload d'une photo de test
    const fileInput = page.locator('[data-testid="meal-photo-input"]');
    await fileInput.setInputFiles("tests/fixtures/sample-meal.jpg");

    // Attendre l'analyse
    await expect(
      page.locator('[data-testid="analysis-loading"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="analysis-loading"]')).toBeHidden({
      timeout: 10000,
    });

    // Vérification des résultats d'analyse
    await expect(page.locator('[data-testid="detected-foods"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="ai-recommendations"]')
    ).toBeVisible();

    // Sauvegarde du repas
    await page.click('[data-testid="save-meal-button"]');
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      "Repas enregistré"
    );
  });

  test("TC-PAT-024: Interaction avec le chatbot santé", async ({ page }) => {
    // Navigation vers le chatbot
    await page.goto("/patient/chatbot");

    // Vérification des disclaimers
    await expect(
      page.locator('[data-testid="chatbot-disclaimer"]')
    ).toContainText("conseil médical");
    await page.click('[data-testid="accept-disclaimer-button"]');

    // Envoi d'une question
    const messageInput = page.locator('[data-testid="chat-input"]');
    await messageInput.fill("Que dois-je faire si j'ai mal à la tête ?");
    await page.click('[data-testid="send-message-button"]');

    // Attendre la réponse IA
    await expect(page.locator('[data-testid="chat-loading"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="bot-response"]').last()
    ).toBeVisible({ timeout: 15000 });

    // Vérification que la réponse contient des informations utiles
    const botResponse = page.locator('[data-testid="bot-response"]').last();
    await expect(botResponse).toContainText(/hydratation|repos|médecin/);
  });
});

/**
 * Tests de sécurité et autorisations
 * TC-SEC-005, TC-SEC-006
 */
test.describe("Sécurité et Autorisations", () => {
  test("TC-SEC-005: Isolation des données par rôle", async ({ page }) => {
    // Connexion en tant que patient
    await page.goto("/auth/login");
    await page.fill(
      '[data-testid="email-input"]',
      "patient.security@example.com"
    );
    await page.fill('[data-testid="password-input"]', "MotDePasse123!");
    await page.click('[data-testid="login-button"]');

    // Tentative d'accès aux routes admin (doit être bloquée)
    await page.goto("/admin/users");
    await expect(page).toHaveURL("/patient/dashboard"); // Redirection automatique

    // Tentative d'accès aux routes médecin (doit être bloquée)
    await page.goto("/doctor/patients");
    await expect(page).toHaveURL("/patient/dashboard"); // Redirection automatique
  });

  test("TC-SEC-006: Protection des données personnelles", async ({ page }) => {
    // Connexion en tant que médecin
    await page.goto("/auth/login");
    await page.fill(
      '[data-testid="email-input"]',
      "doctor.security@example.com"
    );
    await page.fill('[data-testid="password-input"]', "MotDePasse123!");
    await page.click('[data-testid="login-button"]');

    // Accès à la liste des patients
    await page.goto("/doctor/patients");

    // Vérification que seuls les patients consentants sont visibles
    const patientList = page.locator('[data-testid="patient-list"]');
    await expect(patientList).toBeVisible();

    // Tentative d'accès direct aux données d'un patient non-consenti
    await page.goto("/doctor/patient/unauthorized-patient-id");
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });
});

/**
 * Tests de performance
 * TC-PERF-001, TC-PERF-002
 */
test.describe("Performance", () => {
  test("TC-PERF-001: Temps de chargement des pages", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/patient/dashboard");
    await expect(
      page.locator('[data-testid="dashboard-content"]')
    ).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Moins de 3 secondes
  });

  test("TC-PERF-002: Réactivité des interactions", async ({ page }) => {
    await page.goto("/patient/health-data/add");

    const startTime = Date.now();
    await page.click('[data-testid="mood-tab"]');
    await expect(page.locator('[data-testid="mood-form"]')).toBeVisible();
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(500); // Moins de 500ms
  });
});
