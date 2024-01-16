<template>
    <span class="inline-block align-middle" v-if="title">
        <UDropdown 
            mode="hover" 
            :items="items" 
            :popper="{ placement: 'bottom' }"
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
    }
});

const css = computed(() => props.class + ' ' + props.cursorClass);

const emit = defineEmits(['click']);
function onClick($event: Event) {
    console.log('click');
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