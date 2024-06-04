<template>
    <div class="w-full h-full whitespace-nowrap text-md" ref="treeViewRef">
        <ul>
            <li>
                <div v-for="node in treeRef" class="mb-2">
                    <UITreeNode
                        :node="node"
                        :level="1"
                        :concept-store="conceptStore"
                    />
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    tree: {
        type: Object as PropType<TreeNode[]>,
        required: true
    },
    conceptStore: {
        type: Object as PropType<ConceptStore>
    }
});

const treeRef = ref(props.tree);
const treeViewRef = ref<HTMLElement | null>(null);

watch(
    () => props.tree,
    (value) => {
        treeRef.value = value;
    }
);

onMounted(() => {
    if (treeViewRef.value) {
        treeViewRef.value.addEventListener('click', (event) => {
            if (!treeViewRef.value) {
                return;
            }

            const hasHorizontalScrollbar = treeViewRef.value.scrollWidth > treeViewRef.value.clientWidth;

            if (hasHorizontalScrollbar) {
                treeViewRef.value.scrollLeft = treeViewRef.value.scrollWidth;
            }
        });
    }
});
</script>
