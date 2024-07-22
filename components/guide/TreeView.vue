<template>
    <div class="w-full h-full whitespace-nowrap text-md" ref="treeViewRef">
        <ul>
            <li>
                <div v-for="(node, index) in treeRef" class="mb-2 ">
                    <GuideTreeNode
                        :node="node"
                        :level="1"
                        :show-position="showPosition"
                        :load-expanded="true"
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
        type: Object as () => NavItem[] | null,
        required: true
    },
    showPosition: {
        type: Boolean,
        default: true
    },
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
