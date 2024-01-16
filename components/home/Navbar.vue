<template>
  <nav id="navbar" class="p-4 border-b-2 border-b-pmca-primary mb-4">
        <div class="max-w-screen-2xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-8 content-end items-end">
        <div class="mb-1">
          <NuxtLink to="/">
            <img src="/icons/icon-pmca.png " alt="Logo" class="w-14 h-14" />
          </NuxtLink>
        </div>
        <button @click="showMenu = !showMenu"
          class="block md:hidden text-right align-middle mr-3"
          type="button" aria-controls="navbar-main" aria-expanded="false" aria-label="Toggle navigation">
          <UIIcon name="ph:list" class="w-9 h-9" />
        </button>
        <div class="col-span-3 md:col-span-6">
          <PublicNavLinks :show-menu="showMenu" @update:show-menu="showMenu = $event" />
        </div>
      </div>
    </div>
  </nav> 
</template>
  
<script setup lang="ts">
const showMenu = ref(false);
</script>