<template>
    <UTooltip
        :text="help"
        :class="{ 'cursor-help': cursorHelp }"
        :popper="{
            arrow: true,
            // @ts-ignore
            placement: placement
        }"
        :ui="{
            background: 'bg-gray-50 opacity-95',
            color: 'text-gray-600',
            shadow: 'shadow-lg',
            rounded: 'rounded-md',
            base: 'text-sm text-wrap h-full',
        }"
    >
        <slot />
    </UTooltip>
</template>

<script setup lang="ts">
const props = defineProps({
    help: {
        type: String,
        required: true
    },
    cursorHelp: {
        type: Boolean,
        default: false
    },
    placement: {
        type: String,
        default: 'bottom'
    }
});
</script>
