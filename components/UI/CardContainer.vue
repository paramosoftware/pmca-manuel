<template>
    <div class="flex flex-col justify-center items-center m-5 mb-auto">
        <div class="container mx-auto p-5 xl:p-10 2xl:p-15 bg-white mb-5 max-w-screen-lg min-h-[75vh]" :class="css">

        <slot name="header" />

        <UDivider class="w-full mt-2 mb-5" />

        <slot />

        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    border: {
        type: Boolean,
        default: true
    }
});

const css = computed(() => {
    const border = 'rounded-md shadow-md border border-neutral'
    return props.border ? (border) : '';
    
}) as ComputedRef<string>;
</script>