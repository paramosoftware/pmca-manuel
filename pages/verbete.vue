<template>

   <Navbar />
    
   <Entry />

 </template>
 
 <script setup lang="ts">
 
 import { initFlowbite } from 'flowbite'
 
 onMounted(() => {
    initFlowbite();
 })
 
 </script>
 
 
 <style scoped></style>