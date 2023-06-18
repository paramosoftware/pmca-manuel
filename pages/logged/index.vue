<template>
    <ExternalNavbar />
    <main class="container max-w-screen-xl mx-auto p-5 bg-white border border-neutral mt-5 h-80">
        <div class="flex items-center justify-between">
            <div class="flex flex-col">

                <h1 class="text-5xl text-black">Cadastros</h1>

                <NuxtLink v-for="link in links" :key="link.name" :to="link.path" 
                    class="text-2xl pt-5 hover:underline text-red-900">
                    {{ link.name }}
                </NuxtLink>

            </div>
        </div>
    </main>


    <Footer />
</template>
   
<script setup lang="ts">

definePageMeta({
    middleware: 'auth'
})


const links = [
    {
        name: 'Verbetes',
        path: '/logged/verbetes'
    },
    {
        name: 'Categorias',
        path: '/logged/categorias'
    },
    {
        name: 'Referências',
        path: '/logged/referencias'
    },
    {
        name: 'Idiomas',
        path: '/logged/idiomas'
    }
]


</script>
   
<style scoped></style>