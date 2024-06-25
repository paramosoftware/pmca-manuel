<template>
    <PublicNavigation :individual-card="true" />
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

const router = useRouter();
const slug = ref(router.currentRoute.value.params.slug.toString());
const conceptStore = useConceptStore();
await conceptStore.load(slug.value);

</script>
