<template>
    
    <main class="container h-full">
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
import ROUTES from '~/config/routes';

definePageMeta({
    middleware: 'auth'
});

const { data, pending, error } = await useFetchWithBaseUrl('/api/appResource') as { 
    data: Ref<PaginatedResponse>, pending: Ref<boolean>, error: Ref<Error | undefined>
};

if (error.value) {
    console.error(error.value);
}

if (pending.value) {
    console.log('pending');
}

const resources = data.value.items as AppResource[] ?? [];

const getPath = (path: string) => {
    return ROUTES.list + path;
}

const links: { name: string, path: string, restrictedToAdmin: boolean }[] = [];

for (const resource of resources) {
    links.push({
        name: resource.labelPlural,
        path: getPath(resource.labelSlug!),
        restrictedToAdmin: false
    })
}

useHead({
    title: 'Painel | ' + useRuntimeConfig().public.appName,
});

</script>