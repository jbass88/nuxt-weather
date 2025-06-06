// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  css: ["~/assets/css/main.css"],
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/fonts', 
    "@nuxt/ui"],
  fonts: {
    families: [
      {
        name: 'Outfit',
        provider: 'google',
        weights: [300, 400, 500, 600],
        styles: ['normal']  
      }
    ],
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY, // server‑only
    public: {
      openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY, // client
    }
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    viewer: true,
  },
});
