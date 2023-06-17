<template>
  <div class="mt-4">
    <label class="text-lg uppercase text-red-900" :for="id">
      {{ label }}
    </label>
    <component :is="textarea ? 'textarea' : 'input'" :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full text-sm text-gray-800 placeholder:text-gray-400 border-gray-300  bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
      :id="id" :type="type" :placeholder="placeholder"></component>
  </div>
</template>
  
<script setup lang="ts">
defineProps({
  label: String,
  modelValue: [String, Number],
  id: String,
  type: String,
  placeholder: String,
  textarea: Boolean,
})
</script>