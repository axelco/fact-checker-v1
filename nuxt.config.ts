import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      titleTemplate: '%s · Vérificateur de faits',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport',  content: 'width=device-width, initial-scale=1' },
        { name: 'robots',    content: 'index, follow' },
        { property: 'og:type',        content: 'website' },
        { name:     'twitter:card',   content: 'summary' },
      ],
    },
  },

  devServer: {
    port: 3001,
  },

  modules: ["@nuxtjs/i18n"],

  i18n: {
    restructureDir: false,
    locales: [
      { code: "fr", language: "fr-FR", name: "Français", file: "fr.json" },
    ],
    defaultLocale: "fr",
    lazy: true,
    langDir: "locales/",
    strategy: "no_prefix",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    databaseUrl: process.env.DATABASE_URL,
  },

  routeRules: {
    "/api/**": { cors: false },
  },
});
