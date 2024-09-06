<template>
    <div
        @click="node.children.length > 0 && toggleNodeChildren(node)"
        :class="{ 'cursor-pointer': node.children.length > 0 }"
    >
        <div class="align-middle items-center">
            <UIIcon
                v-if="node.expanded && node.children.length > 0"
                name="ph:caret-down"
                class="h-5 w-5 align-middle items-center"
            />
            <UIIcon
                v-else-if="node.children.length > 0"
                name="ph:caret-right"
                class="h-5 w-5 align-middle items-center"
            />
            <UIIcon
                v-else-if="!showPosition"
                name="ph:dot-outline"
                class="h-5 w-5 align-middle items-center"
            />
            <UITreeLink
                :href="'/termos/' + node.slug"
                class="text-app-theme-400 hover:text-app-theme-500"
                :class="['p-2 ' + (node.expanded ? 'font-semibold' : '')]"
                :parentConditional="
                    navigationStore.activeNode?.toString() == node.id ||
                    (path
                        ? node.slug
                            ? path.includes(node.slug)
                            : false
                        : false)
                "
                @click="navigationStore.setLastClickedNode(node.id)"
            >
                <span
                    v-if="showPosition"
                    class="text-xs text-app-primary"
                    :class="[
                        {
                            'font-semibold':
                                node.parentId ==
                                navigationStore.activeNode?.toString(),
                            'font-bold':
                                navigationStore.activeNode?.toString() ==
                                node.id
                        }
                    ]"
                >
                    {{ position }}
                </span>
                {{ replaceHtmlEntities(node.label) }}
            </UITreeLink>
        </div>
    </div>
    <ul v-if="node.expanded && node.children.length > 0" class="ml-2">
        <li
            v-for="(child, index) in node.children"
            :key="child.id ?? ''"
            class="m-3 md:m-2"
        >
            <UITreeNode
                :node="child"
                :level="level + 1"
                @toggle-children="toggleNodeChildren"
                :concept-store="conceptStore"
                :show-position="showPosition"
                :parent-position="position"
                :position-among-siblings="index + 1"
                :load-expanded="node.children.length < 3"
            />
        </li>
    </ul>
</template>

<script setup lang="ts">
// TODO: Feature: fetch data on demand [DISCUSS... hierarchy or network related? both?]
const props = defineProps({
    node: {
        type: Object as PropType<TreeNode>,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    conceptStore: {
        type: Object as PropType<ConceptStore>
    },
    showPosition: {
        type: Boolean,
        default: true
    },
    parentPosition: {
        type: String,
        default: ''
    },
    positionAmongSiblings: {
        type: Number,
        default: 1
    },
    loadExpanded: {
        type: Boolean,
        default: false
    }
});
const navigationStore = useNavigationStore();
const node = ref(props.node);
const router = useRouter();
const path = router.currentRoute.value.path;

const position = computed(() => {
    return props.parentPosition
        ? `${props.parentPosition}.${props.positionAmongSiblings}`
        : `${props.positionAmongSiblings}`;
});

if (props.loadExpanded && props.node.children.length > 0) {
    node.value.expanded = true;
}

const emits = defineEmits(['toggle-children', 'node-opened']);

const lastClickedNode: Ref<ID> = ref('');

const toggleNodeChildren = (node: TreeNode) => {
    node.expanded = !node.expanded;
    if (props.conceptStore) {
        props.conceptStore.fetchDescendants(node.id);
        navigationStore.setLastClickedNode(node.id);
    }
};

onBeforeUnmount(() => {
    navigationStore.cleanLastClickedNode();
});
</script>
