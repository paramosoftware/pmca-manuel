<template>
    <UICardContainer>

        <template #header>
            <UIContainerTitle>
                Cadastros
            </UIContainerTitle>
        </template>

        <div class="flex flex-col">
            <span v-for="link in resources" :key="link.name" class="text-2xl my-2">
                <UILink :href="ROUTES.list + link.labelSlug">
                    {{ link.labelPlural }}
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

const { resources } = storeToRefs(userStore);

useHead({
    title: 'Painel | ' + useRuntimeConfig().public.appName,
});

</script>