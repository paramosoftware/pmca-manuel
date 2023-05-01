<template>
  <article class="container max-w-screen-xl mx-auto p-5 sm:pl-20 md:flex">
    <section class="w-full md:w-1/5 mx-auto">
      <a href="#" class="text-red-900 text-xl uppercase hover:underline">materiais</a>
      <h1 class="text-5xl font-bold text-black">Papel</h1>
      <p class="text-xl text-black mt-4"><a href="#">Paper</a> (en) | <a href="#">Papier</a> (fr) | <a href="#">Papel</a>(es)</p>
      <div class=" mt-4 w-3/4">
        <p class="text-lg uppercase text-red-900">Compartilhar</p>
        <div class="flex flex-row mt-2">
          <a href="#" class="mr-2">
            <Icon name="ph:facebook-logo"/>
          </a>
          <a href="#" class="mr-2">
            <Icon name="ph:twitter-logo"/>
          </a>
          <a href="#" class="mr-2">
            <Icon name="ph:whatsapp-logo"/>
          </a>
          <a href="#" class="mr-2">
            <Icon name="ph:link"/>
          </a>
        </div>
      </div>
      <div class="mt-4 w-1/4">
        <p class="text-lg uppercase text-red-900">Baixar</p>
        <div class="flex flex-row mt-2">
          <a href="#" class="mr-2">
            <Icon name="ph:file-pdf"/>
          </a>
        </div>
      </div>
    </section>
    <section class="w-full md:w-4/5 md:pl-10 md:py-6 mt-6 md:mt-0">
      <div class="snap-x w-full overflow-x-scroll flex mt-4 scrollbar-hide">
        <div class="snap-start py-2 pr-2 flex-none">
          <img src="https://picsum.photos/id/237/300/200" />
        </div>
        <div class="snap-start p-2 flex-none">
          <img src="https://picsum.photos/id/238/300/200" />
        </div>
        <div class="snap-start p-2 flex-none">
          <img src="https://picsum.photos/id/239/300/200" />
        </div>
      </div>
      <div class="flex flex-col">
        <div class="flex flex-col mt-4">
          <p class="text-lg uppercase text-red-900">Definição</p>
          <p class="text-xl text-black">            
            O papel é um material constituído por elementos fibrosos de origem vegetal,
            geralmente distribuído sob a forma de folhas ou rolos. Tal material é feito a partir
            de uma espécie de pasta desses elementos fibrosos, secada sob a forma de folhas,
            que por sua vez são frequentemente utilizadas para escrever, desenhar, imprimir,
            embalar, etc.[1] Do ponto de vista químico, o papel se constitui basicamente de ligações de hidrogênio.
          </p>
        </div>
        <div class="flex flex-col mt-4">
          <p class="text-lg uppercase text-red-900">Termos relacionados</p>
          <div class="flex flex-col">
            <p class="text-xl text-black">
              <a href="#">Papelão</a> | 
              <a href="#">Celulose</a> | 
              <a href="#">Papel reciclado</a>
            </p>
          </div>
        </div>
        <div class="flex flex-col mt-4">
          <p class="text-lg uppercase text-red-900">Referências</p>          
          <div class="flex flex-col">
            <p class="text-xl text-black mb-1">
              <a href="#">ADOLFO, Celan. Papel: a história. São Paulo: Cosac Naify, 1991.</a>
            </p>
            <p class="text-xl text-black mb-1">
              <a href="#">BREE, Mores. Papel: história, técnica e conservação. Rio de Janeiro: Ed. Senac Nacional, 2002.</a> 
            </p>
          </div>
        </div>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>