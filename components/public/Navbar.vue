<template>
  <nav id="navbar" class="py-4">
    <div class="container max-w-screen-xl mx-auto border-b-2 pb-4 border-b-pmca-primary">
      <div class="grid grid-cols-4 md:grid-cols-12 gap-4">
        <div class="mt-1">
          <NuxtLink to="/">
            <img src="/logo-pmca.png" alt="Logo" class="w-14 h-14" />
          </NuxtLink>
        </div>
        <div class="col-span-3 md:col-span-4">
          <div class="flex flex-col justify-between">
            <h1 class="text-2xl font-semibold flex-row mb-2">
              Glossário de conservação-restauro de livros e documentos
            </h1>
          </div>
        </div>
        <button @click="showMenu = !showMenu" type="button" class="block md:hidden text-right align-middle col-span-4 md:col-span-0 mr-3"
            aria-controls="navbar-main" aria-expanded="false" aria-label="Toggle navigation">
            <Icon name="ph:list" class="w-9 h-9" />
        </button>
        <div class="col-span-1 md:col-span-1">
        </div>
        <div class="col-span-4 md:col-span-6 relative mr-3 lg:mr-0">
          <PublicSearchBar />
        </div>
      </div>
      <ul class="justify-evenly md:flex text-base mr-3 origin-top"
        :class="{ 'block absolute border-b shadow-sm bg-white w-full p-2 top-52 ': showMenu, 'hidden': !showMenu }">
        <li v-for="link in links" :key="link.name" :class="showMenu && 'py-1'">
          <UILink :href="link.path" class="text-2xl">
            {{ link.name }}
          </UILink>
        </li>
      </ul>
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