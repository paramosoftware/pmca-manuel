<template>
  <nav id="navbar" class="py-4">
    <div class="container  mx-auto border-b-2 pb-4 border-b-pmca-primary h-18">
      <div class="grid grid-cols-2 md:grid-cols-8 content-end items-end">
        <div class="mb-1">
          <NuxtLink to="/">
            <img src="/logo-pmca.png" alt="Logo" class="w-14 h-14" />
          </NuxtLink>
        </div>
        <button @click="showMenu = !showMenu"
          class="block md:hidden text-right align-middle mr-3"
          type="button" aria-controls="navbar-main" aria-expanded="false" aria-label="Toggle navigation">
          <Icon name="ph:list" class="w-9 h-9" />
        </button>
        <div class="col-span-2 md:col-span-6">
          <ul class="justify-evenly md:flex text-base mr-3 origin-top"
            :class="{ 'block absolute top-18 border-b bg-white w-full p-2': showMenu, 'hidden': !showMenu }">
            <li v-for="link in links" :key="link.name" :class="showMenu && 'py-1'">
              <UILink :href="link.path" class="text-2xl">
                {{ link.name }}
              </UILink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav> 
</template>
  
<script setup lang="ts">
const showMenu = ref(false);

if (process.client) {
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      showMenu.value = false;
    }
  });
}


const links = ref([
  {
    name: 'Verbetes',
    path: '/verbetes'
  },
  {
    name: 'Sobre',
    path: ''
  },
  {
    name: 'Software',
    path: ''
  },
  {
    name: 'PMCA',
    path: ''
  }
]);


</script>