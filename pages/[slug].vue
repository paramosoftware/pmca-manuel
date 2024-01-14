<template>
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
</template>
     
<script setup lang="ts">
definePageMeta({
    layout: 'public',
});

const router = useRoute();
const slug = ref(router.params.slug.toString());

const { data, pending, error } = await useFetchWithBaseUrl('/api/webPage/' + slug.value);


if (error.value || !data.value) {
    // TODO: redirect to 404
}


const page = ref(data.value as WebPage);

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
