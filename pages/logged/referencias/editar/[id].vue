<template>
    <FormReference :reference="reference" />
</template>

<script setup lang="ts">
const reference = ref<Reference>();

const router = useRouter();
const { data } = await useFetchWithBaseUrl('/api/references/' + router.currentRoute.value.params.id);

reference.value = data.value;

</script>