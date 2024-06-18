<template>
    <div class="sm:flex items-center sm:justify-between sm:items-center">
        <div class="flex flex-col w-full">
            <UIPageTitle>
                <PublicBreadcrumb
                    :add-concept-link="userSelection"
                    class="overflow-x-auto"
                />
                {{ title }}
            </UIPageTitle>
            <div class="flex justify-end mb-4 mt-4 sm:mt-0 sm:mb-0">
                <span v-if="userSelection" class="flex items-center">
                    <UIIcon
                        name="ph:broom"
                        class="ml-3"
                        title="Desmarcar todos"
                        @click="conceptStore.clearSelection()"
                    />
                    <PublicExportDropdown class="ml-3" />
                </span>
            </div>
        </div>
    </div>

    <PublicListInputFilter />

    <PublicListAlphabeticalFilter v-if="hasAlphabeticalFilter" />

    <PublicListPageControls />

    <PublicListGrid />

    <PublicListPageControls :top="false" />
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: 'Termos'
    },
    userSelection: {
        type: Boolean,
        default: false
    },
    hasTree: {
        type: Boolean,
        default: true
    },
    hasAlphabeticalFilter: {
        type: Boolean,
        default: true
    }
});

const conceptStore = useConceptStore();
await conceptStore.load('', props.userSelection);
await conceptStore.fetchConceptsTree();

const userSelection = computed(() => {
    return props.userSelection;
});

watch(userSelection, async () => {
    await conceptStore.load('', true);
});

onUnmounted(() => {
    conceptStore.clear();
});
</script>
