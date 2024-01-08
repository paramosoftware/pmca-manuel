<template>
    <div class="mt-4" :class="{ 'hidden': hidden }">

        <UILabel :for="id">
            {{ label }}
        </UILabel>

        <UInput
            :id="id" 
            :type="type" 
            :model-value="modelValue"
            :required="required" 
            :disabled="disabled"
            :placeholder="placeholder"
            @input="onInput"
            @focus="iconColor = 'text-pmca-accent'"
            @blur="iconColor = 'text-gray-400'"
            color="gray" 
            variant="outline"
            size="md"
        >

        <template #trailing v-if="showIcon">
            <Icon :name="icon" class="w-6 h-6" :class="iconColor" />
        </template>

        </UInput>

    </div>
</template>
  
<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    label: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: ''
    },
    hidden: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    showIcon: {
        type: Boolean,
        default: false
    },
    icon: {
        type: String,
        default: 'ph:magnifying-glass'
    },
    formStore: {
        type: Object as PropType<FormStore>,
    },
})

const iconColor = ref('text-gray-400');

const defaultValue = getFormFieldConfig('defaultValue', '', props);
const modelValue = getFormFieldConfig('modelValue', defaultValue?.value, props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
const required = getFormFieldConfig('required', false, props);
const placeholder = getFormFieldConfig('placeholder', '', props);

let type = getFormFieldConfig('inputType', 'text', props);

if (!props.formStore) {
    type = computed(() => props.type);
}

const emit = defineEmits(['update:modelValue', 'input']);

const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;


    if (props.formStore) {
        props.formStore.setFieldData(props.id, target.value);
    } 

    emit('update:modelValue', target.value);
}
</script>