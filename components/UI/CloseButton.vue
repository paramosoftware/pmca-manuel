<template>
    <button type="button" @click="$emit('click')" :class="{ 'absolute top-2 right-2': isPositionedRight }">
        <span class="sr-only">Fechar</span>
        <UIIcon name="ph:x" title="Fechar" />
    </button>
</template>

<script setup lang="ts">
defineProps({
    isPositionedRight: {
        type: Boolean,
        default: true
    }
});
</script>