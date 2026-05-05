import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    // Nuxt environment for components/composables tests
    // Server utility tests use the default node environment (override per file)
    environment: "nuxt",
    environmentOptions: {
      nuxt: { domEnvironment: "happy-dom" },
    },
    coverage: {
      provider: "v8",
      include: ["server/**/*.ts", "composables/**/*.ts"],
      exclude: ["**/*.d.ts"],
    },
  },
});
