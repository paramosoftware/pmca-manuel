<template>
    <FormLanguage :language="language" />
</template>

<script setup lang="ts">
const language = ref<Language>();

const router = useRouter();
const { data } = await useFetchWithBaseUrl('/api/languages/' + router.currentRoute.value.params.id);

language.value = data.value;

</script>