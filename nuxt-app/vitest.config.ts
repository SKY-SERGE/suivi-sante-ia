import { defineConfig } from "vitest/config";
import { isCI } from "std-env";

export default defineConfig({
  test: {
    // Configuration d'environnement
    environment: "happy-dom",

    // Configuration des reporters
    reporters: isCI ? ["junit", "github-actions"] : ["verbose"],
    outputFile: {
      junit: "./test-results/junit.xml",
    },

    // Configuration de la couverture
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      reportsDirectory: "./coverage",
      include: [
        "app/**/*.{js,ts,vue}",
        "server/**/*.{js,ts}",
        "composables/**/*.{js,ts}",
        "utils/**/*.{js,ts}",
      ],
      exclude: [
        "node_modules/",
        ".nuxt/",
        ".output/",
        "coverage/",
        "test-results/",
        "**/*.config.*",
        "**/*.d.ts",
      ],
    },

    // Configuration des timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Configuration des globals
    globals: true,

    // Configuration des fichiers
    include: [
      "tests/unit/**/*.{test,spec}.{js,ts}",
      "tests/integration/**/*.{test,spec}.{js,ts}",
    ],

    // Setup files
    setupFiles: ["./tests/setup/vitest.setup.ts"],
  },
});
