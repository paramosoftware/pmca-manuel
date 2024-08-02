<template>
    <article v-if="currentManualPath">
        <ContentDoc class="markdown-content" :path="currentManualPath" />
   </article>
</template>

<script setup lang="ts">
const route = useRoute();
const currentManualPath = ref(route.path.split('/').slice(2).join('/'));

if (currentManualPath.value === '') {
    currentManualPath.value = '/';
}
</script>
