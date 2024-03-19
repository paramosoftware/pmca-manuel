<template>
    <div class="mt-4" :class="{ 'hidden': hidden }">

        <UILabel :for="id">
            {{ label }}
        </UILabel>

        <UTextarea 
            :id="id" 
            type="text" 
            :required="required" 
            :disabled="disabled"
            :placeholder="placeholder" 
            :rows="rows" 
            :model-value="modelValue"
            @input="onInput"
            resize
            color="gray"
            variant="outline"
            size="md"
            class="w-full mt-1"
        />
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
    rows: {
        type: Number,
        default: 5
    },
    formStore: {
        type: Object as PropType<FormStore>,
    },
})


const defaultValue = getFormFieldConfig('defaultValue', '', props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
const required = getFormFieldConfig('required', false, props);
const placeholder = getFormFieldConfig('placeholder', '', props);
let modelValue = getFormFieldConfig('modelValue', defaultValue?.value, props);

if (props.formStore) {
    modelValue = computed(() => props.formStore?.getFieldData(props.id));
}

const emit = defineEmits(['update:modelValue']);

const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (props.formStore) {
        props.formStore.setFieldData(props.id, target.value);
    } 

    emit('update:modelValue', target.value);
}


</script>