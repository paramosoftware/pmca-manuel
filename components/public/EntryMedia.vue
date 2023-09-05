<template>
    <div class="container">
        <Viewer :images="images" @inited=inited class="viewer">
            <Splide :options="options">
                <SplideSlide v-for="image in images" :key="image" class="items-center flex">
                    <UIImg :src="image" class="flex-none object-contain" />
                </SplideSlide>
            </Splide>
        </Viewer>
    </div>
</template>

<script setup lang="ts">
import 'viewerjs/dist/viewer.css'
import '@splidejs/vue-splide/css';
import { component as Viewer } from "v-viewer"
import { Splide, SplideSlide } from '@splidejs/vue-splide';

const props = defineProps({
    images: {
        type: Array,
        required: true,
        default: () => []
    }
})

const viewer = ref(null)

const inited = (viewerInstance) => {
    viewer.value = viewerInstance
}

const options = {
    type: 'slide',
    perPage: 5,
    perMove: 1,
    gap: '1rem',
    pagination: false,
    height: '20rem',
    drag: props.images.length > 5,
    breakpoints: {
        640: {
            perPage: 1,
            gap: '1rem',
            arrows: false,
            pagination: true,
            drag: props.images.length > 1
        },
        768: {
            perPage: 2,
            gap: '1rem',
            drag: props.images.length > 2
        },
        1024: {
            perPage: 3,
            gap: '1rem',
            drag: props.images.length > 3
        },
    },
};

</script>