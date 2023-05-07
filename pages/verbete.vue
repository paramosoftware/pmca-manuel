<template>

   <ExternalNavbar />

   <div class="flex-shrink flex ">
      <ExternalSidebar />
      <ExternalEntry />
   </div>

   <Footer />

 </template>
 
 <script setup lang="ts">
 
 import { initFlowbite } from 'flowbite'
 
 onMounted(() => {
    initFlowbite();
 })
 
 </script>
 
 
 <style scoped></style>