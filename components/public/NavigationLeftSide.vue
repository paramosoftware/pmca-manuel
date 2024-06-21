<template>
    <div class="flex flex-row justify-end" v-if="closed">
        <UIIcon
            name="ph:tree-view"
            class="hover:text-pmca-accent"
            :title="`Arraste para a direita para abrir a ${hierarchyName}`"
            @click="openNavigation()"
        />
    </div>

    <div class="bg-gray-50" v-show="!closed">
        <div
            class="flex flex-row justify-between border-b border-gray-200 mb-5"
        >
            <div class="text-xl font-semibold py-3 flex flex-row">
                <UIIcon :name="hierarchyIcon" class="mr-3" />
                <div class="first-letter:uppercase">
                    {{ hierarchyName }}
                </div>
            </div>
            <UIIcon
                name="ph:x"
                class="mt-1 hover:text-pmca-accent text-xl"
                :title="`Fechar ${hierarchyName}`"
                @click="closeNavigation()"
            />
        </div>

        <PublicHierarchicalNavigation
            :useConceptStoreForTree="useConceptStoreForTree"
        />

        <USlideover
            v-model="isSidePanelOpen"
            class="text-pmca-primary h-screen lg:hidden"
            side="left"
            :ui="{
                background: 'bg-gray-100',
                width: 'w-screen max-w-lg'
            }"
        >
            <div
                class="flex flex-row justify-between border-b border-gray-200 mb-5 p-3"
            >
                <div class="text-xl font-semibold p-3 flex flex-row">
                    <UIIcon :name="hierarchyIcon" class="mr-3" />
                    <div class="first-letter:uppercase">
                        {{ hierarchyName }}
                    </div>
                </div>
                <UIIcon
                    name="ph:x"
                    class="hover:text-pmca-accent"
                    :title="`Fechar ${hierarchyName}`"
                    @click="isSidePanelOpen = false"
                />
            </div>

            <div class="px-3 pb-3 overflow-auto">
                <PublicHierarchicalNavigation
                    :useConceptStoreForTree="useConceptStoreForTree"
                />
            </div>
        </USlideover>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    useConceptStoreForTree: {
        type: Boolean,
        required: true
    },
    closed: {
        type: Boolean,
        required: true
    },
    openNavigation: {
        type: Function,
        required: true
    },
    closeNavigation: {
        type: Function,
        required: true
    },
    isSlideOverOpen: {
        type: Boolean,
        default: false
    },
    hierarchyName: {
        type: String,
        default: 'classificação'
    },
    hierarchyIcon: {
        type: String,
        default: 'ph:tree-view'
    }
});

const emit = defineEmits(['slideOverClose']);

const isSidePanelOpen = ref(false);

watch(() => props.isSlideOverOpen, (value) => {
    isSidePanelOpen.value = value;
});

watch(() => isSidePanelOpen.value, (value) => {
    if (!value) {
        emit('slideOverClose');
    }
});
</script>
