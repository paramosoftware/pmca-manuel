<template>
    <div
        id="hierarchicalWrapper"
        class="flex flex-col h-full min-h-full bg-gray-200 rounded-tl-lg rounded-bl-lg border-t border-l border-b border-gray-200"
        :class="[{ 'bg-gray-50': isOpen }]"
        v-if="!navigationStore.isSmallScreen"
        @mouseenter="
            () => {
                if (!loadingStore.loading) isHovered = true;
            }
        "
        @mouseleave="
            () => {
                if (!loadingStore.loading) isHovered = false;
            }
        "
    >
        <div
            id="firstRowHierarchical"
            :class="[
                ' rounded-tl-lg justify-between items-center p-4 flex flex-row',
                { 'bg-gray-200': !isOpen },
                {
                    'bg-gray-50 border-t border-l border-b border-gray-200 ':
                        isHovered || isOpen
                }
            ]"
        >
            <UIIcon
                v-show="isOpen"
                name="ph:push-pin"
                :class="[
                    ' hover:text-pmca-accent w-6 h-6 m-4',
                    {
                        'text-pmca-accent': isPinned
                    },
                    hierarchicalOpenHoverConditionals
                ]"
                title="Fixar"
                @click="isPinned = !isPinned"
            />
            <div
                :class="[
                    'text-2xl font-semibold ml-4 my-4',
                    hierarchicalOpenHoverConditionals
                ]"
                class="sm: text-sm"
            >
                Classificação
            </div>
            <UIIcon name="ph:tree-structure" class="my-4 block w-24 h-8" />
        </div>
        <div
            id="treeViewContainer"
            class="w-full h-full max-h-full overflow-auto"
        >
            <UITreeView
                :tree="conceptsTree"
                :concept-store="
                    useConceptStoreForTree ? conceptStore : undefined
                "
                v-if="conceptsTree.length > 0"
                :class="[
                    'hidden md:block lg:block pt-2 mx-8',
                    hierarchicalOpenHoverConditionals
                ]"
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

const hierarchicalOpenHoverConditionals = computed(() => {
    return {
        'hidden md:hidden lg:hidden': !isOpen.value,
        'hidden md:block lg:block':
            isHovered.value || isOpen.value || isPinned.value
    };
});
const conceptStore = useConceptStore();
const loadingStore = useLoadingStore();
await conceptStore.fetchConceptsTree();
const navigationStore = useNavigationStore();

const { conceptsTree } = storeToRefs(conceptStore);
onMounted(() => {
    navigationStore.validateScreenSize();
    isPinned.value = localStorage.getItem('isPinned') === 'true';
});
</script>
