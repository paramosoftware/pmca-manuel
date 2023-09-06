<template>
    <div class="flex flex-col justify-center items-center h-screen">

        <div class="flex flex-row justify-center items-center">
            <Icon class="w-40 h-40 mr-5" name="ph:warning-circle" />
            <div class="flex flex-col justify-center items-center">
                <h1 class="text-8xl font-bold">404</h1>
                <p class="text-2xl font-bold">Página não encontrada</p>
            </div>

        </div>
        <UILink :href="href" class="mt-5 text-xl">
            Voltar para a página inicial
        </UILink>

    </div>
</template>

<script setup lang="ts">
import { ROUTES } from '~/config';

const route = useRoute();
const href = route.fullPath.includes(ROUTES.restricted) ? ROUTES.restricted : '/';

useHead({
    title: 'Página não encontrada',
});
</script>