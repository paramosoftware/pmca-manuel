<template>
    <div class="w-full h-full whitespace-nowrap text-md" ref="treeViewRef">
        <ul>
            <li>
                <div v-for="(node, index) in treeRef" class="mb-2">
                    <UITreeNode
                        :node="node"
                        :level="1"
                        :concept-store="conceptStore"
                        :show-position="showPosition"
                        :load-expanded="false"
                        :position-among-siblings="index + 1"
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
    showPosition: {
        type: Boolean,
        default: true
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
        });
    }
});
</script>
