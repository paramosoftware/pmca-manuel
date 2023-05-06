<template>
    <EntryForm :entry="entry" />
</template>

<script setup lang="ts">

const entry = ref<Entry>();

const router = useRouter();
const { data } = await useFetch(`/api/entries/${router.currentRoute.value.params.id}`);

// TODO: check if there is a better way 
entry.value = data.value;

</script>