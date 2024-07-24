<template>
    <div
        @click="node.children && toggleNodeChildren(node)"
        :class="{
            'bg-gray-100': activeNode
        }"
    >
        <div 
            class="align-middle items-center justify-between flex"
            :class="{
                'bg-gray-100': activeNode
            }"
        >
            <UILink
                v-if="!node.children"
                :href="prefixPath + node._path"
                :active="activeNode"
            >
                {{ node.title }}
            </UILink>
            <label v-else>
                {{ node.title }} 
            </label>
            <UIIcon
                v-if="
                    node.expanded && node.children && node.children.length > 0
                "
                name="ph:caret-down"
                class="h-5 w-5"
            />
            <UIIcon
                v-else-if="node.children && node.children.length > 0"
                name="ph:caret-up"
                class="h-5 w-5"
            />
        </div>
    </div>
    <ul v-if="node.expanded && node.children && node.children.length > 0">
        <li
            v-for="(child, index) in node.children"
            :key="child.id ?? ''"
            class="ml-2 my-2"
        >
            <GuideTreeNode
                :node="child"
                :level="level + 1"
                @toggle-children="toggleNodeChildren"
                :load-expanded="true"
            />
        </li>
    </ul>
</template>

<script setup lang="ts">
import type { NavItem } from '@nuxt/content';
const props = defineProps({
    node: {
        type: Object as PropType<NavItem>,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    loadExpanded: {
        type: Boolean,
        default: false
    }
});

const prefixPath = '/manual';

const node = ref(props.node);
node.value.expanded = props.loadExpanded;

const route = useRoute();
const currentManualItem = route.path.replace(prefixPath, '');
const activeNode = ref(currentManualItem === node.value._path || !currentManualItem && node.value._path === '/');

const emits = defineEmits(['toggle-children', 'node-opened']);

const toggleNodeChildren = (node: NavItem) => {
    node.expanded = !node.expanded;
};
</script>
