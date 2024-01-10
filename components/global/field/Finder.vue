<template>
    <div class="mt-4">
        <label class="text-lg text-pmca-secondary first-letter:uppercase" :for="id">
            {{ label }}
        </label>

        <div v-if="tree.children.length > 0">
            <Finder 
                :tree="tree" 
                @expand="onExpand"
                :default-expanded="modelValue"
                class="h-64 border border-gray-300" 
            />
        </div>
        <div v-else>
            <p class="text-gray-700">Nenhum item cadastrado para montar a hierarquia.</p>
        </div>
    </div>
</template>
  
<script setup lang="ts">
// @ts-ignore
import { Finder } from "@jledentu/vue-finder";
import "@jledentu/vue-finder/dist/vue-finder.css";

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Number],
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    relatedResource: {
        type: Object as PropType<{ name: string }>,
        required: true,
    },
    defaultValue: {
        type: [String, Number],
        default: ''
    },
    query: {
        type: String,
        default: ''
    },
    formStore: {
        type: Object as PropType<FormStore>,
        required: true
    }
})

const emit = defineEmits(['update:modelValue']);

const defaultValue = getFormFieldConfig('defaultValue', '', props);
const label = getFormFieldConfig('label', '', props);
const relatedResource = getFormFieldConfig('relatedResource', '', props);
const query = getFormFieldConfig('query', '', props);
let modelValue = getFormFieldConfig('modelValue', defaultValue.value, props);

if (props.formStore) {
    modelValue = computed(() => props.formStore?.getFieldData(props.id));
}

if (!relatedResource.value.name) {
    throw new Error('Related resource not defined');
}

const defaultQuery = {
    pageSize: -1,
    select: JSON.stringify(['id', 'name', 'parentId']),
    where: {
        isCategory: true,
    },
    include: JSON.stringify(['children']),
};


const { data } = await useFetchWithBaseUrl('/api/' + relatedResource.value.name, {
    method: 'GET',
    params: query.value ? JSON.parse(query.value) : defaultQuery,
    transform: (data: PaginatedResponse) => {
        if (!data) {
            return [];
        } else {
            return data.items.map((item) => ({
                id: item.id,
                name: item.name,
                parentId: item.parentId,
            }))
        }
    }
})


const tree = ref<{ children: any[] }>({ children: [] });
if (data.value)  {
    tree.value = useConvertToTreeData(data.value, true, false, null) as { children: any[] };
}

// @ts-ignore
const onExpand = ({ expanded, sourceEvent, expandedItems }) => {
    // TODO: avoid circular reference

    const lastExpanded = expanded[expanded.length - 1];

    if (modelValue.value === lastExpanded) {
        return;
    }

    emit('update:modelValue', lastExpanded);
    props.formStore.setFieldData(props.id, lastExpanded);
}
</script>