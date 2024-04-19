<template>
  <div class="w-full h-full break-words">
    <ul>
      <li>
        <div v-for="node in treeRef" class="mb-2">
          <UITreeNode :node="node" :level="1" @toggle-children="toggleNodeChildren" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  tree: {
    type: Object as PropType<TreeNode[]>,
    required: true
  }
});

const treeRef = ref(props.tree);

watch(() => props.tree, (value) => {
  treeRef.value = value;
});

const toggleNodeChildren = (node: TreeNode) => {
  node.expanded = !node.expanded;
};

</script>