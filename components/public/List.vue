<template>
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
</script>
