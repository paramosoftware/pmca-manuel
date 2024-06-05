<template>
    <div class="container mb-auto mx-auto">
        <section id="home" class="md:flex">
            <div class="p-2 md:p-4 mb-auto mx-auto">
                <div class="text-center">
                    <h1 class="text-4xl md:text-5xl font-bold leading-snug">
                        {{ title }}
                        <span class="block" v-if="blockTitle">
                            {{ blockTitle }}
                        </span>
                    </h1>
                    <p class="text-xl mt-4">{{ description }}</p>
                    <div class="col-span-4 md:col-span-7 mt-5 text-start">
                        <PublicSearchBar />
                    </div>
                </div>
            </div>
        </section>
    </div>

    <HomeCarousel />

    <HomeNetwork class="mb-5 container mx-auto"/>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'home'
});

const config = useRuntimeConfig();

const title = ref(config.public.appName);
const blockTitle = ref('');
const description = ref(
    'Terminologia utilizada na área de conservação-restauro em papel'
);

if (title.value.length > 30) {
    title.value = title.value.substring(0, title.value.indexOf(' ', 30));
    blockTitle.value = config.public.appName.replace(title.value, '');
}

useHead({
    title: config.public.appName,
    meta: [
        {
            hid: 'description',
            name: 'description',
            content: config.public.appDescription
        },
        { hid: 'og:title', name: 'og:title', content: config.public.appName },
        {
            hid: 'og:description',
            name: 'og:description',
            content: config.public.appDescription
        }
    ]
});
</script>
