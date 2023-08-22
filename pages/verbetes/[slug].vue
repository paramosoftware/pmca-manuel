<template>
<NuxtLayout name="public">
   <div class="px-2 md:px-0 mb-auto">
      <PublicEntry :entry="entry" />
   </div>
</NuxtLayout>

 </template>
 
 <script setup lang="ts">

definePageMeta({
   layout: false,
});

 
const router = useRouter();
const { data, pending, error } = await useFetchWithBaseUrl(`/api/entries/by-slug`, {
    method: 'POST',
    body: JSON.stringify({
        slug: router.currentRoute.value.params.slug
    })
});

const entry = data.value;

 </script>
