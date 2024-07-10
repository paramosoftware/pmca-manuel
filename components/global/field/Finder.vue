<template>
    <div class="mt-4">
        <div class="flex justify-between">
            <UILabel :for="id">
                {{ label }}
            </UILabel>
            <div class="text-end mt-2">
                <UIButton
                    size="sm"
                    @click="onClear"
                    square
                    class="ml-1"
                    v-if="defaultExpanded"
                >
                    <UIIcon
                        name="ph:eraser"
                        title="Limpar seleção"
                        variant="button"
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
const query = getFormFieldConfig('query', '', props); // TODO: not implemented yet [ASK... is it PMCA-358?]
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

const tree = ref<TreeNode>();
const sameModel = relatedResource.value.name === props.formStore?.model;
const formId = props.formStore?.getId();
const nodeIdToRemove = sameModel
    ? formId === 0
        ? undefined
        : formId
    : undefined;
let parentIdExists = false;
const defaultExpanded = ref<ID>(null);
const toast = useToast();
const children = ref<Map<ID, TreeNode[]>>(new Map());
const currentExpanded = ref<ID>(null);
const currentChildren = ref<TreeNode[]>([]);

const fetchTreeData = async () => {
    const defaultQuery = {
        pageSize: -1,
        select: JSON.stringify([
            'id',
            'name',
            'nameSlug',
            'parentId',
            'position'
        ]),
        orderBy: JSON.stringify(['position'])
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

    if (data.value) {
        const builtTree = buildTreeData(
            data.value,
            true,
            undefined,
            undefined,
            undefined,
            modelValue.value
        );

        tree.value = builtTree[0];
        parentIdExists = builtTree[1] as boolean;

        if (parentIdExists) {
            defaultExpanded.value = modelValue.value;
        }
    }
};

fetchTreeData();

const onExpand = ({
    expanded,
    sourceEvent,
    expandedItems
}: FinderExpandEvent) => {
    for (let i = 0; i < expanded.length; i++) {
        if (expanded[i] == nodeIdToRemove) {
            toast.add({
                title: 'Não é possível selecionar um item que é descendente do item em edição. A seleção não será salva.',
                ui: { rounded: 'rounded-sm', padding: 'p-5' }
            });
            return;
        }
    }

    currentExpanded.value = expanded[expanded.length - 1];

    if (currentExpanded.value == 'root') {
        currentExpanded.value = null;
    }

    if (currentExpanded.value === modelValue.value) {
        return;
    }

    defaultExpanded.value = currentExpanded.value;

    emit('update:modelValue', currentExpanded.value);

    if (props.formStore) {
        props.formStore.setFieldData(props.id, currentExpanded.value);
    }
};

const getChildrenCurrentNode = (node: TreeNode, targetNodeId: ID) => {
    if (node.id === targetNodeId) {
        if (!children.value.has(node.id)) {
            children.value.set(node.id, node.children);
            currentChildren.value = node.children!;
        } else {
            currentChildren.value = children.value.get(node.id)!;
        }
    } else {
        node.children?.forEach((child) => {
            getChildrenCurrentNode(child, targetNodeId);
        });
    }
};

const onClear = () => {
    defaultExpanded.value = null;
    finderRef.value?.expand('root');
};
</script>
