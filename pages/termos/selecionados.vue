<template>
    <PublicEntriesGrid
        :title="title"
        :user-selection="true"
        :has-tree="false"
    />
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

const config = useRuntimeConfig();
const title = ref('Termos selecionados');
const description = ref('Lista de termos selecionados');

useHead({
    title: title.value + ' | ' + config.public.appName,
    meta: [
        { hid: 'description', name: 'description', content: description.value },
        { hid: 'og:title', property: 'og:title', content: title.value },
        {
            hid: 'og:description',
            property: 'og:description',
            content: description.value
        }
    ]
});
</script>
