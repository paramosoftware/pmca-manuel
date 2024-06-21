<template>
    <div class="w-full h-full">
        <div
            id="treeViewContainer"
            class="w-full h-full"
        >
            <UITreeView
                :tree="conceptsTree"
                :concept-store="
                    useConceptStoreForTree ? conceptStore : undefined
                "
                v-if="conceptsTree.length > 0"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    useConceptStoreForTree: {
        type: Boolean,
        default: true
    }
});

const conceptStore = useConceptStore();
await conceptStore.fetchConceptsTree();
const { conceptsTree } = storeToRefs(conceptStore);
</script>
