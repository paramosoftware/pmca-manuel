<template>
    <NuxtLayout :name="layout">
        <PublicPage :show-breadcrumb="false">
            <div class="items-center justify-center flex flex-col min-h-[70vh]">
                <UIIcon name="ph:warning-circle" class="w-24 h-24" variant="static"/>
                <h1 class="text-5xl text-center font-bold">
                    {{ title }}
                </h1>
                <p class="text-xl mt-5">
                    {{ message }}
                </p>
                <div
                    class="text-sm my-5 max-h-48 overflow-auto container"
                    v-if="dev"
                >
                    {{ error?.message ?? '' }}
                    {{ error?.url ?? '' }}
                    {{ error?.statusCode ?? '' }}
                    {{ error?.statusMessage ?? '' }}
                    <div v-html="error?.stack ?? ''"></div>
                </div>
                <NuxtLink :to="to" class="mt-5">
                    <UIButton>
                        <UIIcon name="ph:arrow-left" variant="button"/>
                        <span class="text-lg">Voltar para a página principal</span>
                    </UIButton>
                </NuxtLink>
            </div>
        </PublicPage>
    </NuxtLayout>
</template>

<script setup lang="ts">
const props = defineProps({
    error: Object as () => {
        data: string;
        url: string;
        statusCode: number;
        statusMessage: string;
        message: string;
        stack: string;
        title: string;
        to: string;
        layout: string;
    }
});

const data = JSON.parse(props.error?.data || '{}');

const adminPath = '/admin';
let isRestricted = false;

let to = '/';

if (data.to) {
    to = data.to;
} else if (
    props.error?.url.startsWith(adminPath) &&
    props.error?.url !== adminPath
) {
    to = adminPath;
    isRestricted = true;
}

const title = data.title || 'Página não encontrada';
const message = data.message || '';
const layout = data.layout || isRestricted ? 'default' : 'public';
const dev = process.env.NODE_ENV === 'development';
</script>
