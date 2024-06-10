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
        },
        pinHierarchicalView() {
            this.togglePin()
            this.openHierarchicalView();
        },
        openHierarchicalView() {
            if (
                this.hierarchical.isPinned ||
                this.hierarchical.isHovered
            ) {
                this.hierarchical.isOpen = true;
            } else {
                this.toggleOpen();
            }
        },
        updateHoverState() {
            this.toggleHover();
            if (
                !this.hierarchical.isPinned &&
                !this.hierarchical.isHovered
            ) {
                console.log('.')
                this.hierarchical.isOpen = false;
            } else {
                console.log('..')
                this.hierarchical.isOpen = true;
            }
        },
        togglePin() {
            this.hierarchical.isPinned = !this.hierarchical.isPinned;
            this.savePinPreference()
            console.log(`toggle isPinned to ${this.hierarchical.isPinned}`)
        },
        savePinPreference() {
            localStorage.setItem(
                localStorageKeys.hierarchical.isPinned,
                this.hierarchical.isPinned.toString()
            );
        },
        toggleOpen() {
            
            this.hierarchical.isOpen = !this.hierarchical.isOpen;
            console.log(`toggle isOpen to ${this.hierarchical.isOpen}`)
        },
        toggleHover() {
            this.hierarchical.isHovered = !this.hierarchical.isHovered;
            console.log(`toggle isHovered to ${this.hierarchical.isHovered}`)
        },
        loadUserPreferences(
            isPinnedLocalStorageValue: boolean,
            userSelectedNavigationMode: string
        ) {
            if (isPinnedLocalStorageValue) {
                this.hierarchical.isOpen = true;
                this.hierarchical.isPinned = true;
            }
            this.setNavigationMode(userSelectedNavigationMode);
        }
    }
});
