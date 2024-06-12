<template>
    <div
        id="icons"
        class="order-1 md:order-2 lg:order-2 flex flex-row justify-end items-center h-auto"
    >
        <div
            class="p-4 bg-gray-50 flex flex-col space-y-4 justify-center items-center h-auto mb-2 rounded-md shadow-lg border border-gray-200"
        >
            <h2 class="hidden md:block lg:block font-semibold">Visualização</h2>
            <div
                id="navigationButtonsContainer"
                class="p-4 flex space-x-8 px-4"
            >
                <span class="flex flex-col items-center">
                    <UIIcon
                        @click="
                            saveLastSelectedNavigation(
                                navigationModes.hierarchical
                            )
                        "
                        name="ph:tree-structure"
                        :class="{
                            ...navigationStylingConditionals.hierarchical
                        }"
                        title="Utilizar classificação hierárquica."
                    />
                    <h4
                        :class="{
                            ...navigationStylingConditionals.hierarchical
                        }"
                    >
                        Hierárquica
                    </h4>
                </span>
                <span class="flex flex-col items-center">
                    <UIIcon
                        @click="
                            saveLastSelectedNavigation(
                                navigationModes.alphabetical
                            )
                        "
                        name="ph:text-aa"
                        :class="{
                            ...navigationStylingConditionals.alphabetical
                        }"
                        title="Utilizar listagem alfabética."
                    />
                    <h4
                        :class="{
                            ...navigationStylingConditionals.alphabetical
                        }"
                    >
                        Alfabética
                    </h4>
                </span>
                <span class="flex flex-col items-center">
                    <UIIcon
                        @click="
                            saveLastSelectedNavigation(navigationModes.diagram)
                        "
                        name="ph:align-top-simple"
                        :class="{
                            ...navigationStylingConditionals.diagram
                        }"
                        title="Utilizar visão de diagrama"
                    />
                    <h4
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
        'text-black': !navigationStore.isHierarchical,
        'bg-white text-pmca-green-600 ':
            navigationStore.isHierarchical || navigationStore.isDefault
    },
    alphabetical: {
        'text-black': !navigationStore.isAlphabetical,
        'bg-white text-pmca-green-600': navigationStore.isAlphabetical
    },
    diagram: {
        'text-black': !navigationStore.isDiagram,
        'bg-white text-pmca-green-600': navigationStore.isDiagram
    }
}));

onBeforeMount(() => {});
</script>
