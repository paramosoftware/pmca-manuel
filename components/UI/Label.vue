<template>
    <label class="text-lg text-pmca-secondary first-letter:uppercase" :for="id" v-if="showLabel">
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
})
</script>
