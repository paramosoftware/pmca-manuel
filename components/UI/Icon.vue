<template>
    <span class="flex" v-if="title">
        <UITooltip :help="title" :placement="placement">
            <Icon :name="name" :class="css" @click="onClick($event)" :size="selectedSize" />
        </UITooltip>
    </span>

    <Icon :name="name" :class="css" @click="onClick" v-else :size="selectedSize" />
</template>

<script setup lang="ts">
const props = defineProps({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    base: {
        type: String,
        default: ''
    },
    cursorClass: {
        type: String,
        default: ''
    },
    placement: {
        type: String,
        default: 'bottom',
        required: false,
    },
    size: {
        type: String as PropType<'xs' | 'sm' | 'md' | 'lg'>,
        default: '',
    },
    variant: {
        type: String,
        default: 'default'
    },
});

const sizes = {
    xs: '0.75rem',
    sm: '1.25rem',
    md: '1.75rem',
    lg: '3rem'
};

const variants = {
    default: {
        base: 'text-app-secondary-500 hover:text-app-theme-500',
        size: 'md',
        cursor: 'cursor-pointer',
    },
    button: {
        base: 'text-white hover:text-white',
        size: 'sm',
        cursor: 'cursor-pointer',
    },
    static: {
        base: 'text-app-theme-500',
        size: 'md',
        cursor: 'cursor-default',
    },
};

// @ts-ignore
const selectedVariant = computed(() => variants[props.variant] || variants.default);
// @ts-ignore
const selectedSize = computed(() => sizes[props.size || selectedVariant.value.size || 'md']);

const css = computed(() => ` ${selectedVariant.value.base} ${props.base} ${selectedVariant.value.cursor} ${props.cursorClass}`);

const emit = defineEmits(['click']);
function onClick($event: Event) {
    emit('click', $event);
}
</script>