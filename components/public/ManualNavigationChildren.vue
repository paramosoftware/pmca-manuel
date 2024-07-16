<template>
    <ul class="pl-2">
      <li class="" v-for="navigationItem in navigationObject" :key="navigationItem._path">
        - <NuxtLink :to="navigationItem._path">{{ navigationItem.title }}</NuxtLink>
         <ManualNavigationChildren v-if="navigationItem.children" :navigationObject="navigationItem.children"/>

      </li>
    </ul>
  </template>
  

<script setup lang="ts">
const props = defineProps({
    navigationObject: {
    type: Object as () => NavItem[],
    required: true
  },
});



</script>
