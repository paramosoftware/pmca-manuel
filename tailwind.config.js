/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './nuxt.config.{js,ts}'
    ],
    theme: {
        extend: {
            colors: {
                'app-primary': '#603129',
                'app-secondary': {
                    50: '#fef2f2',
                    100: '#fde7e6',
                    200: '#fbd0d2',
                    300: '#f7aaad',
                    400: '#f57f82',
                    500: '#f2767e',
                    600: '#dc143c',
                    700: '#b31d36',
                    800: '#961b33',
                    900: '#811a32',
                    950: '#480916'
                },
                'app-theme': {
                    50: '#fff0f2',
                    100: '#ffe3e4',
                    200: '#ffcbd1',
                    300: '#ff6b7e',
                    400: '#fb3855',
                    500: '#dc143c',
                    600: '#a50c33',
                    700: '#8d0e33',
                    800: '#4f0217',
                    900: '#2f0217',
                    950: '#1a010b'
                }
            }
        }
    },
    plugins: []
};
