<template>
    <div class="mt-4" :class="{ 'hidden': hidden }">

        <UILabel :for="id">
            {{ label }}
        </UILabel>

        <UInput
            :id="id" 
            :type="type" 
            :value="modelValue" 
            :required="required" 
            :disabled="disabled"
            :placeholder="placeholder"
            @input="onInput"
            color="gray" 
            variant="outline"
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
    formStore: {
        type: Object as PropType<FormStore>,
    },
})

const modelValue = computed(() => props.modelValue ?? props.formStore?.getField(props.id) ?? defaultValue);
const disabled = computed(() => props.disabled ?? props.formStore?.getFieldConfig(props.id)?.disabled ?? false);
const hidden = computed(() => props.hidden ?? props.formStore?.getFieldConfig(props.id)?.hidden ?? false);
const label = props.label ?? props.formStore?.getFieldConfig(props.id)?.label;
const type = props.type ?? props.formStore?.getFieldConfig(props.id)?.inputType;
const required = props.required ?? props.formStore?.getFieldConfig(props.id)?.required;
const placeholder = props.placeholder ?? props.formStore?.getFieldConfig(props.id)?.placeholder;
const defaultValue = props.formStore?.getFieldConfig(props.id)?.defaultValue ?? '';

const emit = defineEmits(['update:modelValue']);

const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (props.formStore) {
        props.formStore.setField(props.id, target.value);
    } 

    emit('update:modelValue', target.value);
}

</script>