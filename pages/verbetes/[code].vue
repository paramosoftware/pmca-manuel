<template>

   <ExternalNavbar />

   <div class="flex-shrink flex">
      <ExternalSidebar :open-entry-id="entry.id" />
      <ExternalEntry :entry="entry" />
   </div>

   <Footer />

 </template>
 
 <script setup lang="ts">
 
 import { initFlowbite } from 'flowbite'
 
 onMounted(() => {
    initFlowbite();
 })


const router = useRouter();
const { data, pending, error } = await useFetchWithBaseUrl(`/api/entries/by-code`, {
    method: 'POST',
    body: JSON.stringify({
        code: router.currentRoute.value.params.code
    })
});

const entry = data.value;

 </script>
 
 
 <style scoped></style>