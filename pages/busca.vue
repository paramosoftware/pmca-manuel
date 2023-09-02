<template>

  <PublicEntriesGrid title="Busca" />

</template>  

<script setup lang="ts">
definePageMeta({
    layout: false,
});

const config = useRuntimeConfig();
const title = ref('Busca');
const description = ref('Resultado da busca');

useHead({
    title: title.value + ' | ' + config.public.appName,
    meta: [
         { hid: 'description', name: 'description', content: description.value },
         { hid: 'og:title', property: 'og:title', content: title.value },
         { hid: 'og:description', property: 'og:description', content: description.value },
    ],
});
</script>