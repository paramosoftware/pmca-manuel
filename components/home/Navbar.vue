<template>
    <nav id="navbar" class="py-4">
  
      <div class="container max-w-screen-xl mx-auto border-b-2 pb-4 border-b-pmca-primary">
  
        <div class="grid grid-cols-2 md:grid-cols-8 content-end items-end">
          <div class="mb-1">
            <NuxtLink to="/">
              <img src="/logo-pmca.png" alt="Logo" class="w-14 h-14" />
            </NuxtLink>
          </div>
          <div class="col-span-2 md:col-span-6">
              <div class="flex justify-evenly">
                <UILink v-for="link in links" :key="link.name" :href="link.path" class="text-2xl">
                  {{ link.name }}
                </UILink>
              </div>
          </div>
        </div>
      </div>
  
    </nav>
  </template>
  
  <script setup lang="ts">
  
  const router = useRouter();
  
  const search = ref(router.currentRoute.value.query.termo || '');
  
  
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