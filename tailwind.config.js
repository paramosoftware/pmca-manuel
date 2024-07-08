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
                'app-secondary': '#f2767e',
                'app-theme': {
                    50: '#fff0f2',
                    100: '#ffe3e4',
                    200: '#ffcbd1',
                    300: '#ff6b7e',
                    400: '#fb3855',
                    500: '#dc143c',
                    600: '#c50b34',
                    700: '#a50c33',
                    800: '#8d0e33',
                    900: '#4f0217',
                    950: '#2f0217'
                }
            }
        }
    },
    plugins: []
};
