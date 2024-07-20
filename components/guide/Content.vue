<template>
    <div v-if="currentManualPath">
        <ContentDoc class="markdown-content" :path="currentManualPath" />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const currentManualPath = ref(route.path.split('/').slice(2).join('/'));
</script>
