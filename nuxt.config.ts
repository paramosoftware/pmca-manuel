// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        "nuxt-icon",
        '@nuxthq/ui'
    ],
    colorMode: {
        preference: 'light',
        fallback: 'light'
    }
})
