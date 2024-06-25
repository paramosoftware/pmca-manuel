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
                'pmca-primary': '#3D405C',
                'pmca-primary-light': '#5c608a',
                'pmca-secondary': '#6699FF',
                'pmca-secondary-dark': '#4054B2',
                'pmca-accent': '#A9CC44',
                'pmca-accent-dark': '#23A455',
                'pmca-green': {
                    50: '#f8fbea',
                    100: '#eef5d2',
                    200: '#ddeda9',
                    300: '#c6df77',
                    400: '#a9cc44',
                    500: '#a9cc44',
                    600: '#6f8f21',
                    700: '#556d1e',
                    800: '#45571d',
                    900: '#3b4b1c',
                    950: '#a9cc44'
                }
            }
        }
    },
    plugins: []
};
