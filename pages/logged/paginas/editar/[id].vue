<template>
    <FormWebPage :web-page="webPage" />
</template>

<script setup lang="ts">
const webPage = ref<WebPage>();

const router = useRouter();
const { data } = await useFetchWithBaseUrl('/api/web-pages/' + router.currentRoute.value.params.id);

webPage.value = data.value;

</script>