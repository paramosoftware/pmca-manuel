<template>
    <nav id="navbar" class="fixed w-screen top-0 left-0 right-0 z-50 p-4 transition-colors duration-800 ease-in-out"
        :class="isScrolled ? 'bg-neutral-100' : 'bg-transparent'">
        <div class="flex items-center justify-between">
            <div>
                <Icon name="ph:list" class="text-2xl" :class="isScrolled ? 'text-black' : 'text-white'" />
            </div>
            <form id="search" :class="isScrolled ? '' : 'hidden'"> 
                <label for="default-search" class="mb-2 text-sm font-medium text-black sr-only">Search</label>
                <div class="relative md:w-[500px]">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Icon name="ph:magnifying-glass" class="text-black w-5 h-5" />
                    </div>
                    <input type="search" id="default-search"
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
                <p class="text-xl text-white mt-4">Terminologia utilizada na área de conservação-restauração de bens
                    culturais no Brasil.</p>
                <form id="search" class="mt-5" action="/busca" :class="isScrolled ? 'hidden' : ''">
                    <label for="default-search" class="mb-2 text-sm font-medium text-white sr-only">Search</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Icon name="ph:magnifying-glass" class="text-white w-5 h-5" />
                        </div>
                        <input type="search" id="default-search"
                            class="block w-full p-4 pl-10 text-sm text-white border-white bg-transparent placeholder:text-white focus:outline-none  focus:ring-2 focus:ring-white focus:border-transparent"
                            placeholder="" required>
                        <button type="submit" href="/busca"
                            class="text-white absolute right-2.5 bottom-2.5 text-sm px-4 py-2">Buscar</button>
                    </div>
                </form>
            </div>
        </div>
    </section>


    <section id="navigation" class="bg-neutral-100 container max-w-screen-xl mx-auto p-5">
        <div class="flex flex-col md:flex-row h-full pt-10">
            <div class="w-full md:w-1/5 h-full">
                <div class="flex flex-col justify-start h-full">
                    <h1 class="text-4xl text-black mb-5">Categorias</h1>
                </div>
            </div>
            <div class="w-full md:w-4/5 h-full">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <a href="/busca"
                        class="block bg-white shadow-md overflow-hidden text-red-900 uppercase text-lg hover:underline">
                        <div class="p-4">
                            <h3 class="truncate">Danos</h3>
                        </div>
                    </a>
                    <a href="/busca"
                        class="block bg-white shadow-md overflow-hidden text-red-900 uppercase text-lg hover:underline">
                        <div class="p-4">
                            <h3 class="truncate">Materiais</h3>
                        </div>
                    </a>
                    <a href="/busca"
                        class="block bg-white shadow-md overflow-hidden text-red-900 uppercase text-lg hover:underline">
                        <div class="p-4">
                            <h3 class="truncate">Tratamentos</h3>
                        </div>
                    </a>
                </div>
            </div>
        </div>

    </section>

    <section id="about" class="bg-neutral-100 container max-w-screen-xl mx-auto p-5">
        <div class="flex flex-col md:flex-row h-full pt-10">
            <div class="w-full md:w-1/5 h-full">
                <div class="flex flex-col justify-start h-full">
                    <h1 class="text-4xl text-black mb-5">Sobre</h1>
                </div>
            </div>
            <div class="w-full md:w-4/5 h-full">
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
            </div>
        </div>
    </section>

    <Footer />
</template>
 
<script setup lang="ts">

const isScrolled = ref(false)

if (process.client) {
    window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 0
    })
}

</script>
 
 
<style scoped></style>