<template>
    <NuxtLink :to="href">
        <span class="text-pmca-secondary-dark hover:text-pmca-accent">
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
})
</script>


