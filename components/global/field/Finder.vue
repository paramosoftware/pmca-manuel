<template>
    <div class="mt-4">
        <div class="flex justify-between">
            <UILabel :for="id">
                {{ label }}
            </UILabel>
            <div class="text-end mt-2" v-if="defaultExpanded">
                <UIButton size="sm" @click="onClear" square>
                    <UIIcon
                        name="ph:eraser"
                        title="Limpar seleção"
                        class="w-5 h-5"
                        @click="onClear"
                    />
                </UIButton>
            </div>
        </div>
        <div v-if="tree && tree.children.length > 0" class="mt-1">
            <Finder
                :tree="tree"
                @expand="onExpand"
                :default-expanded="defaultExpanded"
                class="h-64 border border-gray-300"
                ref="finderRef"
            />
        </div>
        <div v-else-if="nodeIdToRemove">
            <p>O item em edição é o único ramo disponível.</p>
        </div>
        <div v-else>
            <p>Nenhum item disponível para montar a hierarquia.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { Finder } from '@jledentu/vue-finder';
import '@jledentu/vue-finder/dist/vue-finder.css';

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
        type: Object as PropType<{ name: string }>
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
        type: Object as PropType<FormStore>
    }
});

const emit = defineEmits(['update:modelValue']);
const finderRef = ref<Finder | null>(null);

const defaultValue = getFormFieldConfig('defaultValue', '', props);
const label = getFormFieldConfig('label', '', props);
const relatedResource = getFormFieldConfig('relatedResource', null, props);
const query = getFormFieldConfig('query', '', props); // TODO: not implemented yet
let modelValue = getFormFieldConfig('modelValue', defaultValue.value, props);

if (props.formStore) {
    modelValue = computed(() => props.formStore?.getFieldData(props.id));
}

if (!relatedResource || !relatedResource.value || !relatedResource.value.name) {
    throw new Error(
        'Related resource not defined for' +
            props.id +
            (label.value ? ' (' + label.value + ')' : '')
    );
}

const defaultQuery = {
    pageSize: -1,
    select: JSON.stringify(['id', 'name', 'nameSlug', 'parentId'])
} as any;

const { data } = await useFetchWithBaseUrl(
    '/api/' + relatedResource.value.name,
    {
        method: 'GET',
        params: defaultQuery,
        transform: (data: PaginatedResponse) => {
            if (!data) {
                return [];
            } else {
                return data.items;
            }
        }
    }
);

const tree = ref<TreeNode>();

let nodeIdToRemove = undefined as ID | undefined;
let parentIdExists = false;
const defaultExpanded = ref<string | number | undefined>(undefined);

if (data.value) {
    // don't show the descendants of the current node
    if (relatedResource.value.name === props.formStore?.model) {
        nodeIdToRemove =
            props.formStore?.getId() === 0
                ? undefined
                : props.formStore?.getId();
    }

    const builtTree = buildTreeData(
        data.value,
        true,
        undefined,
        nodeIdToRemove,
        undefined,
        modelValue.value
    );

    tree.value = builtTree[0];
    parentIdExists = builtTree[1] as boolean;

    if (parentIdExists) {
        defaultExpanded.value = modelValue.value;
    }
}

// @ts-ignore
const onExpand = ({ expanded, sourceEvent, expandedItems }) => {
    // TODO: As the descendants of the current node are not shown, the circular reference is not a problem in component itself
    // verify in the backend if the current node is a descendant of the selected node instead

    let lastExpanded = expanded[expanded.length - 1];

    if (lastExpanded == 'root') {
        lastExpanded = null;
    }

    if (lastExpanded === modelValue.value) {
        return;
    }

    defaultExpanded.value = lastExpanded;

    emit('update:modelValue', lastExpanded);

    if (props.formStore) {
        props.formStore.setFieldData(props.id, lastExpanded);
    }
};

const onClear = () => {
    defaultExpanded.value = undefined;
    finderRef.value?.expand('root');
};
</script>
