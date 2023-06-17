<template>
  <div class="w-full h-full">
    <ul>
      <li>
        <div v-for="node in tree" class="mb-2">
          <TreeNode :node="node" :level="1" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps({
  tree: {
    type: Object,
    required: true
  }
});
</script>