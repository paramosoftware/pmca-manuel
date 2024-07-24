<template>
    <div class="bg-gray-50">
        <div
            class="flex flex-row justify-between border-b border-gray-200 mb-5 items-center"
        >
            <div class="text-xl font-semibold py-2 flex flex-row">
                <UIIcon :name="hierarchyIcon" class="mr-3" variant="static" />
                <div class="first-letter:uppercase">
                    {{ hierarchyName }}
                </div>
            </div>
        </div>
        <GuideTreeView :tree="navigation"/>
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
                <GuideTreeView :tree="navigation" />
            </div>
        </USlideover>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    isSlideOverOpen: {
        type: Boolean,
        default: false
    },
    hierarchyName: {
        type: String,
        default: 'manual'
    },
    hierarchyIcon: {
        type: String,
        default: 'ph:toolbox'
    }
});
const { data: navigation } = await useAsyncData('navigation', () =>
    fetchContentNavigation()
);
const emit = defineEmits(['slideOverClose']);
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

</script>

<style scoped>
::-webkit-scrollbar {
    height: 5px;
    width: 5px;
}
</style>
