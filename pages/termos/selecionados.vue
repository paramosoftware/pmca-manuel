<template>
    <PublicNavigation :user-selection="true" :title="title" />
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

const config = useRuntimeConfig();
const title = ref('Termos selecionados');
const description = ref('Lista de termos selecionados');

useSeoMeta({
    title: title.value + ' | ' + config.public.appName,
    description: description.value,
    ogTitle: title.value,
    ogDescription: description.value
});
</script>
