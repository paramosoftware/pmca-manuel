const localStorageKeys = {
    navigation: {
        lastSelected: 'lastSelectedNavigation'
    },
    hierarchical: {
        isPinned: 'isPinned'
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
                isPinned: false,
                isHovered: false,
                isOpen: false
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
        isHierarchicalPinned(state) {
            return state.hierarchical.isPinned === true;
        },
        isSmallScreen(state) {
            return state.screen.isSmall === true;
        },
        isHierarchicalViewOpen(state) {
            return state.hierarchical.isOpen === true;
        },
        isHierarchicalViewPinned(state) {
            return state.hierarchical.isPinned === true;
        },
        isHierarchicalViewHovered(state) {
            return state.hierarchical.isHovered === true;
        },
        activeLetter(state) {
            return state.alphabetical.activeLetter;
        },
        isTodosActive(state) {
            return state.alphabetical.todos.status === true;
        }
    },
    // TODO: Make this less repetitive. Follow toggle logic to avoid multiple re-definitions
    // Ideally we would have only toggles with minimal condition checks and minute calls btw
    actions: {
        validateScreenSize() {
            this.screen.isSmall = window.innerWidth < 768;
        },
        setNavigationMode(mode: string) {
            this.navigationMode = mode;
            this.resetActiveLetter;
        },
        pinHierarchicalView() {
            this.togglePin();
            if (!this.isHierarchicalViewOpen) {
                this.openHierarchicalView();
            }
        },
        savePinPreference() {
            localStorage.setItem(
                localStorageKeys.hierarchical.isPinned,
                this.hierarchical.isPinned.toString()
            );
        },
        openHierarchicalView() {
            if (
                this.isHierarchicalViewHovered ||
                (this.isHierarchicalViewPinned && !this.isHierarchicalViewOpen)
            ) {
                this.toggleOpen();
            }
        },
        updateHoverState() {
            this.toggleHover();
            if (this.isHierarchicalPinned && this.isHierarchicalViewOpen) {
                return;
            }
            if (
                this.isHierarchicalViewHovered &&
                !this.isHierarchicalViewOpen
            ) {
                this.openHierarchicalView();
                return;
            }
            this.toggleOpen();
        },
        refreshStore() {
            this.hierarchical.isHovered = false;
            if (this.isHierarchicalPinned && !this.isHierarchicalViewOpen)
                this.hierarchical.isOpen == true;
            if (!this.isHierarchicalViewHovered && this.isHierarchicalViewOpen)
                this.hierarchical.isOpen == false;
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
        togglePin() {
            this.hierarchical.isPinned = !this.hierarchical.isPinned;
            this.savePinPreference();
            console.log(`toggle isPinned to ${this.hierarchical.isPinned}`);
        },
        toggleOpen() {
            this.hierarchical.isOpen = !this.hierarchical.isOpen;
            console.log(`toggle isOpen to ${this.hierarchical.isOpen}`);
        },
        toggleHover() {
            this.hierarchical.isHovered = !this.hierarchical.isHovered;
            console.log(`toggle isHovered to ${this.hierarchical.isHovered}`);
        },
        toggleTodos() {
            this.alphabetical.todos.status = !this.alphabetical.todos.status
        },
        loadUserPreferences(
            isPinnedLocalStorageValue: boolean,
            userSelectedNavigationMode: string | null
        ) {
            if (isPinnedLocalStorageValue) {
                this.hierarchical.isOpen = true;
                this.hierarchical.isPinned = true;
            }
            this.setNavigationMode(userSelectedNavigationMode || 'default'); // modify novanav logic to reflect this. no checks there, just send it
            this.resetActiveLetter;
        },
        async onOpenHierarchicalButton() {
            if (!this.isHierarchical) {
                this.setNavigationMode('hierarchical');
                await nextTick();
            }
            this.toggleOpen();
        },
        handleTodos() {
            if (this.isTodosActive) {      
                this.toggleTodos();
                this.resetActiveLetter();
                return
            }

            this.toggleTodos();
            this.cleanActiveLetter();

        },
    }
});
