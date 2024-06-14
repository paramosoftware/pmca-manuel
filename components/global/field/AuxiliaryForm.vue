<template>
    <div class="mt-4" :class="{ hidden: hidden }">
        <div class="w-full relative">
            <UILabel :for="id">
                {{ label }}
            </UILabel>

            <div
                class="flex flex-wrap mb-2 md:grid md:grid-cols-2 gap-2"
                v-if="selectedItems.length > 0"
            >
                <div
                    v-for="item in selectedItems"
                    :key="item.id"
                    class="flex justify-between items-center border border-gray-200 bg-gray-100 p-1 pl-2 rounded-md w-full shadow-md"
                >
                    <div
                        class="w-11/12 truncate mr-3"
                        :title="item.label ?? item.name"
                    >
                        {{ item.label ?? item.name }}
                    </div>

                    <div class="flex items-center">
                        <UIButton
                            size="sm"
                            @click="editItem(item)"
                            square
                            class="mr-1"
                        >
                            <UIIcon
                                name="ph:pencil-simple"
                                class="w-5 h-5"
                                title="Editar"
                            />
                        </UIButton>
                        <UIButton size="sm" @click="removeItem(item)" square>
                            <UIIcon
                                name="ph:trash-simple"
                                class="w-5 h-5"
                                title="Remover"
                            />
                        </UIButton>
                    </div>
                </div>
            </div>

            <p></p>

            <UButton
                size="md"
                color="primary"
                variant="solid"
                @click="isModalOpen = true"
                :disabled="!canAddMore || disabled"
                class="mt-1"
            >
                <template #leading>
                    <UIIcon
                        name="ph:plus-circle"
                        class="w-5 h-5"
                        title="Criar"
                    />
                </template>
                <template v-if="!canAddMore">
                    Máximo de itens adicionados
                </template>
                <template v-else class="text-lg"> Adicionar </template>
            </UButton>

            <UModal
                :id="relatedResource.name + '-modal-form'"
                v-model="isModalOpen"
                :ui="{
                    base: 'text-pmca-primary',
                    padding: 'p-0',
                    width: 'sm:max-w-3xl',
                    container: 'items-center'
                }"
            >
                <UICloseButton @click="isModalOpen = false" />
                <Form
                    :form-store="auxiliaryFormStore"
                    :id="relatedResource.name + '-form'"
                />
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
});

if (!props.formStore) {
    throw new Error('Form store not defined');
}

// TODO: Allow edit items [DISCUSS]

const defaultValue = getFormFieldConfig('defaultValue', [], props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
const required = getFormFieldConfig('required', false, props); // TODO: handle required with form validation [DISCUSS]
const relatedResource = getFormFieldConfig('relatedResource', null, props);
const allowMultiple = getFormFieldConfig('allowMultiple', false, props);
let max = getFormFieldConfig('max', 100, props);
const modelValue = computed(() => props.formStore?.getFieldData(props.id));
if (!allowMultiple.value) {
    max = computed(() => 1);
}

if (!relatedResource || !relatedResource.value || !relatedResource.value.name) {
    throw new Error(
        'Related resource not defined for ' +
            props.id +
            (label.value ? ' (' + label.value + ')' : '')
    );
}

const useAuxiliaryForm = createFormStore(relatedResource.value.name);
const auxiliaryFormStore = useAuxiliaryForm();
auxiliaryFormStore.setIsAuxiliary(true, props.formStore.model);
await auxiliaryFormStore.load(relatedResource.value.name);

const emit = defineEmits(['update:modelValue']);
const isModalOpen = ref(false);
const itemId = ref();

watch(
    () => isModalOpen.value,
    async (value) => {
        if (value) {
            auxiliaryFormStore.setIsAuxiliary(true, props.formStore.model);
            await auxiliaryFormStore.load(
                relatedResource.value.name,
                itemId.value
            );
            auxiliaryFormStore.$onAction(({ name, after }) => {
                after(() => {
                    if (name === 'save') {
                        const item = auxiliaryFormStore.getFieldsData() as Item;
                        props.formStore.addFieldData(props.id, item);
                        isModalOpen.value = false;
                    }
                });
            });
        }
        itemId.value = null;
    }
);

const selectedItems = computed(() => {
    if (!modelValue.value) {
        return [];
    }

    return Array.isArray(modelValue.value)
        ? modelValue.value
        : [modelValue.value];
});

const canAddMore = computed(() => {
    return selectedItems.value.length < max.value;
});

function removeItem(item: Item) {
    if (props.formStore) {
        props.formStore.removeFieldData(props.id, item);
    }
}

async function editItem(item: Item) {
    itemId.value = item.id;
    isModalOpen.value = true;
}
</script>
