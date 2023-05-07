<template>
    <div class="mt-4">
        <label class="text-lg uppercase text-red-900" :for="id">
            {{ label }}
        </label>
        <select :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
            :id="id">
            <option value="0"></option>
            <option v-for="option in options" :key="option[optionKey]"
                :value="option[optionValue]"
                :selected="option[optionValue] === modelValue">
                {{ option[optionLabel] }}
            </option>
        </select>
    </div>
</template>
  
<script setup lang="ts">
const props = defineProps({
    label: String,
    modelValue: [String, Number],
    id: String,
    options: Object,
    optionKey: {
        type: String,
        default: 'id',
    },
    optionValue: {
        type: String,
        default: 'id',
    },
    optionLabel: {
        type: String,
        default: 'name',
    },
})

console.log(props);

</script>