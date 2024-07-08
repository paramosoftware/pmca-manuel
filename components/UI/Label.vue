<template>
    <label
        class="text-xl text-app-secondary first-letter:uppercase"
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
