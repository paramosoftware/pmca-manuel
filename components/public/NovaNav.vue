<template>
    <div
        class="min-w-full md:flex flex-col flex-grow max-h-auto min-h-full rounded-md "
    >
        <div
            id="firstRow"
            class="md:hidden flex flex-row md:flex-row justify-center lg:flex-row h-full items-center md:justify-end lg:justify-end mb-4"
        >
            <div
                class="sm:flex items-center sm:justify-between sm:items-center w-3/4"
            >
                <div
                    id="slotContainer"
                    class="flex justify-center self-center w-full"
                >
                    <PublicOpenHierarchical class="flex-0" />
                    <PublicNavigationToggler
                        class="flex-1"
                        :justifyMethod="'between'"
                    />
                </div>
            </div>
        </div>

        <div
            id="generalContainer"
            class="rounded-tl-lg rounded-bl-lg flex flex-grow flex-shrink-0 h-full min-h-full max-h-auto w-full max-w-full"
        >
            <div
                v-if="
                    navigationStore.isHierarchical
                "
                id="hierarchicalViewContainer"
                :style="{ 'max-height': `${gridCurrentHeight / 16}rem` }"
                :class="[
                    // TODO: Use a lib to enable resize from hold and drag in a vertical line.
                    ` hidden md:block lg:block flex-flex-grow min-w-auto  rounded-tl rounded-bl bg-gray-200 w-auto max-w-[40vw] min-h-full transition-all duration-300 ease-in-out `
                ]"
            >
                <PublicHierarchicalNavigation/>
            </div>
            <div
                v-if="
                    navigationStore.isAlphabetical ||
                    navigationStore.isHierarchical
                "
                id="gridContainer"
                ref="gridContainer"
                class="px-8 py-8 min-w-auto max-w-full flex-shrink flex-grow bg-white rounded-md shadow-lg border border-gray-200"
            >
                <PublicGrid class="flex-shrink">
                    <PublicOpenHierarchical class="hidden md:block" />
                    <PublicNavigationToggler class="hidden md:block" />
                </PublicGrid>
            </div>
            <div
                v-if="navigationStore.isDiagram"
                class="min-w-full p-8 flex-shrink flex-grow bg-gray-50 rounded-md shadow-lg border border-gray-200"
                id="diagram"
            >
                <div
                    class="flex flex-col items-center justify-center h-auto max-w-full"
                >
                <div id="diagramMenu" class="flex flex-row justify-between items-center w-full">
                    <h1 class="text-2xl font-semibold">Visão de Diagrama</h1>
                    <PublicNavigationToggler
                        v-if="!navigationStore.isSmallScreen"
                        class="self-end mb-4"
                    />
                </div>
                    
                    <PublicDiagram class="order-2  min-h-full border border-gray-200 rounded shadow-lg" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({});

const navigationStore = useNavigationStore();
const conceptStore = useConceptStore();

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
const gridContainer: Ref<HTMLElement | null> = ref(null);
const gridCurrentHeight = ref(0);

let gridResizeObserver: ResizeObserver;

onMounted(() => {
    if (gridContainer.value?.offsetHeight) {
        gridResizeObserver = new ResizeObserver(() => {
            if (gridContainer.value) {
                gridCurrentHeight.value = gridContainer.value.offsetHeight;
            }
        });
        gridResizeObserver.observe(gridContainer.value);
    }

    navigationStore.validateScreenSize();
    initializeUserPreferencesOnStore();

    window.addEventListener('resize', () =>
        navigationStore.validateScreenSize()
    );
});

onUnmounted(() => {
    if (gridResizeObserver && gridContainer.value) {
        gridResizeObserver.unobserve(gridContainer.value);
    }
});
const currentNavigationOnStore = computed(() => {
    return navigationStore.currentNavigationMode;
});
watch(currentNavigationOnStore, (newNavigationMode) => {
    console.log(currentNavigationOnStore.value);
    conceptStore.clear();
});
</script>
