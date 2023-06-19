<template>
  <button
    :type="type"
    class="text-white bg-red-900 p-2 focus:outline-none focus:border-transparent hover:bg-red-950"
  >
    {{ label }}
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  label: String,
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  }
});
</script>