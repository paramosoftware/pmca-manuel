<template>
  <button
    :type="type"
    class="bg-pmca-accent hover:bg-pmca-primary text-white font-bold rounded-sm first-letter:uppercase"
    :class="padding"
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
  },
  padding: {
    type: String,
    default: 'px-4 py-2'
  }
});
</script>