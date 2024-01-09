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

            <FieldInput 
                :id="id"
                type="text" 
                v-model="search" 
                :disabled="!canAddMore || disabled"
                :placeholder="!canAddMore ? 'Número máximo de itens adicionados' : placeholder"
                :show-icon="true" :loading="searching"
            />

            <span ref="autocompleteRef">
                <ul v-if="search !== ''" class="w-full bg-white border border-x-gray-300space-y-1 absolute z-10 mt-2 rounded-md shadow-sm">

                    <li v-for="item in results" :key="item.name" @click="selectItem(item)"
                        class="px-2 py-1 cursor-pointer rounded-md hover:bg-gray-100">

                        <span v-if="isHtml" v-html="item.label ?? item.name"></span>
                        <span v-else>
                            {{ item.label ?? item.name }}
                        </span>

                    </li>

                    <li v-if="results.length === 0" class="rounded-md px-2 py-1 text-gray-400" @click="search = ''">
                        Nenhum resultado encontrado.
                    </li>

                    <li v-if="canCreate" class="rounded-md px-2 py-1 text-gray-600">
                        <button type="button" @click="createItem(search)">
                            Cadastrar: {{ search }}

                            <Icon name="ph:plus-circle" class="text-pmca-accent w-6 h-6" title="Criar" />

                        </button>
                    </li>
                </ul>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    modelValue: {
        type: null,
        default: []
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
    max: {
        type: Number,
        default: 100
    },
    allowCreate: {
        type: Boolean,
        default: false
    },
    allowMultiple: {
        type: Boolean,
        default: true
    },
    relatedResource: {
        type: Object as PropType<{ name: string }>,
        default: null
    },
    formStore: {
        type: Object as PropType<FormStore>,
    }
})

// TODO: handle html content correctly

const defaultValue = getFormFieldConfig('defaultValue', [], props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
const required = getFormFieldConfig('required', false, props); // TODO: handle required with form validation
const placeholder = getFormFieldConfig('placeholder', '', props);
const relatedResource = getFormFieldConfig('relatedResource', null, props);
const allowCreate = getFormFieldConfig('allowCreate', false, props);
const allowMultiple = getFormFieldConfig('allowMultiple', false, props);
const isHtml = getFormFieldConfig('richText', false, props);

let modelValue = getFormFieldConfig('modelValue', defaultValue.value, props);
let max = getFormFieldConfig('max', 100, props);

if (!relatedResource.value.name) {
    throw new Error('Related resource not defined');
}

if (props.formStore) {
    modelValue = computed(() => props.formStore?.getFieldData(props.id));
}

const emit = defineEmits(['update:modelValue']);

const autocompleteRef = ref<HTMLElement | null>(null);
const search = ref('');
const results = ref<{ id: number, name: string, label?: string }[]>([]);
let timeoutId: NodeJS.Timeout = setTimeout(() => { }, 0);
const searching = ref(false);
const toast = useToast();

useOnClickOutside(autocompleteRef, () => {
    search.value = ''; // TODO: refactor
    results.value = [];
    searching.value = false;
});

watch(search, searchItems);

if (!allowMultiple.value) {
    max = computed(() => 1);
}

const selectedItems = computed(() => {
    if (!modelValue.value) {
        return [];
    }

    return Array.isArray(modelValue.value) ? modelValue.value : [modelValue.value];
});

const canAddMore = computed(() => {
    return selectedItems.value.length < max.value;
});

const canCreate = computed(() => {
    return allowCreate && search.value !== '' && results.value.length === 0;
});

function selectItem(item: Item) {

    const alreadySelected = selectedItems.value.find((i: Item) => i.id === item.id);

    if (alreadySelected) {
        search.value = '';
        return;
    }

    if (allowMultiple.value) {
        if (selectedItems.value.length < max.value) {
            emit('update:modelValue', [...selectedItems.value, item]);
        }
    } else {
        emit('update:modelValue', item);
    }

    if (props.formStore) {
        props.formStore.addFieldData(props.id, item);
    }

    search.value = "";
}

function removeItem(item: Item) {

    const newItems = selectedItems.value.filter((i: Item) => i.id !== item.id);

    emit('update:modelValue', allowMultiple.value ? newItems : newItems.length > 0 ? newItems[0] : null);

    if (props.formStore) {
        props.formStore.removeFieldData(props.id, item);
    }
}

async function searchItems() {
    if (search.value === '') {
        results.value = [];
        return;
    }

    searching.value = true;

    clearTimeout(timeoutId);

    timeoutId = setTimeout(async () => {
        const { data, pending, error } = await useFetchWithBaseUrl('api/' + relatedResource.value.name, {
            method: 'GET',
            query: {
                where: {
                    or: [
                        {
                            name: {
                                like: search.value
                            }
                        }
                        // TODO: search by label
                    ]
                },
                pageSize: 10
            }
        }) as { data: Ref<PaginatedResponse>, pending: Ref<boolean>, error: Ref<Error | undefined> };

        searching.value = pending.value;
        results.value = data.value.items;

    }, 300);
}

async function createItem(value: string) {
    if (!allowCreate) {
        return;
    }

    const { data, pending, error } = await useFetchWithBaseUrl('api/' + relatedResource.value.name, {
        method: 'POST',
        body: {
            name: value.trim()
        }
    }) as { data: Ref<Item>, pending: Ref<boolean>, error: Ref<Error> };

    searching.value = pending.value;

    if (error.value) {
        // @ts-ignore
        console.error(error.value.data ?? error.value);
        toast.add({
            title: 'Erro ao criar item',
            color: 'red',
            icon: 'i-heroicons-x-circle',
        });
    
        search.value = '';
        return;
    }

    if (data.value) {
        selectItem(data.value);
    }
}

onMounted(() => {
    autocompleteRef.value = autocompleteRef.value;
});
</script>