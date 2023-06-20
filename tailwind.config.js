/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}"
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
      }
    }
  },
  plugins: []
}
