<template>
    <div
        class="mt-2 md:flex flex-col items-stretch h-full w-full max-w-full rounded-md"
    >
        <div id="icons" class="flex flex-row justify-end items-center">
            <div></div>
            <div
                class="flex flex-row justify-center items-center bg-gray-50 h-12 mb-2 rounded-md shadow-lg border border-gray-200 p-1"
            >
                <UIIcon
                    @click="
                        saveLastSelectedNavigation(navigationModes.hierarchical)
                    "
                    name="ph:tree-structure"
                    :class="{
                        'text-black w-6 mr-4': !isHierarchical,
                        'bg-white text-blue-500 w-6 mr-4': isHierarchical,
                        'cursor-help': true
                    }"
                    title="Utilizar classificação hierárquica."
                />
                <UIIcon
                    @click="
                        saveLastSelectedNavigation(navigationModes.alphabetical)
                    "
                    name="ph:text-aa"
                    :class="{
                        'text-black w-6 mr-4': !isAlphabetical,
                        'bg-white text-blue-500 w-6 mr-4': isAlphabetical
                    }"
                    title="Utilizar listagem alfabética."
                />
                <UIIcon
                    @click="saveLastSelectedNavigation(navigationModes.diagram)"
                    name="ph:align-top-simple"
                    :class="{
                        'text-black w-6 mr-4': !isDiagram,
                        'bg-white text-blue-500 w-6 mr-4': isDiagram
                    }"
                    title="Utilizar visão de diagrama"
                />
            </div>
        </div>
        <div
            id="wrapperye"
            class="rounded-tl-lg rounded-bl-lg flex flex-shrink-0 h-auto"
        >
            <div
                v-if="isHierarchical || isDefault"
                id="hierarchical"
                class="w-auto max-w-[40vw]"
            >
                <PublicHierarchicalNavigation  />
            </div>
            <div
                v-if="isAlphabetical || isDefault || isHierarchical"
                id="grid"
                class="px-8 py-8 flex-shrink flex-grow bg-gray-50 rounded-md shadow-lg border border-gray-200"
            >
                <PublicGrid class="flex-shrink-0" />
            </div>

            <div
                v-if="isDiagram"
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

// Maybe see a more clean way?  Being more verbose here helps readability on template. Otherwise oyu need to put all conditionals on the v-ifs.
const navigationModes = {
    hierarchical: 'hierarchical',
    alphabetical: 'alphabetical',
    diagram: 'diagram',
    default: 'default'
};
const isHierarchical = computed(() => {
    return navigationMode.value == navigationModes.hierarchical;
});

const isAlphabetical = computed(() => {
    return navigationMode.value == navigationModes.alphabetical;
});

const isDiagram = computed(() => {
    return navigationMode.value == navigationModes.diagram;
});

const isDefault = computed(() => {
    return navigationMode.value == navigationModes.default;
});

const navigationMode = ref();

const saveLastSelectedNavigation = (selectedNavigation: string) => {
    localStorage.setItem('lastSelectedNavigation', selectedNavigation);
    navigationMode.value = selectedNavigation;
    console.log(navigationMode);
};

onBeforeMount(() => {
    navigationMode.value = localStorage.getItem('lastSelectedNavigation')
        ? localStorage.getItem('lastSelectedNavigation')
        : navigationModes.default;
});
</script>

<style>
#hierarchical {
   
}
</style>
