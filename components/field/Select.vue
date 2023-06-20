<template>
    <div class="mt-4">
        <label class="text-lg text-pmca-secondary first-letter:uppercase" :for="id">
            {{ label }}
        </label>

        <select
            class="w-full bg-gray-50 border border-gray-200 p-2 focus:outline-none focus:border-pmca-accent rounded-sm"
            :id="id"
            @input="$emit('update:modelValue', $event.target.value)"
        >

            <option value="0" v-if="!mandatory"></option>

            <option v-for="option in options" :key="option.id"
                class="bg-white hover:bg-gray-100"
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

