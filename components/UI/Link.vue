<template>
    <NuxtLink :to="href">
        <span class="text-app-secondary-500 hover:text-app-theme-500">
            <slot />
        </span>
    </NuxtLink>
</template>

<script setup lang="ts">
defineProps({
    href: {
        type: String,
        default: '/'
    }
});
</script>
