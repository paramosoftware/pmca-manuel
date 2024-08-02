<template>
    <div class="container mx-auto">
        <section id="home" class="md:flex mt-10">
            <div class="p-2 md:p-4 mb-auto mx-auto md:w-4/6">
                <div class="text-center">

                    <UIGlossarySelector :custom-class="'text-3xl font-bold line-clamp-3'" />
                    <p class="text-base text-gray-500 mt-2" v-if="description">
                        {{ description }}
                    </p>
                    <div class="col-span-4 md:col-span-6 mx-4 mt-4 text-start">
                        <PublicSearchBar class="w-full" />
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
