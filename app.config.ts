export default defineAppConfig({
    ui: {
        primary: 'app-theme',
        gray: 'stone',
        default: {
            size: 'md'
        },
        button: {
            default: {
                size: 'md'
            }
        },
        dropdown: {
            item: {
                active: 'text-app-theme-500',
                inactive: 'text-app-secondary-500',
                disabled: 'text-app-primary'
            }
        },
        input: {
            variant: {
                outline: 'text-app-primary',
            }
        }
    }
});