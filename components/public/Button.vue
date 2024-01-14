<template>
    <UButton
      :type="type"
      :square="square"
      :size="size"
      :class="class"
      class="shadow-sm"
    >
      {{ label }}
      <slot />
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
      type: String as () => 'sm' | 'md' | 'lg',
      default: 'md'
    },
    class: {
      type: String,
      default: ''
    }
  });
  </script>