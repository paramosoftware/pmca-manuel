<template>
  <nav id="navbar" class="fixed w-screen top-0 left-0 right-0 z-50 p-4 transition-colors duration-800 ease-in-out"
    :class="isScrolled ? 'bg-neutral-100' : 'bg-transparent'">
    <div class="flex flex-col md:flex-row items-center justify-between">
      <div class="flex flex-row items-center">
        <NuxtLink to="/">
          <span class="text-2xl p-5 hover:underline" :class="isScrolled ? 'text-black' : 'text-white'">Início</span>
        </NuxtLink>
        <NuxtLink to="/verbetes">
          <span class="text-2xl p-5 hover:underline" :class="isScrolled ? 'text-black' : 'text-white'">Verbetes</span>
        </NuxtLink>
        <NuxtLink to="/logged">
          <span class="text-2xl p-5 hover:underline" :class="isScrolled ? 'text-black' : 'text-white'">Cadastrar</span>
        </NuxtLink>
      </div>
      <form id="search" :class="isScrolled ? '' : 'hidden'" @submit="searchHandler">
        <label for="default-search" class="sr-only">Search</label>
        <div class="relative md:w-[500px]">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon name="ph:magnifying-glass" class="text-black w-5 h-5" />
          </div>
          <input type="search" id="default-search" v-model="search"
            class="w-full p-4 pl-10 text-sm text-black border-black bg-transparent focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            required>
          <button type="submit" class="text-black absolute right-2.5 bottom-2.5 text-sm px-4 py-2">Buscar</button>
        </div>
      </form>
    </div>
  </nav>

    <section id="home" class="w-full h-screen">
        <div id="background-image" class="h-full bg-image bg-no-repeat bg-cover bg-center bg-fixed brightness-50"
            style="background-image: url('https://sites.usp.br/pmca/wp-content/uploads/sites/1185/2022/12/Conservacao-PMCA.png');">
        </div>

        <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center p-4">
            <div class="text-center">
                <h1 class="text-5xl font-bold text-white">Thesaurus de <span
                        class="whitespace-break-spaces">conservação-restauração</span></h1>
                <p class="text-xl text-white mt-4">Terminologia utilizada na área de conservação-restauração.</p>
                <form id="search" class="mt-5" @submit="searchHandler" :class="isScrolled ? 'hidden' : ''">
                    <label for="default-search" class="mb-2 text-sm font-medium text-white sr-only">Search</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Icon name="ph:magnifying-glass" class="text-white w-5 h-5" />
                        </div>
                        <input type="search" id="default-search" v-model="search"
                            class="block w-full p-4 pl-10 text-sm text-white border-white bg-transparent placeholder:text-white focus:outline-none  focus:ring-2 focus:ring-white focus:border-transparent"
                            placeholder="" required>
                        <button type="submit"
                            class="text-white absolute right-2.5 bottom-2.5 text-sm px-4 py-2">Buscar</button>
                    </div>
                </form>
            </div>
        </div>
    </section>


    <ExternalHomeSection title="categorias">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <a v-for="category in categories" :key="category.id" @click="handleRedirect(category.id)"
                class="block bg-white overflow-hidden text-red-900 uppercase text-lg border border-neutral-100 hover:underline">
                <div class="p-4 text-center">
                    <h3 class="truncate">{{ category.name }}</h3>
                </div>
            </a>
        </div>
    </ExternalHomeSection>


    <ExternalHomeSection title="sobre">
        <div class="flex flex-col justify-center h-full">
            <p class="text-xl text-black leading-normal md:leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl eget nunc
                ullamcorper aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet
                nunc, quis aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper
                aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet nunc, quis
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl eget nunc
                ullamcorper aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet
                nunc, quis aliquam nisl nisl vitae nisl. Sed vitae nisl eget nunc ullamcorper
                aliquam. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquet nunc, quis
            </p>
            <div class="flex flex-row justify-center mt-5">
                <a href="#" class="text-red-900 uppercase text-lg hover:underline">Colabore</a>
                <a href="#" class="text-red-900 uppercase text-lg ml-5 hover:underline">Acesse o blog</a>
            </div>
        </div>
    </ExternalHomeSection>

    <Footer />
</template>
 
<script setup lang="ts">

const isScrolled = ref(false)

const router = useRouter() 

if (process.client) {
    window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 0
    })
}

const { data, pending, error } = useFetch('/api/categories')

const categories = ref(data.value);


const handleRedirect = (id: number) => {
    router.push({
        path: '/busca',
        query: {
            categoria: id
        }
    })
};


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
 
 
<style scoped></style>