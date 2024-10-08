<template>
    <div class="flex flex-row justify-end" v-if="closed">
        <UIIcon
            name="ph:tree-view"
            class="hover:text-app-theme-500"
            :title="`Clique aqui ou arraste a faixa divisória para a direita para abrir a ${hierarchyName}`"
            @click="openNavigation()"
        />
    </div>

    <div class="bg-gray-50" v-show="!closed">
        <div
            class="flex flex-row justify-between border-b border-gray-200 mb-5 items-center"
        >
            <div class="text-xl font-semibold py-2 flex flex-row">
                <UIIcon :name="hierarchyIcon" class="mr-3" variant="static" />
                <div class="first-letter:uppercase">
                    {{ hierarchyName }}
                </div>
            </div>
            <UICloseButton
                @click="closeNavigation()"
                :is-positioned-right="false"
            />
        </div>

        <PublicHierarchicalNavigation
            :useConceptStoreForTree="useConceptStoreForTree"
            :class="`overflow-auto max-h-screen`"
            :style="{ maxHeight: panelMaxHeight }"
        />

        <USlideover
            v-model="isSidePanelOpen"
            class="text-app-primary h-screen lg:hidden"
            side="left"
            :ui="{
                background: 'bg-gray-100',
                width: 'w-screen max-w-lg'
            }"
        >
            <div
                class="flex flex-row justify-between border-b border-gray-200 mb-5 p-3 items-center"
            >
                <div class="text-xl font-semibold p-3 flex flex-row items-center">
                    <UIIcon :name="hierarchyIcon" class="mr-3" />
                    <div class="first-letter:uppercase">
                        {{ hierarchyName }}
                    </div>
                </div>
                <UICloseButton
                    @click="isSidePanelOpen = false"
                    :is-positioned-right="false"
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
const panelMaxHeight = ref('80vh');
const minHeight = ref(0);

const isSidePanelOpen = ref(false);

watch(
    () => props.isSlideOverOpen,
    (value) => {
        isSidePanelOpen.value = value;
    }
);

watch(
    () => isSidePanelOpen.value,
    (value) => {
        if (!value) {
            emit('slideOverClose');
        }
    }
);


function setPanelMaxHeight() {
    let fullCardElement = document.getElementById('full-card')!;
    const navbarElement = document.getElementById('navbar')!;
    const footerElement = document.getElementById('footer')!;

    if (!fullCardElement) {
        fullCardElement = document.getElementById('right')!;
    }
    
    if (fullCardElement) {
        const fullCardHeight = fullCardElement.clientHeight;
        const navbarHeight = navbarElement.clientHeight;
        const footerHeight = footerElement.clientHeight;
        const windowHeight = window.innerHeight;
        const minHeight = windowHeight - navbarHeight - footerHeight - 100;

        if (fullCardHeight > minHeight) {
            panelMaxHeight.value = `${fullCardHeight}px`;
        } else {
            panelMaxHeight.value = `${minHeight}px`;
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const fullCardHeight = entry.target.clientHeight;
                if (fullCardHeight > minHeight) {
                    panelMaxHeight.value = `${fullCardHeight}px`;
                } else {
                    panelMaxHeight.value = `${minHeight}px`;
                }
            }
        });

        resizeObserver.observe(fullCardElement);
    }
}


onMounted(() => {
    window.setTimeout(() => {
        setPanelMaxHeight();
    }, 750);
});
</script>

<style scoped>
::-webkit-scrollbar {
    height: 5px;
    width: 5px;
}
</style>
