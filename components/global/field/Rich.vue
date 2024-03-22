<template>
    <div class="mt-4 cursor" :id="id" :class="{ hidden: hidden }">
        <UILabel :for="id">
            {{ label }}
        </UILabel>

        <input
            v-show="false"
            v-if="required"
            :value="content"
            :required="required"
            :disabled="disabled"
        />

        <ClientOnly>
            <QuillEditor
                ref="quillEditor"
                theme="snow"
                :toolbar="toolbarOptions"
                v-model:content="content"
                content-type="html"
                :placeholder="placeholder"
                :read-only="disabled"
                :disabled="disabled"
                class="mt-1"
                :class="{ 'cursor-not-allowed': disabled }"
            />

            <template #fallback>
                <div class="flex flex-col justify-center items-center">
                    <UIIcon
                        class="animate-spin w-10 h-10 mr-5 text-pmca-secondary"
                        name="ph:spinner"
                    />
                </div>
            </template>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Number],
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
    hidden: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    formStore: {
        type: Object as PropType<FormStore>
    }
});

let quillEditor = ref(null);

const defaultValue = getFormFieldConfig('defaultValue', '', props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
const placeholder = getFormFieldConfig('placeholder', '', props);
const required = getFormFieldConfig('required', false, props);
let modelValue = getFormFieldConfig('modelValue', defaultValue?.value, props);

if (props.formStore) {
    modelValue = computed(() => props.formStore?.getFieldData(`${props.id}Rich`));
}

const emit = defineEmits(['update:modelValue']);

const content = ref(modelValue.value);

watch(content, (value) => {
    if (quillEditor.value) {
        // @ts-ignore
        let text = quillEditor.value.getText();
        text = text.replace(/\n/g, ' ');
        text.trim();

        if (value == '<p><br></p>' || text === '') {
            value = '';
        }

        if (props.formStore) {
            props.formStore.setFieldData(props.id, text);
            props.formStore.setFieldData(`${props.id}Rich`, value);
        }
    }

    emit('update:modelValue', value);
});

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'link'],

    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],

    ['clean']
];
</script>

<style>
.ql-container {
    font-size: 14px;
}

.ql-editor {
    min-height: 8rem;
}
</style>
