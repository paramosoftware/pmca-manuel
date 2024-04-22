// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            title: process.env.APP_NAME,
            meta: [
                { charset: 'utf-8' },
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1'
                },
                {
                    hid: 'description',
                    name: 'description',
                    content: process.env.APP_DESCRIPTION
                },
                {
                    hid: 'og:title',
                    name: 'og:title',
                    content: process.env.APP_NAME
                },
                {
                    hid: 'og:description',
                    name: 'og:description',
                    content: process.env.APP_DESCRIPTION
                },
                {
                    hid: 'keywords',
                    name: 'keywords',
                    content:
                        'glossário, conservação, restauro, livros, documentos, papel, termos, técnicos, dicionário, software livre, glossário, dicionário de termos técnicos, glossário de termos técnicos'
                }
            ]
        }
    },
    build: {
        transpile: [
            'jsonwebtoken',
            'vue2-dropzone-vue3',
            'v-viewer'
        ]
    },
    modules: [
        'nuxt-icon',
        '@nuxt/ui',
        '@pinia/nuxt',
        '@nuxt/image',
        '@formkit/auto-animate/nuxt'
    ],
    serverHandlers: [
        {
            route: '/api/**',
            handler: '~/server/express/index.ts'
        }
    ],
    runtimeConfig: {
        public: {
            baseURL: process.env.NUXT_PUBLIC_BASE_URL,
            appName: process.env.APP_NAME,
            appDescription: process.env.APP_DESCRIPTION
        }
    },
    colorMode: {
        preference: 'light',
        fallback: 'light'
    },
    experimental: {
        asyncContext: true
    },
    image: {
        domains: [process.env.NUXT_PUBLIC_BASE_URL!]
    }
});
