<template>
  <button
    :type="type"
    class="bg-pmca-accent hover:bg-pmca-primary text-white font-bold py-2 px-4 rounded-sm first-letter:uppercase"
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