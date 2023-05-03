<template>
<div class="sticky text-center mt-5 m-5 z-0">
   <button type="button" data-drawer-target="drawer-backdrop" data-drawer-show="drawer-backdrop" aria-controls="drawer-backdrop">
      <span class="sr-only">Abrir menu</span>
      <p class="uppercase text-lg text-red-900" style="writing-mode: vertical-lr;">Categorias</p>
      <Icon name="ph:caret-right" class="w-5 h-5 p-0 m-0" />
   </button>
</div>


<!-- drawer component -->
<div id="drawer-backdrop" class="fixed top-0 left-0 z-50 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-neutral-100 w-screen md:w-96 border-r border-red-900" tabindex="-1" aria-labelledby="drawer-backdrop-label">
    <h5 id="drawer-backdrop-label" class="text-lg text-red-900 uppercase">Categorias</h5>
    <button type="button" data-drawer-hide="drawer-backdrop" aria-controls="drawer-backdrop" class="absolute top-0 right-0 p-4">
      <Icon name="ph:x" class="w-5 h-5" />  
      <span class="sr-only">Fechar menu de categorias</span>
    </button>
  <div class="py-4 overflow-y-auto">
      <ul class="space-y-2 font-medium">
         <li>
            <a href="#" class="flex items-center text-black">
               <span class="text-lg p-3 border-l border-red-900 hover:border-l-4">
                  Danos
               </span>
            </a>
         </li>
         <li>
            <button type="button" class="flex items-center w-full text-base text-black transition duration-75" aria-controls="dropdown-example" data-collapse-toggle="dropdown-example">
                  <span class="text-lg flex-1 text-left whitespace-nowrap p-3 border-l border-red-900 hover:border-l-4">Materiais</span>
                  <Icon name="ph:caret-down" class="w-5 h-5 text-black transition duration-75" />
            </button>
            <ul id="dropdown-example" class="hidden py-2 space-y-2">
                  <li v-for="n in 5">
                     <a href="#" class="flex items-center w-full text-black transition duration-75 pl-8">
                        <span class="text-lg p-3 border-l border-red-900 hover:border-l-4">
                           Papel
                        </span>
                     </a>
                  </li>
            </ul>
         </li>
         <li>
            <a href="#" class="flex items-center text-black">
               <span class="text-lg p-3 border-l border-red-900 hover:border-l-4">
                  Tratamentos
               </span>
            </a>
         </li>
      </ul>
   </div>
</div>
</template>

<script lang="ts">
</script>