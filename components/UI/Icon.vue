<template>
    <span class="flex" v-if="title">
        <UDropdown 
            mode="hover" 
            :items="items" 
            :popper="{ placement: placement }" 
            :ui="{ width: 'w-30', padding: 'p-0', background: 'bg-gray-100 opacity-90' }"
        >
            <Icon :name="name" :class="css" @click="onClick($event)" :size="selectedSize" />
        </UDropdown>
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
        type: String as PropType<'sm' | 'md' | 'lg'>,
        default: '',
    },
    variant: {
        type: String,
        default: 'default'
    },
});

const sizes = {
    sm: '1.5rem',
    md: '2rem',
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

let items = [
    [{
        label: props.title,
        class: 'cursor-default text-sm justify-center text-black',
        disabled: true
    }]
];

watch(() => props.title, (value) => {
    items[0][0].label = value;
});

</script>