// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  runtimeConfig: {
    openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY, // server‑only
  },
})
