<template>
    <div
        id="hierarchicalWrapper"
        class="flex flex-col h-full bg-gray-200 rounded-tl-lg rounded-bl-lg"
    >
        <div
            id="firstRowHierarchical"
            :class="[
                ' rounded-tl-lg justify-center p-4 flex flex-row',
                { 'bg-gray-200': !navigationStore.hierarchical.isOpen },
                {
                    'bg-gray-50 border-t border-l border-b border-gray-200 ':
                        navigationStore.hierarchical.isHovered ||
                        navigationStore.hierarchical.isOpen
                }
            ]"
        >
            <UIIcon
                v-show="navigationStore.isHierarchicalViewOpen"
                name="ph:push-pin"
                :class="[
                    ' hover:text-pmca-accent w-6 h-6 m-4',
                    {
                        'text-pmca-accent':
                            navigationStore.hierarchical.isPinned
                    },
                    hierarchicalOpenHoverConditionals
                ]"
                title="Fixar"
                @click="navigationStore.pinHierarchicalView"
            />
            <div
                :class="[
                    'text-lg font-semibold ml-4 my-4',
                    hierarchicalOpenHoverConditionals
                ]"
            >
                Classificação
            </div>
            <UIIcon name="ph:tree-structure" class="my-4 block w-24 h-8" />
        </div>

        <UITreeView
            :tree="conceptsTree"
            :concept-store="useConceptStoreForTree ? conceptStore : undefined"
            v-if="conceptsTree.length > 0"
            :class="[
                'hidden md:block lg:block pt-2 mx-8 h-max-full',
                hierarchicalOpenHoverConditionals
            ]"
        />
    </div>

    <USlideover
        v-if="navigationStore.screen.isSmall"
        v-model="navigationStore.hierarchical.isOpen"
        class="md:hidden lg:hidden text-pmca-primary"
        side="left"
        :ui="{
            background: 'bg-gray-100'
        }"
    >
        <div class="p-4 overflow-x-auto">
            <div class="flex flex-row justify-between">
                <div class="text-lg font-semibold">Classificação</div>

                <UIIcon
                    name="ph:x"
                    class="ml-auto"
                    title="Fechar navegação"
                    @click="navigationStore.toggleOpen"
                />
            </div>

            <UITreeView
                :tree="conceptsTree"
                class="mt-6"
                v-if="conceptsTree.length > 0"
            />
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

const hierarchicalOpenHoverConditionals = computed(() => {
    return {
        'hidden md:hidden lg:hidden': !navigationStore.hierarchical.isOpen,
        'hidden md:block lg:block':
            navigationStore.hierarchical.isHovered ||
            navigationStore.hierarchical.isOpen ||
            navigationStore.hierarchical.isPinned
    };
});
const conceptStore = useConceptStore();
await conceptStore.fetchConceptsTree();
const navigationStore = useNavigationStore();

const { conceptsTree } = storeToRefs(conceptStore);
onMounted(() => {
    navigationStore.validateScreenSize();
});
</script>
