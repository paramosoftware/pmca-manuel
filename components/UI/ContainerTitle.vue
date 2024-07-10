<template>
    <h3 class="mt-3 font-semibold" :class="`text-${size}`">
        <slot />
    </h3>
</template>

<script setup lang="ts">
const props = defineProps({
    size: {
        type: String,
        default: '3xl'
    }
});
</script>