<template>
    <NuxtLayout name="public">
        <article class="container mx-auto mb-auto p-2">
            <div class="flex flex-col justify-left">
                <UIPageTitle>
                    {{ page.name }}
                </UIPageTitle>
                <p class="text-sm text-end text-gray-500 mb-5">
                   Atualizado em {{ new Date(page.updatedAt).toLocaleDateString('pt-BR') }} às {{ new Date(page.updatedAt).toLocaleTimeString('pt-BR') }}
                </p>

               <section v-html="page.content"></section>
            </div>
        </article>
    </NuxtLayout>
</template>
     
<script setup lang="ts">
definePageMeta({
    layout: false,
});

const router = useRouter();
const { data, pending, error } = await useFetchWithBaseUrl('/api/webPage?query=' + JSON.stringify({
    where: {
        nameSlug: router.currentRoute.value.params.slug
    }
}));


if (error.value || data.value.items.length === 0) {
   // TODO: 404
}


const page = ref(data.value.data[0] as unknown as WebPage);

const config = useRuntimeConfig();

const description = ref(page.value.content ? page.value.content.replace(/<[^>]*>?/gm, '').substring(0, 150) : '');

useHead({
    title: page.value.name + ' | ' + config.public.appName,
    meta: [
         { hid: 'description', name: 'description', content: description.value },
         { hid: 'og:title', property: 'og:title', content: page.value.name },
         { hid: 'og:description', property: 'og:description', content: description.value },
    ],
});
</script>
