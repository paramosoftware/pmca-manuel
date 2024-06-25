// https://nuxt.com/docs/api/configuration/nuxt-config
import { getIconCollections } from '@egoist/tailwindcss-icons';
import packageJson from './package.json';

export default defineNuxtConfig({
    app: {
        head: {
            title: packageJson.displayName,
            meta: [
                { charset: 'utf-8' },
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1'
                },
                { hid: 'description', name: 'description', content: packageJson.description}
            ]
        }
    },
    build: {
        transpile: ['jsonwebtoken', 'vue2-dropzone-vue3', 'v-viewer']
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
            appName: packageJson.displayName,
            appDescription: packageJson.description,
            appVersion: packageJson.version
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
    },
    nitro: {
        routeRules: {
            '/_ipx/**': {
                headers: {
                    'Cache-Control': 'public, max-age=604800'
                }
            }
        }
    },
    ui: {
        icons: {
            extraProperties: {
                'mask-size': 'contain',
                'mask-position': 'center'
            },
            collections: {
                ...getIconCollections(['heroicons', 'simple-icons', 'ph'])
            }
        }
    }
});
