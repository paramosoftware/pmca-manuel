<template>
  <div class="mt-4">
    <label class="text-lg uppercase text-red-900" :for="id">
      {{ label }}
    </label>

    <component 
      :is="textarea ? 'textarea' : 'input'" 
      :id="id"
      :type="type" 
      :value="modelValue"
      :required="required"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full text-sm text-gray-800 placeholder:text-gray-400 border-gray-300  bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
      :placeholder="placeholder"
      >
    </component>

    <div v-if="showError" class="text-sm text-red-800">
       Já existe um registro salvo com esse valor.
    </div>

  </div>
</template>
  
<script setup lang="ts">
const props = defineProps({
  label: String,
  modelValue: [String, Number],
  id: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  textarea: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})


watch (() => props.modelValue, () => {
  showError.value = false;
})


const showError = ref(false);

defineExpose({
  showError
})


</script>