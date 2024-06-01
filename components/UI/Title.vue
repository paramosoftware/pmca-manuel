<template>
    <h3 
    class="text-xl text-pmca-secondary"
    :class="cssClass"
    :title="title"
    >
        <slot />
    </h3>
</template>


<script setup lang="ts">
defineProps({
    cssClass: {
        type: String,
        default: ''
    },
    title: {
        type: String,
    }
});

</script>
