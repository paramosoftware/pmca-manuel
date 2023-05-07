<template>
  <ExternalNavbar />
  <main class="container max-w-screen-xl mx-auto p-5">
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <h1 class="text-5xl text-black">Busca</h1>
        <p class="text-black">Mostrando 1-10 de 100 resultados</p>
      </div>

      <div class="flex flex-col items-end justify-center">
        <Icon name="bi:sort-alpha-up" class="text-black" />
      </div>
    </div>

    <div class="flex flex-col items-end justify-center my-6">
      <nav aria-label="Paginação">
        <ul class="inline-flex items-center -space-x-px">
          <li>
            <a href="#" class="block px-3 py-2 ml-0 leading-tight">
              <span class="sr-only">Previous</span>
              <Icon name="bi:chevron-left" class="w-5 h-5" />
            </a>
          </li>
          <li>
            <a href="#" class="block px-3 py-2 leading-tight bg-red-900 text-white">
              1
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              2
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              3
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              ...
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              10
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              <span class="sr-only">Next</span>
              <Icon name="bi:chevron-right" class="w-5 h-5" />
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <div v-for="n in 10" class="w-full py-4 border-b border-red-900">
      <a href="/verbete" class="w-full h-full flex items-center justify-between">
        <div>
          <p class="text-red-900 text-md uppercase">materiais</p>
          <h1 class="text-4xl text-black">Papel</h1>
          <p class="text-xl text-black mt-4">
            <a href="#">Paper</a> (en) | 
            <a href="#">Papier</a> (fr) | 
            <a href="#">Papel</a>(es)
          </p>
        </div>
        <Icon name="ph:arrow-right" class="text-9xl text-black" />
      </a>
    </div>


    <div class="flex flex-col items-end justify-center my-10">
      <nav aria-label="Paginação">
        <ul class="inline-flex items-center -space-x-px">
          <li>
            <a href="#" class="block px-3 py-2 ml-0 leading-tight">
              <span class="sr-only">Previous</span>
              <Icon name="bi:chevron-left" class="w-5 h-5" />
            </a>
          </li>
          <li>
            <a href="#" class="block px-3 py-2 leading-tight bg-red-900 text-white">
              1
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              2
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              3
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              ...
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              10
            </a>
          </li>

          <li>
            <a href="#" class="block px-3 py-2 leading-tight ">
              <span class="sr-only">Next</span>
              <Icon name="bi:chevron-right" class="w-5 h-5" />
            </a>
          </li>
        </ul>
      </nav>
    </div>

  </main>


  <Footer />
</template>
 
<script setup lang="ts"></script>
 
<style scoped></style>