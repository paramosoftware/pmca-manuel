<template>
    <NuxtLink :to="href">
        <span
            class="text-app-secondary-500 hover:text-app-theme-500"
            :class="{ 'text-app-theme-500 font-bold': active }"
        >
            <slot />
        </span>
    </NuxtLink>
</template>

<script setup lang="ts">
defineProps({
    href: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    }
});
</script>
