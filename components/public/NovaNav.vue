<template>
    <div
        class="px-8 my-2 mb-4 md:flex flex-col items-stretch h-full w-full max-w-full rounded-md"
    >
        <div
            id="firstRow"
            class="flex md:flex-row lg:flex-row w-full justify-between items-center md:justify-end lg:justify-end"
        >
            <div
                id="openHierarchical"
                @click="navigationStore.toggleOpen"
                :class="[
                    'border-gray-200 border p-4 mb-2 shadow-lg rounded order-1 md:order-1 md:hidden lg:hidden lg:order-1 space-x-2 text-lg font-semibold cursor-pointer bg-gray-100',
                    {
                        // 'bg-gray-100': !navigationStore.hierarchical.isOpen,
                        // 'bg-gray-200': navigationStore.hierarchical.isOpen
                    }
                ]"
            >
                {{
                    navigationStore.hierarchical.isOpen
                        ? 'Esconder classificação'
                        : 'Abrir classificação'
                }}
                <UIIcon
                    name="ph:tree-structure"
                    class="ml-auto"
                    cursor-class=""
                />
            </div>
            <div
                id="icons"
                class="order-2 md:order-2 lg:order-2 flex flex-row justify-end items-center"
            >
                <div></div>
                <div
                    class="p-8 space-x-12 flex flex-row justify-center items-center bg-gray-50 h-12 mb-2 rounded-md shadow-lg border border-gray-200"
                >
                    <UIIcon
                        @click="
                            saveLastSelectedNavigation(
                                navigationModes.hierarchical
                            )
                        "
                        name="ph:tree-structure"
                        :class="{
                            'text-black': !navigationStore.isHierarchical,
                            'bg-white text-pmca-green-600 ':
                                navigationStore.isHierarchical ||
                                navigationStore.isDefault,
                            'cursor-help': true
                        }"
                        title="Utilizar classificação hierárquica."
                    />
                    <UIIcon
                        @click="
                            saveLastSelectedNavigation(
                                navigationModes.alphabetical
                            )
                        "
                        name="ph:text-aa"
                        :class="{
                            'text-black': !navigationStore.isAlphabetical,
                            'bg-white text-pmca-green-600':
                                navigationStore.isAlphabetical
                        }"
                        title="Utilizar listagem alfabética."
                    />
                    <UIIcon
                        @click="
                            saveLastSelectedNavigation(navigationModes.diagram)
                        "
                        name="ph:align-top-simple"
                        :class="{
                            'text-black': !navigationStore.isDiagram,
                            'bg-white text-pmca-green-600':
                                navigationStore.isDiagram
                        }"
                        title="Utilizar visão de diagrama"
                    />
                </div>
            </div>
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
                :class="
                    ([
                        'hidden md:block lg:block min-w-auto w-auto max-w-[40vw]'
                    ],
                    {
                        'resize-x overflow-auto max-w-[40vw]':
                            navigationStore.isHierarchicalViewOpen
                    })
                "
                @mouseenter="navigationStore.updateHoverState"
                @mouseleave="navigationStore.updateHoverState"
            >
                <PublicHierarchicalNavigation class="w-full max-w-[40vw]" />
            </div>
            <div
                v-if="
                    navigationStore.isAlphabetical ||
                    navigationStore.isDefault ||
                    navigationStore.isHierarchical
                "
                id="grid"
                class="px-8 py-8 flex-shrink flex-grow bg-gray-50 rounded-md shadow-lg border border-gray-200"
            >
                <PublicGrid class="flex-shrink-0" />
            </div>

            <div
                v-if="navigationStore.isDiagram"
                class="max-w-full p-4 flex-shrink flex-grow bg-gray-50 rounded-md shadow-lg border border-gray-200"
                id="diagram"
            >
                <div
                    class="flex items-center justify-center flex-row h-auto max-w-full"
                >
                    <p>
                        <img src="../../data/media/diagram.png" class="h-4/5" />
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({});
const navigationStore = useNavigationStore();
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

onBeforeMount(() => {});

const navigationModes = {
    hierarchical: 'hierarchical',
    alphabetical: 'alphabetical',
    diagram: 'diagram',
    default: 'default'
};

const navigationMode = ref();

const saveLastSelectedNavigation = (selectedNavigation: string) => {
    localStorage.setItem('lastSelectedNavigation', selectedNavigation);
    navigationStore.setNavigationMode(selectedNavigation);
    navigationMode.value = selectedNavigation;
    console.log(navigationMode);
};

onMounted(() => {
    navigationStore.validateScreenSize();
    initializeUserPreferencesOnStore();
    window.addEventListener('resize', () =>
        navigationStore.validateScreenSize()
    );
});

onBeforeMount(() => {
    navigationMode.value = localStorage.getItem('lastSelectedNavigation')
        ? localStorage.getItem('lastSelectedNavigation')
        : navigationModes.default;
});
</script>
