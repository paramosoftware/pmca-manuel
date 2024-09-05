<template>
    <div :class="{ hidden: hidden, 'mt-4': addMargin }">
        <UILabel :for="id" v-if="label">
            {{ label }}
        </UILabel>

        <USelect
            :id="id"
            :model-value="modelValue"
            :disabled="disabled || loading || list.length === 0"
            :hidden="hidden"
            :placeholder="
                list.length === 0 ? 'Sem opções cadastradas' : placeholder
            "
            :required="required"
            :loading="loading"
            :options="list"
            option-attribute="name"
            @input="onInput"
            :size="size"
            class="w-full"
            variant="outline"
            color="primary"
        >
        </USelect>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Number, Object],
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: ''
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
    relatedResource: {
        type: Object as PropType<{ name: string }>,
        default: null
    },
    addMargin: {
        type: Boolean,
        default: true
    },
    options: {
        type: Array as PropType<
            { name: string; value: string | number }[] | string[] | number[]
        >,
        default: []
    },
    formStore: {
        type: Object as PropType<FormStore>
    },
    size: {
        type: String as PropType<'sm' | 'md' | 'lg'>,
        default: 'md'
    },
});

const list = ref<{ id?: ID; name: string; value: string | number }[]>([]);

const defaultValue = getFormFieldConfig('defaultValue', '', props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
const required = getFormFieldConfig('required', false, props);
const placeholder = getFormFieldConfig('placeholder', '', props);
const relatedResource = getFormFieldConfig('relatedResource', null, props);
const defaultOptions = getFormFieldConfig('defaultOptions', '', props);
const options = getFormFieldConfig('options', [], props);
let modelValue = getFormFieldConfig('modelValue', defaultValue.value, props);
if (props.formStore) {
    modelValue = computed(
        () => {
            const value = props.formStore?.getFieldData(props.id);
            if (value) {
                return value;
            } else if (required.value && list.value.length > 0 && !disabled.value) {
                props.formStore?.setFieldData(props.id, list.value[0].value);
                return list.value[0].value;
            }
        }
    );
}

const loading = ref(false);

if (relatedResource.value) {
    loading.value = true;

    const { data, pending, error } = await useFetchWithBaseUrl(
        '/api/' + relatedResource.value.name,
        {
            method: 'GET',
            query: { pageSize: 100 },
            transform: (data: PaginatedResponse) => {
                if (!data) {
                    return [];
                } else {
                    return data.items.map((item) => ({
                        id: item.id,
                        name: item.label ?? item.name,
                        value: item.id
                    }));
                }
            }
        }
    );

    loading.value = pending.value;

    if (data.value) {
        list.value = [];
        list.value = data.value;
    }

    if (error.value) {
        console.error(error.value);
    }
} else if (defaultOptions.value) {
    const values = defaultOptions.value.split(',');

    for (const option of values) {
        list.value.push({
            name: option.trim(),
            value: option.trim()
        });
    }
} else if (options.value) {
    list.value = options.value;
    watch(() => options.value, (newValue) => {
        list.value = newValue;
    });
}

if (defaultValue.value && props.formStore) {
    list.value.map((item) => {
        if (
            item.name === defaultValue.value ||
            item?.id === defaultValue.value
        ) {
            props.formStore?.setFieldData(props.id, item);
        }
    });
}

if (!required.value) {
    if (!list.value.find((item) => item.value === '')) {
        list.value.unshift({
            name: '',
            value: ''
        });
    }
}

const emit = defineEmits(['update:modelValue']);

const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (props.formStore) {
        props.formStore.setFieldData(props.id, target.value);
    }

    emit('update:modelValue', target.value);
};
</script>
