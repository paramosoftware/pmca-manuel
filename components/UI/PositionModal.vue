<template>
    <UModal
        id="modal-position"
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
                    <template #item="{ element, index }"
                        ><div>
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
                        </div></template
                    >
                </draggable>

                <div
                    v-else
                    class="flex justify-center items-center h-96 border"
                >
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
const emit = defineEmits(['isPositionModalOpen']);

const props = defineProps({
    resource: {
        type: String,
        required: true
    },
    isPositionModalOpen: {
        type: Boolean,
        default: false
    },
});

const tree = ref<TreeNode>();

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

    const { data } = await useFetchWithBaseUrl('/api/' + props.resource, {
        method: 'GET',
        params: defaultQuery,
        transform: (data: PaginatedResponse) => {
            if (!data) {
                return [];
            } else {
                return data.items;
            }
        }
    });

    if (data.value) {
        const builtTree = buildTreeData(
            data.value,
            true,
            undefined,
            undefined,
            undefined
        );

        tree.value = builtTree[0];
        parentIdExists = builtTree[1] as boolean;
    }
};

fetchTreeData();
const closeModalPosition = () => {
    children.value = new Map();
    currentChildren.value = [];
    emit('isPositionModalOpen', false);
};

const setChildren = ({
    expanded,
    sourceEvent,
    expandedItems
}: FinderExpandEvent) => {
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
        '/api/' + props.resource,
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
        emit('isPositionModalOpen', false);
        await fetchTreeData();
    }

    children.value = new Map();
    currentChildren.value = [];
};

</script>
