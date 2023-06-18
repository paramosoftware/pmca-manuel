<template>
  <button
    :type="type"
    @click="onClick"
    class="text-white bg-red-900 p-2 focus:outline-none focus:border-transparent hover:bg-red-950"
  >
    {{ label }}
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  label: String,
  onClick: Function as PropType<(event: MouseEvent) => void>,
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  }
});
</script>