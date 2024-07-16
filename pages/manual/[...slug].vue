<template>
    <main class="h-full w-full text-app-primary bg-gray-200 flex-grow flex">
           <UIManualNavBar class="p-4"/>
           <PublicManualContent class="p-4"/>
         
    </main>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});


const route = useRoute();
const currentPath = computed(() => {
    return route.path;
})

// const queryParam = route.query;
</script>