<template>
    <div
        id="container"
        class="flex flex-grow max-h-max shadow-lg zborder-gray-200 rounded-lg border"
    >
        <div
            id="left"
            ref="leftRef"
            class="bg-gray-50 p-5 overflow-auto hidden lg:block w-[500px] border-r-2 border-gray-200"
            v-if="showLeftSide"
        >
            <GuideNavigationLeftSide
                :is-slide-over-open="isSlideOverOpen"
                @slide-over-close="isSlideOverOpen = false"
            />
        </div>
        <div
            id="right"
            class="bg-white max-h-max overflow-x-auto items-center w-full"
            ref="rightRef"
        >
            <PublicPage
                :title="data ? data.title : props.title"
                :show-breadcrumb="true"
                :has-header="true"
                :add-horizontal-line="true"
                :add-border="false"
                :is-guide="true"
            >
                <template #actions-sub-title>
                    Abrir navegação:
                </template>
                <template #actions-sub-icons>
                    <UIIcon
                        name="ph:toolbox"
                        title="Abrir navegação"
                        @click="isSlideOverOpen = true"
                    />
                </template>
                <GuideContent />
            </PublicPage>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: 'Inicio'
    },
    individualCard: {
        type: Boolean,
        default: false
    },
    userSelection: {
        type: Boolean,
        default: false
    },
    useConceptStoreForTree: {
        type: Boolean,
        default: true
    }
});

const route = useRoute();
const currentManualPath = route.path.split('/').slice(2).join('/');
const { data } = useAsyncData('title', () =>
    queryContent(currentManualPath).findOne()
);
const showLeftSide = computed(() => true);
const isSlideOverOpen = ref(false);
</script>

<style scoped>
::-webkit-scrollbar {
    height: 5px;
    width: 5px;
}
</style>
