<template>

   <Navbar />

   <div class="flex-shrink flex ">
      <Sidebar />
      <Entry />
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