<template>
    <PublicPage :title="page.name">
        <article>
            <div class="flex flex-col justify-left">
                <p class="text-sm text-end text-gray-500 mb-5">
                    Atualizado em
                    {{ new Date(page.updatedAt).toLocaleDateString('pt-BR') }} às
                    {{ new Date(page.updatedAt).toLocaleTimeString('pt-BR') }}
                </p>

                <section v-html="page.content"></section>
            </div>
        </article>
    </PublicPage>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

const route = useRoute();
const slug = ref(route.params.slug.toString());

const { data, pending, error } = await useFetchWithBaseUrl(
    '/api/public/webPage/' + slug.value
);

if (!data || error.value || !data.value) {
    throw createError({});
}

const page = ref(data.value as WebPage);

const config = useRuntimeConfig();

const description = ref(
    page.value.content
        ? page.value.content.replace(/<[^>]*>?/gm, '').substring(0, 150)
        : ''
);

useHead({
    title: page.value.name + ' | ' + config.public.appName,
    meta: [
        { hid: 'description', name: 'description', content: description.value },
        { hid: 'og:title', property: 'og:title', content: page.value.name },
        {
            hid: 'og:description',
            property: 'og:description',
            content: description.value
        }
    ]
});
</script>
