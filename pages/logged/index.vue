<template>
    <ExternalNavbar />

    <main class="container max-w-screen-xl mx-auto p-5 bg-white border border-neutral mt-5 h-full">
        <div class="flex items-center justify-between">
            <div class="flex flex-col">

                <h1 class="text-5xl text-black">Cadastros</h1>

                <NuxtLink v-for="link in availableLinks" :key="link.name" :to="link.path"
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

const { isAuthenticated, isAdmin } = useAuth();
const _isAdmin = await isAdmin();

const links = [
    {
        name: 'Verbetes',
        path: '/logged/verbetes',
        restrictedToAdmin: false
    },
    {
        name: 'Categorias',
        path: '/logged/categorias',
        restrictedToAdmin: false
    },
    {
        name: 'Referências',
        path: '/logged/referencias',
        restrictedToAdmin: false
    },
    {
        name: 'Idiomas',
        path: '/logged/idiomas',
        restrictedToAdmin: false
    },
    {
        name: 'Usuários',
        path: '/logged/usuarios',
        restrictedToAdmin: true
    }
]

const availableLinks = computed(() => {
    
    var temp = [];

    if (_isAdmin)
        return links;

    for (var i = 0; i < links.length; i++)
    {
        if (!links[i].restrictedToAdmin)
            temp.push(links[i]);
    }

    return temp;
});

</script>
   
<style scoped></style>