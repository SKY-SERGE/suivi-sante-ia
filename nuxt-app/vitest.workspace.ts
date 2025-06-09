import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      name: "unit",
      environment: "happy-dom",
      include: ["tests/unit/**/*.{test,spec}.{js,ts}"],
    },
  },
  {
    test: {
      name: "integration",
      environment: "happy-dom",
      include: ["tests/integration/**/*.{test,spec}.{js,ts}"],
    },
  },
]);
