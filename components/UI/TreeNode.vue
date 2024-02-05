<template>
    <div @click="node.children.length > 0 && $emit('toggle-children', node)"  :class="{ 'cursor-pointer': node.children.length > 0 }">
        <div class="align-middle items-center">
            <UIIcon v-if="node.expanded && node.children.length > 0" name="ph:minus-square" class="h-4 w-4 mr-1" />
            <UIIcon v-else-if="node.children.length > 0" name="ph:plus-square" class="h-4 w-4 mr-1 align-middle" />
            <UILink :href="'/verbetes/' + node.slug" class="p-3 font-semibold" :class="level === 1 ? 'uppercase' : 'text-lg'">
                {{ node.label }}
            </UILink>
        </div>
    </div>
    <ul v-if="node.expanded && node.children.length > 0" class="ml-4">
        <li v-for="child in node.children" :key="child.id ?? ''" class="mb-1">
            <UITreeNode :node="child" :level="level + 1" @toggle-children="$emit('toggle-children', $event)" />
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
</script>
  