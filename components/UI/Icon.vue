<template>
    <span class="flex" v-if="title">
        <UDropdown 
            mode="hover" 
            :items="items" 
            :popper="{ placement: props.placement }" 
            :ui="{ width: 'w-30', padding: 'p-0', background: 'bg-gray-100 opacity-90' }"
        >
            <Icon :name="name" :class="css" @click="onClick($event)" />
        </UDropdown>
    </span>

    <Icon :name="name" :class="css" @click="onClick" v-else />
    
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
    class: {
        type: String,
        default: ''
    },
    cursorClass: {
        type: String,
        default: 'cursor-pointer'
    },
    placement: {
        type: String,
        default: 'bottom',
        required: false,
    }
});

const css = computed(() => props.class + ' ' + props.cursorClass);

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