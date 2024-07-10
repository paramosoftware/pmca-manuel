<template>
    <label
        class="text-xl text-app-theme-500 first-letter:uppercase font-[525]" 
        :for="id"
        v-if="showLabel"
    >
        <slot />
    </label>
</template>

<script setup lang="ts">
defineProps({
    id: String,
    showLabel: {
        type: Boolean,
        default: true
    }
});
</script>
