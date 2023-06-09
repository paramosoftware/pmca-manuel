// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        'nuxt-icon',
        '@nuxthq/ui',
    ],
    serverHandlers: [
        {
            route: '/api/**',
            handler: '~/server/express/index.ts'
        }
    ],
    runtimeConfig: {
        public: {
          baseURL: process.env.BASE_URL,
        },
    },
    colorMode: {
        preference: 'light',
        fallback: 'light'
    }
})
