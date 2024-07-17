<template>
    <div
        @click="node.children && toggleNodeChildren(node)"
        :class="{ 'cursor-pointer': node.children && node.children.length > 0 }"
    >
        <div class="align-middle items-center">
            <UIIcon
                v-if="node.expanded && node.children && node.children.length > 0"
                name="ph:caret-down"
                class="h-5 w-5"
            />
            <UIIcon
                v-else-if="node.children && node.children.length > 0"
                name="ph:caret-right"
                class="h-5 w-5"
            />
            <UIIcon
                v-else-if="!showPosition"
                name="ph:dot-outline"
                class="h-5 w-5"
            />
            <UITreeLink v-if="!node.children"
                :href="'/manual' + node._path"
                class="text-app-theme-400 hover:text-app-theme-500"
                :class="['p-2 ' + (node.expanded ? 'font-semibold text-green-500' : '')]"
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
                            'font-semibold text-app-secondary-900':
                                node._path.includes(currentManualItem)                                
                        }
                    ]"
                >
                    {{ position }}
                </span>
                <span class="pl-1 text-app-secondary-500"
                :class="[ {
                            'font-semibold ':
                                node._path.includes(currentManualItem)
                                
                        }]">
                    {{ node.title }}
                </span>
            </UITreeLink>
            <label v-else>
                {{  node.title }}
            </label>
        </div>
    </div>
    <ul v-if="node.expanded && node.children && node.children.length > 0" class="ml-2">
        <li
            v-for="(child, index) in node.children"
            :key="child.id ?? ''"
            class="m-3 md:m-2"
        >
            <GuideTreeNode
                :node="child"
                :level="level + 1"
                @toggle-children="toggleNodeChildren"
                :show-position="showPosition"
                :parent-position="position"
                :position-among-siblings="index + 1"
                :load-expanded="node.children && node.children.length < 3 || false"
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

if (props.loadExpanded && props.node.children && props.node.children.length > 0) {
    node.value.expanded = true;
}
const route = useRoute();
const rootManualRoute = route.path.split("/").shift();
const currentManualItem = route.path.split("/").pop()
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
