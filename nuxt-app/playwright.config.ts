import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",

  /* Exécuter les tests en parallèle */
  fullyParallel: true,

  /* Échouer la build sur CI si vous laissez accidentellement test.only dans le code source */
  forbidOnly: !!process.env.CI,

  /* Réessayer sur CI seulement */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests sur CI */
  workers: process.env.CI ? 1 : undefined,

  /* Configuration du reporter */
  reporter: [
    ["html", { outputFolder: "test-results/playwright-report" }],
    ["json", { outputFile: "test-results/playwright-results.json" }],
    ["junit", { outputFile: "test-results/playwright-junit.xml" }],
  ],

  /* Configuration partagée pour tous les projets ci-dessous */
  use: {
    /* URL de base à utiliser dans les actions comme `await page.goto('/')` */
    baseURL: "http://localhost:3000",

    /* Collecter les traces lors des échecs de test */
    trace: "on-first-retry",

    /* Capture d'écran lors des échecs */
    screenshot: "only-on-failure",

    /* Vidéo lors des échecs */
    video: "retain-on-failure",
  },

  /* Configuration des projets pour les navigateurs majeurs */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test sur mobile viewports */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test sur Microsoft Edge brand de navigateur */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },

    /* Test sur Google Chrome brand de navigateur */
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Démarrer le serveur de développement avant d'exécuter les tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
