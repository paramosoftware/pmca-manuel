<template>
    <div class="mt-4" :class="{ 'hidden': hidden }">
        <div class="w-full relative">

            <UILabel :for="id">
                {{ label }} 
            </UILabel>

            <div class="flex flex-wrap mb-2" v-if="selectedItems.length > 0">
                <div v-for="item in selectedItems" :key="item.id"
                    class="flex justify-between items-center px-2 border border-pmca-accent p-1 my-1 mr-2 rounded-md shadow-md">

                    <div v-if="isHtml" v-html="item.label ?? item.name"></div>
                    <div v-else>
                        {{ item.label ?? item.name }}
                    </div>

                    <button @click="removeItem(item)" class="ml-2">
                        <Icon name="ph:trash-simple" class="w-6 h-6" title="Remover" />
                    </button>
                </div>
            </div>

            <p></p>

            <UButton size="sm" color="primary" variant="solid" @click="isModalOpen = true" :disabled="!canAddMore || disabled">
                <template #leading>
                    <Icon name="ph:plus-circle" class="w-4 h-4" title="Criar" />
                </template>
                <template v-if="!canAddMore">
                    Máximo de itens adicionados
                </template>
                <template v-else>
                    Adicionar
                </template>
            </UButton>

            <UModal :id="relatedResource.name + '-modal-form'" v-model="isModalOpen">
                <UICloseButton @click="isModalOpen = false" />
                <Form :form-store="auxiliaryFormStore" :id="relatedResource.name + '-form'" />
            </UModal>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    formStore: {
        type: Object as PropType<FormStore>,
        required: true
    }
})

if (!props.formStore) {
    throw new Error('Form store not defined');
}

// TODO: Allow edit items

const defaultValue = getFormFieldConfig('defaultValue', [], props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
const required = getFormFieldConfig('required', false, props); // TODO: handle required with form validation
const relatedResource = getFormFieldConfig('relatedResource', '', props);
const allowMultiple = getFormFieldConfig('allowMultiple', false, props);
const isHtml = getFormFieldConfig('richText', false, props);
let max = getFormFieldConfig('max', 100, props);
const modelValue = computed(() => props.formStore?.getFieldData(props.id));
if (!allowMultiple.value) {
    max = computed(() => 1);
}

if (!relatedResource.value.name) {
    throw new Error('Related resource not defined');
}

const useAuxiliaryForm = createFormStore(relatedResource.value.name);
const auxiliaryFormStore = useAuxiliaryForm();
auxiliaryFormStore.setIsAuxiliary(true);
await auxiliaryFormStore.load(relatedResource.value.name);

const emit = defineEmits(['update:modelValue']);
const isModalOpen = ref(false);

watch(() => isModalOpen.value, async (value) => {
    if (value) {
        auxiliaryFormStore.setIsAuxiliary(true);
        await auxiliaryFormStore.load(relatedResource.value.name);
        auxiliaryFormStore.$onAction(({ name, after }) => {
            after(() => {
                if (name === 'save') {
                    const item = auxiliaryFormStore.getFieldsData() as Item
                    props.formStore.addFieldData(props.id, item)
                    isModalOpen.value = false;
                }
            })
        })
    }
});

const selectedItems = computed(() => {
    if (!modelValue.value) {
        return [];
    }

    return Array.isArray(modelValue.value) ? modelValue.value : [modelValue.value];
});

const canAddMore = computed(() => {
    return selectedItems.value.length < max.value;
});

function removeItem(item: Item) {
    if (props.formStore) {
        props.formStore.removeFieldData(props.id, item);
    }
}
</script>