import countries from 'i18n-iso-countries'
import enLocale  from 'i18n-iso-countries/langs/en.json'

export default defineNuxtPlugin(() => {
    countries.registerLocale(enLocale) // Register the locale once when Nuxt starts
})