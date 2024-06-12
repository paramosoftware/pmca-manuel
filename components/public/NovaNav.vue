<template>
    <div
        class="px-4 lg:px-8 md:my-8 md:flex flex-col items-stretch h-full w-full max-w-full rounded-md"
    >
        <div
            id="firstRow"
            class="flex flex-col md:flex-row lg:flex-row w-full justify-between items-center md:justify-end lg:justify-end"
        >
        </div>

        <div
            id="wrapperye"
            class="rounded-tl-lg rounded-bl-lg flex flex-shrink-0 h-full"
        >
            <div
                v-if="
                    navigationStore.isHierarchical || navigationStore.isDefault
                "
                id="hierarchicalViewContainer"
                class="hidden md:block lg:block min-w-auto w-auto max-w-[40vw] transition-all duration-300 ease-in-out"
                :class="[
                    // overflow-auto here to enable native resize. better wait and actually implement resize with a proper lib
                    {'max-w-[40vw]': navigationStore.isHierarchicalViewOpen}, `max-h-[${gridCurrentHeight}]`
                    
                ]"
                @mouseenter="navigationStore.updateHoverState"
                @mouseleave="navigationStore.updateHoverState"
            >
                <PublicHierarchicalNavigation />
            </div>
            <div
                v-if="
                    navigationStore.isAlphabetical ||
                    navigationStore.isDefault ||
                    navigationStore.isHierarchical
                "
                id="gridContainer"
                class="px-8 max-w-full py-8 flex-shrink flex-grow bg-gray-50 rounded-md shadow-lg border border-gray-200"
            >
                <PublicGrid ref="grid" class="flex-shrink-0">
                    <PublicOpenHierarchical/>
                    <PublicNavigationToggler />
                </PublicGrid>
            </div>

            <div
                v-if="navigationStore.isDiagram"
                class="max-w-full p-8 flex-shrink flex-grow bg-gray-50 rounded-md shadow-lg border border-gray-200"
                id="diagram"
            >
                <div
                    class="flex flex-col items-center justify-center h-auto max-w-full"
                >
                    <PublicNavigationToggler class="self-end mb-4" />
                    <p class="order-2">
                        <img
                            src="../../public/media/diagram.png"
                            class="h-4/5"
                        />
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({});

const navigationStore = useNavigationStore();

// Maybe move those to utils?
const localStorageKeys = {
    navigation: {
        lastSelected: 'lastSelectedNavigation'
    },
    hierarchical: {
        isPinned: 'isPinned'
    }
};

const validateKeyOnLocalStorage = (key: string) => {
    const itemOnLocalStorage = localStorage.getItem(key);
    const validation =
        (itemOnLocalStorage ? JSON.parse(itemOnLocalStorage) : false) === true;
    console.log(
        `Validating key ${key} at localStorage. Returned ${itemOnLocalStorage} with validation ${validation}`
    );
    return validation;
};

const initializeUserPreferencesOnStore = () => {
    navigationStore.loadUserPreferences(
        validateKeyOnLocalStorage(localStorageKeys.hierarchical.isPinned),
        localStorage.getItem(localStorageKeys.navigation.lastSelected) ??
            'default'
    );
};
//
const grid: Ref<HTMLElement | null> = ref(null);
const gridCurrentHeight = computed(() => {
    return grid.value ? grid.value.offsetHeight : 0;
   
});

onMounted(() => {
    navigationStore.validateScreenSize();
    initializeUserPreferencesOnStore();

    window.addEventListener('resize', () =>
        navigationStore.validateScreenSize()
    );
});
</script>
