<template>
    <UICardContainer>

        <template #header>
            <UIContainerTitle>
                Cadastros
            </UIContainerTitle>
        </template>

        <div class="flex flex-col">
            <span v-for="link in links" :key="link.name" class="text-2xl my-2">
                <UILink  v-if="!link.restrictedToAdmin" :href="link.path">
                    {{ link.name }}
                </UILink>
            </span>
        </div>

    </UICardContainer>
</template>
   
<script setup lang="ts">
import ROUTES from '~/config/routes';
definePageMeta({
    middleware: 'auth'
});

const userStore = useUserStore();
await userStore.fetch();

const { permissions, name } = storeToRefs(userStore);

const permissionsKeys = Object.keys(permissions.value);

const allowedResources = [];

for (const key of permissionsKeys) {
    if (permissions.value[key] && permissions.value[key].update) {
        allowedResources.push(key);
    }
}

const { data, pending, error } = await useFetchWithBaseUrl('/api/resource', {
    method: 'GET',
    params: {
        where: {
            name: allowedResources
        }
    }
}) as { 
    data: Ref<PaginatedResponse>, pending: Ref<boolean>, error: Ref<Error | undefined>
};

if (error.value) {
    console.error(error.value);
}


const resources = data.value.items as Resource[] ?? [];

const getPath = (path: string) => {
    return ROUTES.list + path;
}

const links: { name: string, path: string, restrictedToAdmin: boolean }[] = [];

for (const resource of resources) {
    links.push({
        name: resource.labelPlural,
        path: getPath(resource.labelSlug),
        restrictedToAdmin: false
    })
}

links.sort((a, b) => a.name.localeCompare(b.name));

useHead({
    title: 'Painel | ' + useRuntimeConfig().public.appName,
});

</script>