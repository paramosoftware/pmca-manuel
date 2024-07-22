<template>
    <UILink :to="href">
        <span
            :class="[
                {
                    'text-app-theme-500': parentConditional
                }
            ]"
        >
            <slot />
        </span>
    </UILink>
</template>

<script setup lang="ts">
defineProps({
    href: {
        type: String,
        default: '/'
    },
    parentConditional: {
        type: Boolean,
        default: false,
        required: true
    }
});
</script>
