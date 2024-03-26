<template>
    <div
        class="w-full h-1 fixed top-0 left-0 bg-pmca-accent z-[1000] transition-all duration-500 shadow-lg shadow-pmca-accent"
        :style="{
            width: `${progress}%`
        }"
        v-if="loading"
    ></div>

    <div
        class="w-full h-full fixed top-0 left-0 bg-gray-500 bg-opacity-10 z-[999]"
        v-if="loading"
    ></div>
</template>

<script setup lang="ts">
const nuxtApp = useNuxtApp();
const loadingStore = useLoadingStore();

const { loading, progress } = storeToRefs(loadingStore);

nuxtApp.hook('page:start', () => {
    loadingStore.start();
});
nuxtApp.hook('page:finish', () => {
    loadingStore.stop();
});
</script>
