<template>
    <Splide :has-track="false" :options="options" class="py-5 sm:py-0 px-0 md:px-14">
        <UITitle id="carousel-heading" class="my-5">
            <span class="text-semibold text-3xl">
                Verbetes selecionados
            </span>
        </UITitle>
        <SplideTrack>
            <SplideSlide v-for="entry in entries" :key="entry.id" class="mx-auto items-center justify-center">
                <PublicEntryCard :entry="entry" />
            </SplideSlide>
        </SplideTrack>


        <span class="splide__arrows w-36 h-36">
            <button class="splide__arrow splide__arrow--prev">
                    <Icon name="ph:caret-right" />
            </button>
            <button class="splide__arrow splide__arrow--next">
                    <Icon name="ph:caret-right" />
            </button>
        </span>

    </Splide>
</template>

<script setup>
import { Splide, SplideSlide, SplideTrack } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css';


const entries = ref([])

const fetchEntries = async () => {
    const { data } = await useFetchWithBaseUrl('/api/entry?query=' + JSON.stringify({
        include: {
            media: {
                orderBy: ['position'],
                include: ['media'],
            }
        },
        where: {
            isCategory: false
        },
    }));
    entries.value = data.value.data;
}

await fetchEntries();


const options = {
    type: 'loop',
    perPage: 4,
    perMove: 1,
    gap: '1rem',
    pagination: false,
    breakpoints: {
        640: {
            perPage: 1,
            gap: '1rem',
            arrows: false,
            pagination: true
        },
        768: {
            perPage: 2,
            gap: '1rem',
        },
        1024: {
            perPage: 3,
            gap: '1rem',
        },
    },
};
</script>

<style>

.splide__arrow {
    background: none;
    top: 60%;
}

.splide__arrow svg {
    fill: #000;
    height: 100%;
    width: 100%;
}

.splide__pagination {
    bottom: -0.5rem;
}

.splide__pagination__page.is-active {
    background: #aacc4459;
}

</style>

