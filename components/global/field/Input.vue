<template>
    <div :class="{ hidden: hidden, 'mt-4': label }">
        <UILabel :for="id" v-if="label">
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
            :size="size"
            class="mt-1"
            padding="sm"
            :style="
                squareRightCorners
                    ? {
                          borderTopLeftRadius: '0.375rem',
                          borderBottomLeftRadius: '0.375rem',
                          borderTopRightRadius: '0',
                          borderBottomRightRadius: '0'
                      }
                    : {}
            "
        >
            <template #trailing v-if="showIcon && !loading">
                <UIIcon :name="icon" class="w-6 h-6" :class="iconColor" />
            </template>

            <template #trailing v-if="loading">
                <UIIcon :name="'ph:spinner'" class="w-6 h-6 animate-spin" />
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
    loading: {
        type: Boolean,
        default: false
    },
    size: {
        type: String as PropType<'sm' | 'md' | 'lg' | 'xl'>,
        default: 'md'
    },
    formStore: {
        type: Object as PropType<FormStore>
    },
    squareRightCorners: {
        type: Boolean,
        default: false
    }
});

const iconColor = ref('text-gray-400');

const defaultValue = getFormFieldConfig('defaultValue', '', props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
const required = getFormFieldConfig('required', false, props);
const placeholder = getFormFieldConfig('placeholder', '', props);
let modelValue = getFormFieldConfig('modelValue', defaultValue?.value, props);

let type = getFormFieldConfig('inputType', 'text', props);

if (!props.formStore) {
    type = computed(() => props.type);
} else {
    modelValue = computed(() => props.formStore?.getFieldData(props.id));
}

const emit = defineEmits(['update:modelValue', 'input']);

const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (props.formStore) {
        props.formStore.setFieldData(props.id, target.value);
    }

    emit('input', target.value);
    emit('update:modelValue', target.value);
};
</script>
