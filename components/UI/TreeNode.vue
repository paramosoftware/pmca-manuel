<template>
    <div
        @click="node.children.length > 0 && toggleNodeChildren(node)"
        :class="{ 'cursor-pointer': node.children.length > 0 }"
    >
        <div class="align-middle items-center">
            <UIIcon
                v-if="node.expanded && node.children.length > 0"
                name="ph:caret-down"
                class="h-5 w-5"
            />
            <UIIcon
                v-else-if="node.children.length > 0"
                name="ph:caret-right"
                class="h-5 w-5"
            />
            <UIIcon v-else name="ph:dot-outline" class="h-5 w-5" />
            <UILink :href="'/termos/' + node.slug" class="p-2">
                {{ node.label }}
            </UILink>
        </div>
    </div>
    <ul v-if="node.expanded && node.children.length > 0" class="ml-2">
        <li v-for="child in node.children" :key="child.id ?? ''" class="m-3">
            <UITreeNode
                :node="child"
                :level="level + 1"
                @toggle-children="toggleNodeChildren"
            />
        </li>
    </ul>
</template>

<script setup lang="ts">
// TODO: Fix: load the ascendants of the expanded node open
// TODO: Feature: fetch data on demand

defineProps({
    node: {
        type: Object as PropType<TreeNode>,
        required: true
    },
    level: {
        type: Number,
        required: true
    }
});

const emits = defineEmits(['toggle-children']);

const toggleNodeChildren = (node: TreeNode) => {
  node.expanded = !node.expanded;
};
</script>
