<template>
    <Splide :has-track="false" :options="options" v-if="concepts.length > 0">
        <UITitle id="carousel-heading" class="mb-5">
            {{ title }}
        </UITitle>
        <SplideTrack>
            <SplideSlide v-for="concept in concepts" :key="concept.id">
                <PublicCard
                    :concept="concept"
                    height="h-20"
                    titleSize="text-sm"
                    icon-size="w-6 h-6"
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
    perPage: 4,
    perMove: 1,
    gap: '1rem',
    drag: concepts.value.length > 4,
    breakpoints: {
        768: {
            perPage: 2,
            drag: concepts.value.length > 2
        },
        1400: {
            perPage: 3,
            drag: concepts.value.length > 3
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
    bottom: -20px;
}

.splide__pagination__page.is-active {
    background: #aacc4459;
}
</style>
