<template>
   <div class="sticky text-center mt-5 m-5 z-0">
      <button type="button" data-drawer-target="drawer-backdrop" data-drawer-show="drawer-backdrop"
         aria-controls="drawer-backdrop">
         <span class="sr-only">Abrir menu</span>
         <p class="uppercase text-lg text-red-900" style="writing-mode: vertical-lr;">{{ title }}</p>
         <Icon name="ph:caret-right" class="w-5 h-5 p-0 m-0" />
      </button>
   </div>

   <div id="drawer-backdrop"
      class="fixed top-0 left-0 z-50 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-neutral-100 w-screen md:w-96 border-r border-red-900"
      tabindex="-1" aria-labelledby="drawer-backdrop-label">
      <h5 id="drawer-backdrop-label" class="text-lg text-red-900 uppercase">{{ title }}</h5>
      <button type="button" data-drawer-hide="drawer-backdrop" aria-controls="drawer-backdrop"
         class="absolute top-0 right-0 p-4">
         <Icon name="ph:x" class="w-5 h-5" />
         <span class="sr-only">Fechar menu</span>
      </button>
      <div class="py-4 overflow-y-auto">
         <ul class="space-y-2 font-medium">
            <ExternalSidebarNode v-for="category in categories" :key="category.id" :category="category.name" :entries="category.entries" />
         </ul>
      </div>
   </div>
</template>

<script setup lang="ts">

const title = 'categorias';

const { data, pending, error } = useFetchWithBaseUrl('/api/categories')

const categories = ref(data.value);

</script>