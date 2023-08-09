<template>
  <div>
    <NuxtLayout name="home">
      <div class="container md:my-5 mb-auto">
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

        <!-- sobre -->
        <HomeSection title="Sobre" class="mt-10">

          <div class="flex flex-col justify-between">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl eget nunc
              ullamcorper aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet
              nunc, quis aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper
              aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet nunc, quis
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl eget nunc
              ullamcorper aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet
              nunc, quis aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper
              aliquam.
            </p>

            <h1 class="text-2xl font-semibold flex-row my-5">
              Projeto Manuel Correia de Andrade
            </h1>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl eget nunc
              ullamcorper aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet
              nunc, quis aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper
              aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet nunc, quis
              aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper aliquam.
            </p>

            <h1 class="text-2xl font-semibold flex-row my-5">
              Software
            </h1>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl eget nunc
              ullamcorper aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet
              nunc, quis aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper
              aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet nunc, quis
              aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper aliquam.
            </p>

            <h1 class="text-2xl font-semibold flex-row my-5">
              Terminologia de conservação-restauro
            </h1>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl eget nunc
              ullamcorper aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet
              nunc, quis aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper
              aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet nunc, quis
              aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper aliquam.
            </p>

            <h1 class="text-2xl font-semibold flex-row my-5">
              Ficha Técnica
            </h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl eget nunc
              ullamcorper aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet
              nunc, quis aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper
              aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet nunc, quis
              aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper aliquam.
            </p>
          </div>

        </HomeSection>
      </div>

    </NuxtLayout>
  </div>
</template>
 
<script setup lang="ts">


definePageMeta({
  layout: false,
});

const router = useRouter()

const search = ref(router.currentRoute.value.query.termo || '');

const searchHandler = (e: Event) => {
  if (search.value) {
    e.preventDefault();
    router.push({
      path: '/busca',
      query: {
        termo: search.value
      }
    });
  }
};
</script>