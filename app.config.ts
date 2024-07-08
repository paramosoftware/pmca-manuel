export default defineAppConfig({
    nuxtIcon: {
      size: '32px', // default <Icon> size applied
      class: 'icon' // default <Icon> class applied
    },
    ui: {
      primary: 'app-theme',
      default: {
        size: 'md'
      },
      button: {
        default: {
          size: 'md'
        }
      }
    }
  })