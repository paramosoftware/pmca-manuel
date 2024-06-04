<template>
    <div class="mt-4">
        <div class="flex justify-between">
            <UILabel :for="id">
                {{ label }}
            </UILabel>
            <div class="text-end mt-2">
                <UIButton size="sm" @click="openModalPosition" square>
                    <UIIcon
                        name="ph:list-numbers"
                        title="Alterar posição dos itens"
                        class="w-5 h-5"
                        @click="openModalPosition"
                    />
                </UIButton>
                <UIButton size="sm" @click="onClear" square class="ml-1" v-if="defaultExpanded">
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

    <UModal
        id="modal-position"
        v-model="isModalOpen"
        :ui="{
            base: 'text-pmca-primary',
            padding: 'p-0',
            width: 'sm:max-w-5xl',
            container: 'items-center'
        }"
    >
        <UICloseButton @click="closeModalPosition" />

        <div class="p-4">
            <h2 class="text-lg font-semibold">Alterar posição</h2>
            <p class="text-sm text-gray-500">
                Navegue pela árvore e altere a posição dos itens.
            </p>
            <div class="text-end">
                <UIButton @click="updateTreePosition"> Salvar </UIButton>
            </div>

            <Finder
                :tree="tree"
                @expand="setChildren"
                :default-expanded="defaultExpanded"
                class="h-64 border border-gray-300 mt-5"
            />

            <div class="p-2 mt-5">
                <p class="text-sm text-gray-500 mb-3">
                    Arraste e solte o item para alterar a posição.
                </p>
                <draggable
                    :list="currentChildren"
                    class="flex flex-col h-96 overflow-auto gap-2 border p-2"
                    :animation="300"
                    @end="updatePositionInNode"
                    item-key="id"
                    v-if="currentChildren.length"
                >
                <!-- if there is space between the template tag and the first div, vuedraggable throws an error: Item slot must have only one child -->
                    <template #item="{ element, index }"><div>
                            <div
                                class="flex justify-between items-center border border-gray-200 bg-gray-50 p-2 rounded-md w-full shadow-md"
                            >
                                {{ element.label }}
                                <span
                                    class="font-semibold text-pmca-secondary-dark"
                                    >
                                    {{ index + 1 }}
                                </span>
                            </div>
                        </div></template>
                </draggable>

                <div v-else class="flex justify-center items-center h-96 border">
                    <p>O item selecionado não possui filhos.</p>
                </div>
            </div>
        </div>
    </UModal>
</template>

<script setup lang="ts">
// @ts-ignore
import { Finder } from '@jledentu/vue-finder';
import '@jledentu/vue-finder/dist/vue-finder.css';
import draggable from 'vuedraggable';

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

const tree = ref<TreeNode>();
const sameModel = relatedResource.value.name === props.formStore?.model;
const formId = props.formStore?.getId();
const nodeIdToRemove = sameModel ? (formId === 0 ? undefined : formId) : undefined;
let parentIdExists = false;
const defaultExpanded = ref<ID>(null);
const toast = useToast();
const isModalOpen = ref(false);
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

// @ts-ignore
const onExpand = ({ expanded, sourceEvent, expandedItems }) => {
    // TODO: As the descendants of the current node are not shown, the circular reference is not a problem in component itself
    // verify in the backend if the current node is a descendant of the selected node instead

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

const openModalPosition = () => {
    children.value = new Map();
    currentChildren.value = [];
    isModalOpen.value = true;
    if (defaultExpanded.value) {
        getChildrenCurrentNode(tree.value!, defaultExpanded.value);
    }
};

const closeModalPosition = () => {
    children.value = new Map();
    currentChildren.value = [];
    isModalOpen.value = false;
};

const setChildren = ({ expanded, sourceEvent, expandedItems }) => {
    currentExpanded.value = expanded[expanded.length - 1];
    getChildrenCurrentNode(tree.value!, currentExpanded.value);
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

const updatePositionInNode = (event: any) => {
    if (event.oldIndex !== event.newIndex) {
        const currentNodeChildren = children.value.get(currentExpanded.value);

        if (currentNodeChildren) {
            currentNodeChildren.forEach((child, index) => {
                child.position = index + 1;
            });

            children.value.set(currentExpanded.value, currentNodeChildren);
        }
    }
};

const updateTreePosition = async () => {
    const childrenMapped = [] as {
        where: { id: ID };
        data: { position: number };
    }[];

    children.value.forEach((value, key) => {
        value.forEach((child) => {
            childrenMapped.push({
                where: { id: child.id },
                data: { position: child.position }
            });
        });
    });

    const { data, error } = await useFetchWithBaseUrl(
        '/api/' + relatedResource.value.name,
        {
            method: 'PUT',
            body: childrenMapped
        }
    );

    if (error.value) {
        toast.add({
            title: 'Aconteceu algum problema ao atualizar as posições',
            ui: { rounded: 'rounded-sm', padding: 'p-5' }
        });
    }

    if (data.value) {
        toast.add({
            title: 'Posições atualizadas com sucesso',
            ui: { rounded: 'rounded-sm', padding: 'p-5' }
        });
        isModalOpen.value = false;
        await fetchTreeData();
    }

    children.value = new Map();
    currentChildren.value = [];
};

const onClear = () => {
    defaultExpanded.value = null;
    finderRef.value?.expand('root');
};
</script>
