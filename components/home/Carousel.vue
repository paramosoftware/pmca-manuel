<template>
    <div class="container mx-auto" v-if="concepts && concepts.length > 0">
        <Splide :has-track="false" :options="options" class="p-5 sm:px-14 mb-10 md:mb-5">
            <h3 class="font-semibold text-xl md:text-3xl mb-3">
                Termos selecionados
            </h3>
            <SplideTrack>
                <SplideSlide
                    v-for="concept in concepts"
                    :key="concept.id"
                    class="mx-auto items-center justify-center"
                >
                    <PublicCard :concept="concept" width="w-full" />
                </SplideSlide>
            </SplideTrack>

            <span class="splide__arrows w-36 h-36">
                <button class="splide__arrow splide__arrow--prev">
                    <UIIcon name="ph:caret-right" />
                </button>
                <button class="splide__arrow splide__arrow--next">
                    <UIIcon name="ph:caret-right" />
                </button>
            </span>
        </Splide>
    </div>
</template>

<script setup>
import { Splide, SplideSlide, SplideTrack } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css';

const conceptStore = useConceptStore();
conceptStore.reset();
await conceptStore.load();
const { concepts } = storeToRefs(conceptStore);

const options = {
    type: 'slide',
    perPage: 4,
    perMove: 1,
    gap: '1rem',
    pagination: false,
    rewind: true,
    breakpoints: {
        640: {
            perPage: 1,
            gap: '1rem',
            arrows: false,
            pagination: true
        },
        1024: {
            perPage: 2,
            gap: '1rem'
        }
    }
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
