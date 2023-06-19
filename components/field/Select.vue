<template>
    <div class="mt-4">
        <label class="text-lg uppercase text-red-900" :for="id">
            {{ label }}
        </label>

        <select
            class="w-full text-md text-gray-800 border-gray-300 bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
            :id="id">

            <option value="0" v-if="!mandatory"></option>

            <option v-for="option in options" :key="option.id"
                class="text-black bg-white hover:bg-gray-100"
                :value="option.id"
                :selected="option.id === modelValue">
                {{ option.textValue }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    label: String,
    modelValue: String,
    id: String,
    options: Array,
    mandatory: Boolean
});

</script>


<style>

select {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0iIzAwMDAwMCIgdmlld0JveD0iMCAwIDI1NiAyNTYiPjxwYXRoIGQ9Ik0yMTMuNjYsMTAxLjY2bC04MCw4MGE4LDgsMCwwLDEtMTEuMzIsMGwtODAtODBBOCw4LDAsMCwxLDUzLjY2LDkwLjM0TDEyOCwxNjQuNjlsNzQuMzQtNzQuMzVhOCw4LDAsMCwxLDExLjMyLDExLjMyWiI+PC9wYXRoPjwvc3ZnPg==") !important;  
}

</style>

