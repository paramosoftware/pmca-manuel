<template>
    <div class="mt-4">
        <label class="text-lg uppercase text-red-900" :for="id">
            {{ label }}
        </label>
        <select :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            class="w-full text-md text-gray-800 border-gray-300 bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
            :id="id">

            <option value="0"></option>
            <option v-for="option in filteredOptions" :key="option.id"
                class="text-black bg-white hover:bg-gray-100"
                :value="option.id"
                :selected="option.id === modelValue">
                {{ option.name }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    label: String,
    modelValue: [Number],
    id: String,
    options: Array,
})

const search = ref('')

const filteredOptions = computed(() => {
    if (!search.value) {
        return props.options
    }
    return props.options.filter(option => option.name.toLowerCase().includes(search.value.toLowerCase()))
})
</script>


<style>
select {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0iIzAwMDAwMCIgdmlld0JveD0iMCAwIDI1NiAyNTYiPjxwYXRoIGQ9Ik0yMTMuNjYsMTAxLjY2bC04MCw4MGE4LDgsMCwwLDEtMTEuMzIsMGwtODAtODBBOCw4LDAsMCwxLDUzLjY2LDkwLjM0TDEyOCwxNjQuNjlsNzQuMzQtNzQuMzVhOCw4LDAsMCwxLDExLjMyLDExLjMyWiI+PC9wYXRoPjwvc3ZnPg==") !important;  
}
</style>

