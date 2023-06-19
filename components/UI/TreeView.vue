<template>
  <div class="w-full h-full">
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
    type: Object,
    required: true
  }
});

// TODO: review this
const treeRef = ref(props.tree);

const toggleNodeChildren = (node: any) => {
  node.isOpen = !node.isOpen;
};

</script>