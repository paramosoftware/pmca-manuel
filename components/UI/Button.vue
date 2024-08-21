<template>
  <UButton
    :type="type"
    :square="square"
    :size="size"
    :class="computedClass"
    class="shadow-sm"
  >
      {{ label }}
      <slot />
    </UButton>
</template>

<script setup lang="ts">
const props = defineProps({
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

const computedClass = computed(() => {
  return (props.bold ? "font-semibold" : "") + " " + props.class;
});
</script>