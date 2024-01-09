<template>
    <div class="flex flex-row items-center my-3" v-show="!hidden">
        <UCheckbox 
            :id="id" 
            :model-value="modelValue" 
            :disabled="disabled"
            @change="onInput"
        >
            <template #label>
                {{ label  }}
            </template>
        </UCheckbox>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Number, Boolean],
        default: ''
    },
    label: {
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
    }
});

const defaultValue = getFormFieldConfig('defaultValue', '', props);
const modelValue = getFormFieldConfig('modelValue', defaultValue?.value, props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);

const emit = defineEmits(['update:modelValue']);

const onInput = (event: Event) => {

    const value = (event.target as HTMLInputElement).checked;

    if (props.formStore) {
        props.formStore.setFieldData(props.id, value);
    }

    emit('update:modelValue', value);
}

</script>