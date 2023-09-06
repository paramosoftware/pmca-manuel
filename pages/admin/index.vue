<template>
    
    <main class="container h-full">
        <div class="flex items-center justify-between">
            <div class="flex flex-col">

                <h1 class="text-4xl">Cadastros</h1>

                <span v-for="link in links" :key="link.name" class="text-2xl my-2">
                    <UILink  v-if="!link.restrictedToAdmin" :href="link.path" class="capitalize">
                        {{ link.name }}
                    </UILink>
                </span>

            </div>
        </div>
    </main>

</template>
   
<script setup lang="ts">
import { OBJECTS, ROUTES } from '~/config';

definePageMeta({
    middleware: 'auth'
});

const config = useRuntimeConfig();
const { isAdmin } = useAuth();
const _isAdmin = await isAdmin();

const getPath = (path: string) => {
    return ROUTES.list + path;
}

const objects = ['verbete', 'categoria', 'referencia', 'idioma', 'usuario', 'pagina'];
const links: { name: string, path: string, restrictedToAdmin: boolean }[] = [];

for (const object of objects) {
    if (OBJECTS[object]) {
        links.push({
            name: OBJECTS[object].labelPlural,
            path: getPath(object),
            restrictedToAdmin: ['usuario', 'pagina'].includes(object) && !_isAdmin
        })
    }
}

useHead({
    title: 'Painel | ' + config.public.appName,
});


</script>
   
<style scoped></style>