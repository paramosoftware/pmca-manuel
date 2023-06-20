<template>
    
    <main class="container max-w-screen-xl mx-auto h-full">
        <div class="flex items-center justify-between">
            <div class="flex flex-col">

                <h1 class="text-4xl">Cadastros</h1>

                <span v-for="link in links" :key="link.name" class="text-2xl my-2">
                    <UILink  v-if="!link.restrictedToAdmin" :href="link.path">
                        {{ link.name }}
                    </UILink>
                </span>

            </div>
        </div>
    </main>

</template>
   
<script setup lang="ts">

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
        restrictedToAdmin: !_isAdmin
    }
]
</script>
   
<style scoped></style>