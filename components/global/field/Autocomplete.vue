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

            <FieldInput
                :id="id"
                type="text"
                v-model="search"
                :disabled="!canAddMore || disabled"
                :placeholder="
                    !canAddMore
                        ? 'Número máximo de itens adicionados'
                        : placeholder
                "
                :show-icon="showIcon"
                :loading="searching"
                :size="size"
            />

            <span ref="autocompleteRef">
                <ul
                    v-if="showPopper"
                    class="w-full bg-white absolute z-10 mt-1 rounded-md shadow-xl max-h-60 overflow-y-auto"
                >
                    <li
                        v-for="item in results"
                        :key="item.name"
                        @click="selectItem(item)"
                        class="p-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200 hover:text-pmca-green-400"
                    >
                        {{ item.label ?? item.name }}
                    </li>

                    <li
                        v-if="results.length === 0 && !searching && showNoResults"
                        class="px-2 py-2 text-gray-400"
                        @click="search = ''"
                    >
                        Nenhum resultado encontrado.
                    </li>

                    <li
                        v-if="canCreate"
                        class="p-2 text-gray-600 hover:bg-gray-100 cursor-pointer border-t border-gray-200 mt-2 rounded-none"
                        @click="createItem(search)"
                    >
                        <div class="flex items-center">
                            <UIIcon
                                name="ph:plus-circle"
                                class="text-pmca-accent w-6 h-6"
                                title="Criar"
                            />
                            <strong class="m-1">Criar: </strong>
                            <i>{{ search }}</i>
                        </div>
                    </li>
                </ul>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import QUERIES from '~/config/queries';

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
    showIcon: {
        type: Boolean,
        default: true
    },
    showSelected: {
        type: Boolean,
        default: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    showNoResults: {
        type: Boolean,
        default: true
    },
    size: {
        type: String as PropType<'sm' | 'md' | 'lg' | 'xl'>,
        default: 'md'
    },
    formStore: {
        type: Object as PropType<FormStore>
    }
});

const defaultValue = getFormFieldConfig('defaultValue', [], props);
const disabled = getFormFieldConfig('disabled', false, props);
const hidden = getFormFieldConfig('hidden', false, props);
const label = getFormFieldConfig('label', '', props);
const required = getFormFieldConfig('required', false, props); // TODO: handle required with form validation [DISCUSS]
const placeholder = getFormFieldConfig('placeholder', '', props);
const relatedResource = getFormFieldConfig('relatedResource', null, props);
const allowCreate = getFormFieldConfig('allowCreate', false, props);
const allowMultiple = getFormFieldConfig('allowMultiple', false, props);
const oppositeField = getFormFieldConfig('oppositeField', null, props);

let modelValue = getFormFieldConfig('modelValue', defaultValue.value, props);
let max = getFormFieldConfig('max', 100, props);
let oppositeFieldData = ref<Item | Item[] | null>(null);

if (!relatedResource || !relatedResource.value || !relatedResource.value.name) {
    throw new Error(
        'Related resource not defined for' +
            props.id +
            (label.value ? ' (' + label.value + ')' : '')
    );
}

if (props.formStore) {
    modelValue = computed(() => props.formStore?.getFieldData(props.id));
}

if (oppositeField && oppositeField.value) {
    oppositeFieldData = computed(() =>
        props.formStore?.getFieldData(oppositeField.value.name)
    );
}

const emit = defineEmits(['update:modelValue', 'select', 'input']);

const autocompleteRef = ref<HTMLElement | null>(null);
const search = ref('');
const results = ref<{ id: number; name: string; label?: string }[]>([]);
let timeoutId: NodeJS.Timeout = setTimeout(() => {}, 500);
const searching = ref(false);
const toast = useToast();
const showPopper = ref(false);

useOnClickOutside(autocompleteRef, () => {
    showPopper.value = false;
    results.value = [];
    searching.value = false;
});

watch(search, searchItems);

if (!allowMultiple.value) {
    max = computed(() => 1);
}

const selectedItems = computed(() => {
    if (!modelValue.value && !oppositeFieldData.value) {
        return [];
    }

    const selectedItems = [];

    // merge the selected items with the opposite field data
    // so all relations are shown in the autocomplete in both directions

    if (modelValue.value) {
        if (Array.isArray(modelValue.value)) {
            selectedItems.push(...modelValue.value);
        } else {
            selectedItems.push(modelValue.value);
        }
    }

    if (oppositeFieldData.value) {
        if (Array.isArray(oppositeFieldData.value)) {
            selectedItems.push(...oppositeFieldData.value);
        } else {
            selectedItems.push(oppositeFieldData.value);
        }
    }

    return selectedItems;
});

const canAddMore = computed(() => {
    return selectedItems.value.length < max.value;
});

const canCreate = computed(() => {
    return allowCreate.value && search.value !== '';
});

function selectItem(item: Item) {
    const alreadySelected = selectedItems.value.find(
        (i: Item) => i.id === item.id
    );

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

    emit('select', item);

    if (props.formStore) {
        props.formStore.addFieldData(props.id, item);
    }

    search.value = '';
}

function removeItem(item: Item) {
    const newItems = selectedItems.value.filter((i: Item) => i.id !== item.id);

    emit(
        'update:modelValue',
        allowMultiple.value
            ? newItems
            : newItems.length > 0
              ? newItems[0]
              : null
    );

    if (props.formStore) {
        if (oppositeFieldData.value) {
            props.formStore?.removeFieldData(oppositeField.value.name, item);
        }

        props.formStore.removeFieldData(props.id, item);
    }
}

async function searchItems() {
    emit('input', search.value);

    showPopper.value = true;

    if (search.value === '') {
        showPopper.value = false;
        searching.value = false;
        results.value = [];
        return;
    }

    searching.value = true;

    clearTimeout(timeoutId);

    const query = {
        where: {
            OR: [
                {
                    name: {
                        like: search.value
                    },
                    label: {
                        like: search.value
                    },
                    labelPlural: {
                        like: search.value
                    }
                }
            ],
            AND: []
        },
        pageSize: 10
    } as any;

    if (QUERIES.get(relatedResource.value.name)?.where) {
        query.where.AND.push(QUERIES.get(relatedResource.value.name)?.where);
    }

    if (relatedResource.value.name === props.formStore?.model) {
        query.where.AND.push({
            id: {
                not: props.formStore?.getId()
            }
        });
    }

    timeoutId = setTimeout(async () => {
        const { data, pending, error } = (await useFetchWithBaseUrl(
            'api/' + (props.isPublic ? 'public/' : '') + relatedResource.value.name,
            {
                method: 'GET',
                params: query
            }
        )) as {
            data: Ref<PaginatedResponse>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        searching.value = pending.value;
        results.value = data.value.items;
    }, 500);
}

async function createItem(value: string) {
    if (!allowCreate) {
        return;
    }

    const { data, pending, error } = (await useFetchWithBaseUrl(
        'api/' + relatedResource.value.name,
        {
            method: 'POST',
            body: {
                name: value.trim()
            }
        }
    )) as { data: Ref<Item>; pending: Ref<boolean>; error: Ref<Error> };

    searching.value = pending.value;

    if (error.value) {
        // @ts-ignore
        console.error(error.value.data ?? error.value);
        toast.add({
            title: 'Erro ao criar item',
            color: 'red',
            icon: 'i-heroicons-x-circle'
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
