<template>
<NuxtLayout name="public">
   <div class="px-2 md:px-0 mb-auto mx-auto">
      <PublicEntry :entry="entry" />
   </div>
</NuxtLayout>

 </template>
 
 <script setup lang="ts">

definePageMeta({
   layout: false,
});

 
const router = useRouter();
const { data, pending, error } = await useFetchWithBaseUrl(`/api/entries/by-code`, {
    method: 'POST',
    body: JSON.stringify({
        code: router.currentRoute.value.params.code
    })
});

const entry = data.value;

 </script>
