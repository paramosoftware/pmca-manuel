<template>
    <div class="container mx-auto">
        <section id="home" class="md:flex">
            <div class="p-2 md:p-4 mb-auto mx-auto lg:w-4/6">
                <div class="text-center">
                    <h1 class="text-3xl md:text-4xl font-bold line-clamp-2">
                        {{ name }}
                    </h1>
                    <p class="text-base text-gray-500 mt-2" v-if="description">
                        {{ description }}
                    </p>
                    <div class="col-span-4 md:col-span-7 mt-4 text-start">
                        <PublicSearchBar />
                    </div>
                </div>
            </div>
        </section>
    </div>

    <HomeCarousel />

    <HomeNetwork class="mx-auto"/>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'home'
});
const config = useRuntimeConfig();
const glossaryStore = useGlossaryStore();
await glossaryStore.fetch();
const { name, description, keywords } = storeToRefs(glossaryStore);

useSeoMeta({
    title: name.value !== config.public.appName ? `${config.public.appName} | ${name.value}` : config.public.appName,
    description: description.value,
    ogTitle: name.value,
    ogDescription: description.value,
    keywords: keywords.value.map((keyword) => keyword.name).join(', '),
});
</script>
