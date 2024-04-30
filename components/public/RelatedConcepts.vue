<template>
    <Splide :has-track="false" :options="options" v-if="concepts.length > 0">
        <UITitle id="carousel-heading" class="my-5">
            {{ title }}
        </UITitle>
        <SplideTrack>
            <SplideSlide v-for="concept in concepts" :key="concept.id">
                <PublicCard
                    :concept="concept"
                    height="h-36 sm:h-24"
                    titleSize="text-lg"
                    title-padding="p-2"
                />
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
</template>

<script setup lang="ts">
// @ts-ignore
import { Splide, SplideSlide, SplideTrack } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    concepts: {
        type: Array as PropType<Concept[]>,
        required: true,
        default: []
    },
    oppositeSide: {
        type: Array as PropType<Concept[]>,
        default: []
    }
});

const concepts = computed(() => {
    return props.concepts.concat(props.oppositeSide);
});

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
            drag: props.concepts.length > 1
        },
        768: {
            perPage: 2,
            gap: '1rem'
        },
        1024: {
            perPage: 3,
            gap: '1rem'
        },
        1280: {
            perPage: 4,
            gap: '1rem'
        }
    }
});
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
