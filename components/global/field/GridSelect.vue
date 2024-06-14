<template>
    <UDropdown
        mode="hover"
        :items="items"
        :popper="{ placement: 'bottom' }"
        :ui="{
            width: 'w-30',
            padding: 'p-0',
            background: 'bg-gray-100 opacity-90'
        }"
    >
        <select v-model="selectedOption" class="border border-black rounded">
            <option
                v-for="option in options"
                :key="option.value"
                :value="option.value"
            >
                {{ option.name }}
            </option>
        </select>
    </UDropdown>
</template>

<script setup lang="ts">
const conceptStore = useConceptStore();
interface Option {
    name: string;
    value: number;
}
let items = [
    [
        {
            label: 'Seleção de conteúdo por página',
            class: 'cursor-default text-sm justify-center text-black',
            disabled: true
        }
    ]
];
const props = defineProps({
    options: {
        type: Array as PropType<Option[]>,
        default: [],
        required: true
    }
});

const selectedOption = ref(props.options[0].value);
watch(selectedOption, (currentSelectedOption) => {
    conceptStore.updatePageSize(currentSelectedOption);
});
</script>
