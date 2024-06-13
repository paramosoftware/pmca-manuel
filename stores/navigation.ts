const localStorageKeys = {
    navigation: {
        lastSelected: 'lastSelectedNavigation'
    }
};

export const useNavigationStore = defineStore({
    id: 'navigation',

    state: () => {
        return {
            navigationMode: 'default',
            screen: {
                isSmall: false
            },
            hierarchical: {
                slideOver: {
                    status: false
                }
            },
            alphabetical: {
                activeLetter: 'A',
                todos: {
                    status: false
                }
            }
        };
    },
    getters: {
        isDefault(state) {
            return state.navigationMode === 'default';
        },
        isHierarchical(state) {
            return state.navigationMode === 'hierarchical';
        },
        isAlphabetical(state) {
            return state.navigationMode === 'alphabetical';
        },
        isDiagram(state) {
            return state.navigationMode === 'diagram';
        },
        isSmallScreen(state) {
            return state.screen.isSmall === true;
        },
        activeLetter(state) {
            return state.alphabetical.activeLetter;
        },
        isTodosActive(state) {
            return state.alphabetical.todos.status === true;
        },
        isSlideOverOpen(state) {
            return state.hierarchical.slideOver.status === true;
        }
    },
    actions: {
        validateScreenSize() {
            this.screen.isSmall = window.innerWidth < 768;
        },
        setNavigationMode(mode: string) {
            this.navigationMode = mode;
            this.resetActiveLetter;
        },
        refreshStore() {
            this.resetActiveLetter();
        },
        resetActiveLetter() {
            if (this.navigationMode !== 'alphabetical') {
                return;
            }
            this.alphabetical.activeLetter = 'A';
        },
        setActiveLetter(letter: string) {
            this.alphabetical.activeLetter = letter;
        },
        cleanActiveLetter() {
            this.alphabetical.activeLetter = 'inactive';
        },
        toggleTodos() {
            this.alphabetical.todos.status = !this.alphabetical.todos.status;
        },
        loadUserPreferences(
            isPinnedLocalStorageValue: boolean,
            userSelectedNavigationMode: string | null
        ) {
            this.setNavigationMode(userSelectedNavigationMode || 'default'); // modify novanav logic to reflect this. no checks there, just send it
            this.resetActiveLetter;
        },
        async onOpenHierarchicalButton() {
            if (!this.isHierarchical) {
                this.setNavigationMode('hierarchical');
                await nextTick();
            }
        },
        toggleSlideOver() {
            this.hierarchical.slideOver.status =
                !this.hierarchical.slideOver.status;
        },
        handleTodos() {
            if (this.isTodosActive) {
                this.toggleTodos();
                this.resetActiveLetter();
                return;
            }

            this.toggleTodos();
            this.cleanActiveLetter();
        }
    }
});
