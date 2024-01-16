<template>
    <div class="flex flex-col justify-center items-center m-5 mb-auto">
        <div class="container mx-auto p-5 bg-white border border-neutral rounded-md shadow-sm mb-5" :class="size">

        <slot name="header" />

        <UDivider class="w-full mt-2 mb-5" />

        <slot />

        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    size: {
        type: String as PropType<'sm' | 'md' | 'lg' | 'xl' | '2xl'>,
        default: 'lg'
    }
});

const size = computed(() => 'max-w-screen-' + props.size) as ComputedRef<string>;
</script>