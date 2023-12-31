<template>
    <div class="mt-4">
        <label class="text-lg text-pmca-secondary first-letter:uppercase" :for="id">
            {{ label }}
        </label>

        <select
            class="w-full bg-gray-50 border border-gray-200 p-2 focus:outline-none focus:border-pmca-accent rounded-sm"
            :id="id"
            @input="handleInput"
        >

            <option v-if=!required :value="placeholder.id" disabled selected>
                {{ placeholder.name }}
            </option>

            <option v-for="option in options" :key="option.id"
                class="bg-white hover:bg-gray-100"
                :value="option.id"
                :selected="option.id === modelValue.id">
                {{ option.name }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    id: String,
    label: String,
    modelValue: {
        type: Object as PropType<{ id: number, name: string }>,
        required: true
    },
    options: Array as PropType<{ id: number, name: string }[]>,
    required: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (target.value.toString() === '0' && props.required) {
        const option = props.options[0];
        emit('update:modelValue', { id: option.id, name: option.name });
        return;
    }

    const id = parseInt(target.value);
    const option = props.options.find(option => option.id === id) ?? { id: 0, name: '' };
    emit('update:modelValue', { id, name: option.name });
}

handleInput({ target: { value: props.modelValue.id } } as unknown as Event);

const placeholder = ref({ id: 0, name: '' });

</script>

