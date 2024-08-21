// https://nuxt.com/docs/api/configuration/nuxt-config
import { getIconCollections } from '@egoist/tailwindcss-icons';
import packageJson from './package.json';

export default defineNuxtConfig({
    compatibilityDate: '2024-08-02',
    app: {
        head: {
            title: packageJson.displayName,
            meta: [
                { charset: 'utf-8' },
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1'
                },
                {
                    hid: 'description',
                    name: 'description',
                    content: packageJson.description
                },
                {
                    name: 'application-name',
                    content: packageJson.displayName
                },
                {
                    name: 'apple-mobile-web-app-title',
                    content: packageJson.displayName
                },
                {
                    name: 'msapplication-TileColor',
                    content: '#252525'
                },
                {
                    name: 'theme-color',
                    content: '#dc143c'
                }
            ],
            link: [
                { rel: 'manifest', href: '/site.webmanifest' },
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '32x32',
                    href: '/favicon-32x32.png'
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '16x16',
                    href: '/favicon-16x16.png'
                },
                {
                    rel: 'apple-touch-icon',
                    sizes: '180x180',
                    href: '/apple-touch-icon.png'
                },
                {
                    rel: 'mask-icon',
                    href: '/safari-pinned-tab.svg',
                    color: '#ffffff'
                },
                {
                    rel: 'mask-icon',
                    href: '/safari-pinned-tab.svg',
                    color: '#ffffff'
                }
            ]
        }
    },
    css: ['~/assets/css/main.css', '~/assets/css/markdown.css' ],
    build: {
        transpile: ['jsonwebtoken', 'vue2-dropzone-vue3', 'v-viewer']
    },
    modules: [
        'nuxt-icon',
        '@nuxt/ui',
        '@pinia/nuxt',
        '@nuxt/image',
        '@formkit/auto-animate/nuxt',
        '@nuxt/content'
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
            appVersion: packageJson.version,
            primaryColor: '#603129',
            secondaryColor: '#f2767e',
            themeColor: '#dc143c',
            repositoryUrl: packageJson.repository.url,
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
