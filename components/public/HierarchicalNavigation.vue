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

    <USlideover
        v-if="navigationStore.screen.isSmall"
        v-model="navigationStore.isSlideOverOpen"
        class="text-pmca-primary h-screen"
        side="left"
        :ui="{
            background: 'bg-gray-100'
        }"
    >
        <div class="p-4 h-full">
            <div class="flex flex-row justify-between">
                <div class="text-lg font-semibold">Classificação</div>

                <UIIcon
                    name="ph:x"
                    class="ml-auto"
                    title="Fechar navegação"
                    @click="navigationStore.toggleSlideOver"
                />
            </div>
            <div id="treeViewWrapper" class="w-full h-5/6 h-max-[4/5]">
                <UITreeView
                    :tree="conceptsTree"
                    :concept-store="
                    useConceptStoreForTree ? conceptStore : undefined
                "
                    class="mt-6 overflow-y-auto overflow-x-auto w-full max-h-full"
                    v-if="conceptsTree.length > 0"
                />
            </div>
        </div>
    </USlideover>
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
