<template>
    <div v-if="node.link">
        <NuxtLink :to="node.link">
            <span class="text-lg text-red-900 hover:underline">{{ node.label }}</span>
        </NuxtLink>
    </div>
    <div v-else @click="$emit('toggle-children', node)" :class="{ 'cursor-pointer': node.children.length > 0 }">
        <div class="align-middle">
            <Icon v-if="node.showChildren && node.children.length > 0 || node.isOpen" name="ph:minus-square"
                class="h-4 w-4 mr-1" />
            <Icon v-else-if="node.children.length > 0" name="ph:plus-square" class="h-4 w-4 mr-1 align-middle" />
            <span class="text-lg" :class="{ 'text-xl font-bold': level === 1 }">{{ node.label }}</span>
        </div>
    </div>
    <ul v-if="node.showChildren || node.isOpen" class="mt-1 pl-5 mb-3">
        <li v-for="child in node.children" :key="child.id" class="mb-1">
            <UITreeNode :node="child" :level="level + 1" @toggle-children="$emit('toggle-children', $event)" />
        </li>

    </ul>
</template>
  
<script setup lang="ts">
const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    level: {
        type: Number,
        required: true
    }
});
</script>
  