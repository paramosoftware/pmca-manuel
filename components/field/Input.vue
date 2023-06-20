<template>
  <div class="mt-4">

    <UILabel :for="id" :showLabel="showLabel">
      {{ label }}
    </UILabel>

    <component 
      :is="textarea ? 'textarea' : 'input'" 
      :id="id"
      :type="type" 
      :value="modelValue"
      :required="required"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full bg-gray-50 border border-gray-200 p-2 focus:outline-none focus:border-pmca-accent rounded-sm leading-none"
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
  },
  showLabel: {
    type: Boolean,
    default: true
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