<template>
  <div>
    <NuxtLayout name="home">
      <div class="container md:my-5 mb-auto mx-auto">
        <section id="home" class="md:flex">
          <div class="p-2 md:p-4 mb-auto mx-auto">
            <div class="text-center">
              <h1 class="text-4xl md:text-5xl font-bold leading-snug ">Glossário de conservação-restauro
                <span class="block">de livros e documentos</span>
              </h1>
              <p class="text-xl mt-4">Terminologia utilizada na área de conservação-restauro em papel</p>
              <div class="col-span-4 md:col-span-7 mt-5 relative">
                <PublicSearchBar />
              </div>
              <div class="flex justify-evenly mt-6">
                <NuxtLink to="/verbetes?modo=hier">
                  <PublicButton>
                      <span class="text-xl">Arranjo hierárquico</span>
                  </PublicButton>
                </NuxtLink>
                
                <NuxtLink to="/verbetes?modo=alfa">
                  <PublicButton>
                      <span class="text-xl">Lista alfabética</span>
                  </PublicButton>
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>


        <HomeCarousel class="mt-10" />

        
        <HomeNetwork class="mt-10 h-96" />
      </div>

    </NuxtLayout>
  </div>
</template>
 
<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>