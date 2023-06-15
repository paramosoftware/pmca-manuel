<template>
  <div class="mt-4" :id="id">
    <label class="text-lg uppercase text-red-900" :for="id">
      {{ label }}
    </label>
    <client-only placeholder="Carregando...">

      <QuillEditor 
        theme="snow" 
        toolbar="essential" 
        v-model:content="content"
        content-type="html" />

    </client-only>

  </div>
</template>

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';


const props = defineProps({
  label: String,
  id: String,
  modelValue: {
    type: String,
    required: true
  }
})



const content = ref(props.modelValue)

const emit = defineEmits(['update:modelValue'])

watch(content, (value) => {
  emit('update:modelValue', value)
})


</script>


<style>
.ql-container {
  font-size: 14px;
}

.ql-editor {
  min-height: 8rem;
}

</style>