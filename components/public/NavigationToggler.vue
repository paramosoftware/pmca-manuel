<template>
    <div
        id="icons"
        class="order-1 md:order-2 lg:order-2 flex flex-row justify-end items-center h-auto"
    >
        <div
            class="flex flex-col justify-center items-center h-auto mb-2 rounded-tr-md rounded-br-md md:rounded-md shadow-lg border md:border-gray-200 bg-gray-50"
        >
            <h2
                class="hidden md:block lg:block font-semibold text-pmca-primary"
            >
                Visualização
            </h2>
            <div
                id="navigationButtonsContainer"
                class="flex space-x-4 p-2 md:space-x-8 md:px-4"
            >
                <UINavigationOption
                    :dropDownTitle="'Utilizar classificação hierárquica'"
                    :selectedNavigationMode="navigationModes.hierarchical"
                    :navigationStylingConditionals="
                        navigationStore.isHierarchical ||
                        navigationStore.isDefault
                    "
                    :iconName="'tree-structure'"
                    :placeholder="'Hierárquica'"
                />

                <UINavigationOption
                    :dropDownTitle="'Utilizar listagem alfabética'"
                    :selectedNavigationMode="navigationModes.alphabetical"
                    :navigationStylingConditionals="
                        navigationStore.isAlphabetical
                    "
                    :iconName="'text-aa'"
                    :placeholder="'Alfabética'"
                />

                <UINavigationOption
                    :dropDownTitle="'Utilizar visão de diagrama'"
                    :selectedNavigationMode="navigationModes.diagram"
                    :navigationStylingConditionals="navigationStore.isDiagram"
                    :iconName="'align-top-simple'"
                    :placeholder="'Diagrama'"
                />
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

onBeforeMount(() => {});
</script>
