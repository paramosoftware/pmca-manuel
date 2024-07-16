<template>
    <div class="w-2/3 h-full">
        <div v-if="currentManualPath">
            Content:
            <ContentDoc :path="currentManualPath" />
            path:
            {{ currentManualPath }}
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const currentManualPath = ref(route.path.split('/').slice(2).join('/'));
</script>
