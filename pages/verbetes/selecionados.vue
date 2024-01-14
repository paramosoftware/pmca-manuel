<template>
    <PublicEntriesGrid :title="title" :user-selection=true :has-tree=false />
</template>  

<script setup lang="ts">
definePageMeta({
    layout: 'public',
});

const config = useRuntimeConfig();
const title = ref('Verbetes selecionados');
const description = ref('Lista de verbetes selecionados');

useHead({
    title: title.value + ' | ' + config.public.appName,
    meta: [
         { hid: 'description', name: 'description', content: description.value },
         { hid: 'og:title', property: 'og:title', content: title.value },
         { hid: 'og:description', property: 'og:description', content: description.value },
    ],
});


onBeforeMount(async () => {
    const entryStore = useEntryStore();
    await entryStore.load('', true);
});
</script>