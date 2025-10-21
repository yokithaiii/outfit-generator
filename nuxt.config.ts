export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/icon'
  ],
  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: true
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000/api',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
    freepikApiKey: process.env.FREEPIK_API_KEY,
  },
  devtools: { enabled: true }
})