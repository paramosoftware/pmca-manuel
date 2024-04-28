<template>
    <div class="flex flex-row items-center my-3" v-show="!hidden">
        <UCheckbox
            :id="id"
            :model-value="modelValue"
            :disabled="disabled"
            @change="onInput"
            class="cursor-pointer"
            :class="class"
            input-class="cursor-pointer"
        >
            <template #label>
                {{ label }}
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
    class: {
        type: String,
        default: ''
    },
    formStore: {
        type: Object as PropType<FormStore>
    }
});

const defaultValue = getFormFieldConfig('defaultValue', false, props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
let modelValue = getFormFieldConfig('modelValue', defaultValue.value, props);

if (props.formStore) {
    modelValue = computed(
        () => props.formStore?.getFieldData(props.id) === undefined ? defaultValue.value : props.formStore?.getFieldData(props.id)
    );
    props.formStore.setFieldData(props.id, modelValue.value);
}

const emit = defineEmits(['update:modelValue']);

const onInput = (event: Event) => {

    let value;

    if (event.target) {
        const target = event.target as HTMLInputElement;
        value = target.checked;
    } else {
        value = event;
    }

    if (props.formStore) {
        props.formStore.setFieldData(props.id, value);
    }

    emit('update:modelValue', value);
};
</script>
