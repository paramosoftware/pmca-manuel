const localStorageKeys = {
    navigation: {
        lastSelected: 'lastSelectedNavigation'
    }
};

export const useNavigationStore = defineStore({
    id: 'navigation',

    state: () => {
        return {
            navigationMode: 'hierarchical',
            screen: {
                isSmall: false
            },
            hierarchical: {
                slideOver: {
                    status: false
                },
                node: {
                    lastClicked: {
                        id: null as ID
                    }
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
        },
        activeNode(state) {
            return state.hierarchical.node.lastClicked.id;
        },
        currentNavigationMode(state) {
            return state.navigationMode;
        }
    },
    actions: {
        validateScreenSize() {
            this.screen.isSmall = window.innerWidth < 768;
        },
        async setNavigationMode(mode: string) {
            await nextTick();
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
        setLastClickedNode(id: ID) {
            this.hierarchical.node.lastClicked.id = id;
        },
        cleanLastClickedNode() {
            this.hierarchical.node.lastClicked.id = null;
        },
        toggleTodos() {
            this.alphabetical.todos.status = !this.alphabetical.todos.status;
        },
        loadUserPreferences(
            isPinnedLocalStorageValue: boolean,
            userSelectedNavigationMode: string | null
        ) {
            this.setNavigationMode(userSelectedNavigationMode || 'hierarchical'); // modify novanav logic to reflect this. no checks there, just send it
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
