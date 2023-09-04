<template>
    <Splide :has-track="false" :options="options">
        <UITitle id="carousel-heading" class="my-5">
            Verbetes relacionados
        </UITitle>
        <SplideTrack>
            <SplideSlide v-for="entry in entries" :key="entry.id">
                <PublicEntryCard :entry="entry" height="h-36 sm:h-24" titleSize="text-lg" title-padding="p-2"/>
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

<script setup lang="ts">
import { Splide, SplideSlide, SplideTrack } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css';

const props = defineProps({
    entries: {
        type: Array as PropType<Entry[]>,
        required: true
    }
})

const options = ref({
    perPage: 6,
    perMove: 1,
    gap: '1rem',
    pagination: false,
    drag: false,
    breakpoints: {
        640: {
            perPage: 1,
            gap: '1rem',
            arrows: false,
            pagination: true,
            drag: props.entries.length > 1
        },
        768: {
            perPage: 2,
            gap: '1rem',
        },
        1024: {
            perPage: 3,
            gap: '1rem',
        },
        1280: {
            perPage: 4,
            gap: '1rem',
        }
    }
})


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

.splide:not(.is-overflow) .splide__arrows {
    display: none;
}

.splide__pagination {
    bottom: -0.15rem;
}

.splide__pagination__page.is-active {
    background: #aacc4459;
}
</style>
