<template>
    <div
        id="icons"
        class="order-1 md:order-2 lg:order-2 flex flex-row justify-end items-center h-auto"
    >
        <div
            class="p-4 bg-gray-50 flex flex-col space-y-4 justify-center items-center h-auto mb-2 rounded-md shadow-lg border border-gray-200"
        >
            <h2
                class="hidden md:block lg:block font-semibold text-pmca-primary"
            >
                Visualização
            </h2>
            <div id="navigationButtonsContainer" class="flex space-x-8 px-4">
                <span
                    @click="
                        saveLastSelectedNavigation(navigationModes.hierarchical)
                    "
                    class="flex flex-col items-center cursor-pointer"
                >
                    <UIIcon
                        :placement="'top'"
                        name="ph:tree-structure"
                        class="w-5 h-5"
                        :class="{
                            ...navigationStylingConditionals.hierarchical
                        }"
                        title="Utilizar classificação hierárquica."
                    />
                    <h4
                        class="text-xs"
                        :class="{
                            ...navigationStylingConditionals.hierarchical
                        }"
                    >
                        Hierárquica
                    </h4>
                </span>
                <span
                    @click="
                        saveLastSelectedNavigation(navigationModes.alphabetical)
                    "
                    class="flex flex-col items-center cursor-pointer"
                >
                    <UIIcon
                        :placement="'top'"
                        name="ph:text-aa"
                        class="w-5 h-5"
                        :class="{
                            ...navigationStylingConditionals.alphabetical
                        }"
                        title="Utilizar listagem alfabética."
                    />
                    <h4
                        class="text-xs"
                        :class="{
                            ...navigationStylingConditionals.alphabetical
                        }"
                    >
                        Alfabética
                    </h4>
                </span>
                <span
                    @click="saveLastSelectedNavigation(navigationModes.diagram)"
                    class="flex flex-col items-center cursor-pointer"
                >
                    <UIIcon
                        :placement="'top'"
                        name="ph:align-top-simple"
                        class="w-5 h-5"
                        :class="{
                            ...navigationStylingConditionals.diagram
                        }"
                        title="Utilizar visão de diagrama"
                    />
                    <h4
                        class="text-xs"
                        :class="{
                            ...navigationStylingConditionals.diagram
                        }"
                    >
                        Diagrama
                    </h4>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const navigationStore = useNavigationStore();

const navigationModes = {
    hierarchical: 'hierarchical',
    alphabetical: 'alphabetical',
    diagram: 'diagram',
    default: 'default'
};

const saveLastSelectedNavigation = (selectedNavigation: string) => {
    localStorage.setItem('lastSelectedNavigation', selectedNavigation);
    navigationStore.setNavigationMode(selectedNavigation);
};

const navigationStylingConditionals = computed(() => ({
    hierarchical: {
        'text-pmca-primary': !navigationStore.isHierarchical,
        'text-pmca-green-600 ':
            navigationStore.isHierarchical || navigationStore.isDefault
    },
    alphabetical: {
        'text-pmca-primary': !navigationStore.isAlphabetical,
        ' text-pmca-green-600': navigationStore.isAlphabetical
    },
    diagram: {
        'text-pmca-primary': !navigationStore.isDiagram,
        'text-pmca-green-600': navigationStore.isDiagram
    }
}));

onBeforeMount(() => {});
</script>
