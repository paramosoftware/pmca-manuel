<template>
    <div class="mt-4">
        <label class="text-lg text-pmca-secondary first-letter:uppercase" :for="id">
            {{ label }}
        </label>

        <div v-if="tree">
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
const relatedResource = getFormFieldConfig('relatedResource', null, props);
const query = getFormFieldConfig('query', '', props); // TODO: not implemented yet
let modelValue = getFormFieldConfig('modelValue', defaultValue.value, props);

if (props.formStore) {
    modelValue = computed(() => props.formStore?.getFieldData(props.id));
}

if (!relatedResource || !relatedResource.value || !relatedResource.value.name) {
    throw new Error('Related resource not defined for' + props.id + (label.value ? ' (' + label.value + ')' : ''));
}



// TODO: still need to parametrize finder to be used inside "Category" (which will be an Entry under the hood)
// and "Entry" forms (where it will be used to select the parent category)
const defaultQuery = {
    pageSize: -1,
    select: JSON.stringify(['id', 'name', 'nameSlug', 'parentId']),
    where: {
        isCategory: true
    },
} as any;

const { data } = await useFetchWithBaseUrl('/api/' + relatedResource.value.name, {
    method: 'GET',
    params: defaultQuery,
    transform: (data: PaginatedResponse) => {
        if (!data) {
            return [];
        } else {
            return data.items;
        }
    }
})

const tree = ref<TreeNode>();

if (data.value)  {

    // don't show the descendants of the current node
    let nodeIdToRemove = undefined;

    if (relatedResource.value.name === props.formStore?.model) {
        nodeIdToRemove = props.formStore?.getId();
    }

    tree.value = buildTreeData(data.value, true, undefined, nodeIdToRemove)[0];
}

// @ts-ignore
const onExpand = ({ expanded, sourceEvent, expandedItems }) => {
    // TODO: As the descendants of the current node are not shown, the circular reference is not a problem in component itself
    // verify in the backend if the current node is a descendant of the selected node instead

    const lastExpanded = expanded[expanded.length - 1];

    if (lastExpanded === modelValue.value) {
        return;
    }

    emit('update:modelValue', lastExpanded);
    props.formStore.setFieldData(props.id, lastExpanded);
}

</script>