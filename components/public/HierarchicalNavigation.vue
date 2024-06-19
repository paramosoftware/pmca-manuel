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

defineOptions({
    inheritAttrs: false
});

const isHovered = ref(null);
const isPinned = ref(false);
const isOpen = computed(() => {
    return isHovered.value || isPinned.value;
});

watch(isPinned, (newPinValue) => {
    localStorage.setItem('isPinned', newPinValue.toString());
});

const conceptStore = useConceptStore();
await conceptStore.fetchConceptsTree();
const navigationStore = useNavigationStore();

const { conceptsTree } = storeToRefs(conceptStore);
onMounted(() => {
    navigationStore.validateScreenSize();
    isPinned.value = localStorage.getItem('isPinned') === 'true';
});
</script>
