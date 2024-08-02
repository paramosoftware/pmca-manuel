<template>
  <UButton
    :type="type"
    :square="square"
    :size="size"
    :class="class"
    class="shadow-sm"
  >
    <span :class="{ 'font-semibold': bold }">
      {{ label }}
      <slot />
    </span>
  </UButton>
</template>

<script setup lang="ts">
defineProps({
  label: String,
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  },
  square: {
    type: Boolean,
    default: false
  },
  size: {
    type: String as () => 'sm' | 'md' | 'lg' | 'xl',
    default: 'md'
  },
  class: {
    type: String,
    default: ''
  },
  bold: {
    type: Boolean,
    default: true
  }
});
</script>