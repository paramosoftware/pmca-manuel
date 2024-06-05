<template>
    <main
        class="shadow-lg border border-gray-200 rounded-md bg-white p-5 xl:p-8 2xl:p-10 min-h-[70vh] mx-auto max-w-screen-2xl"
    >
        <PublicBreadcrumb :add-concept-link="false" v-if="showBreadcrumb" />
        <UIPageTitle class="border-b-2 border-gray-200 pb-1 mb-4" v-if="title">
            {{ title }}
        </UIPageTitle>
        <slot></slot>
    </main>
</template>

<script setup lang="ts">
defineProps({
    title: {
        type: String,
        default: ''
    },
    showBreadcrumb: {
        type: Boolean,
        default: true
    }
});
</script>
