<template>

  <PublicEntriesGrid :has-view-mode=true />

</template>
   
<script setup lang="ts">
definePageMeta({
    layout: false,
});

const config = useRuntimeConfig();
const title = ref('Verbetes');
const description = ref('Lista de verbetes');

useHead({
    title: title.value + ' | ' + config.public.appName,
    meta: [
         { hid: 'description', name: 'description', content: description.value },
         { hid: 'og:title', property: 'og:title', content: title.value },
         { hid: 'og:description', property: 'og:description', content: description.value },
    ],
});
</script>
  