<template>
  <button
    :type="type"
    class="bg-pmca-accent text-white font-bold rounded-sm first-letter:uppercase" 
    :class="padding + ' ' + (disabled ? 'cursor-not-allowed' : 'hover:bg-pmca-primary')"
    :disabled="disabled"
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
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>