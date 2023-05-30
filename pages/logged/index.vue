<template>
    <ExternalNavbar />
    <main class="container max-w-screen-xl mx-auto p-5 bg-white border border-neutral mt-5 h-80">
        <div class="flex items-center justify-between">
            <div class="flex flex-col">

                <h1 class="text-5xl text-black">Cadastros</h1>


                <NuxtLink to="/logged/verbetes">
                    <p class="text-2xl pt-5 hover:underline text-red-900 ">Verbetes</p>
                </NuxtLink>
                <NuxtLink to="/logged/categorias">
                    <p class="text-2xl pt-5 hover:underline text-red-900">Categorias</p>
                </NuxtLink>

            </div>
        </div>
    </main>


    <Footer />
</template>
   
<script setup lang="ts">


</script>
   
<style scoped></style>