<template>
  <div class="mt-4" :id="id">
    <UILabel :for="id">
        {{ label }}
    </UILabel>

    <input v-show="false" v-if="required" :value="content" :required="required">

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
  required: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    required: true
  }
})

const content = ref(props.modelValue)

const emit = defineEmits(['update:modelValue'])

watch(content, (value) => {
  if (value == '<p><br></p>') {
    value = ''
    content.value = ''
  }
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