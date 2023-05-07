<template>
    <div class="mt-4">
      <label class="text-lg uppercase text-red-900" :for="id">
        {{ label }}
      </label>
      <component :is="textarea ? 'textarea' : 'input'" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
        class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
        :id="id" :type="type" :placeholder="placeholder"></component>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    label: String,
    modelValue: [String, Number],
    id: String,
    type: String,
    placeholder: String,
    textarea: Boolean,
  })
  </script>