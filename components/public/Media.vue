<template>
    <div class="container bg-gray-100">
        <Viewer :images="images" @inited="inited" class="viewer">
            <Splide :options="mainOptions" ref="main">
                <SplideSlide
                    v-for="image in images"
                    :key="image"
                    class="items-center flex"
                >
                    <UIImg
                        :src="image"
                        class="flex-none cursor-zoom-in object-cover w-full h-full mx-2"
                        quality="90"
                    />
                </SplideSlide>
            </Splide>
        </Viewer>
        <Splide :options="thumbOptions" ref="thumbs" class="py-2">
            <SplideSlide
                v-for="image in images"
                :key="image"
                class="items-center flex"
            >
                <UIImg
                    :src="image"
                    class="flex-none cursor-pointer object-cover w-full h-full mx-2"
                    quality="90"
                />
            </SplideSlide>
        </Splide>
    </div>
</template>

<script setup lang="ts">
import 'viewerjs/dist/viewer.css';
import '@splidejs/vue-splide/css';
import { component as Viewer } from 'v-viewer';
// @ts-ignore
import { Splide, SplideSlide } from '@splidejs/vue-splide';

defineProps({
    images: {
        type: Array as PropType<string[]>,
        required: true,
        default: () => []
    }
});

const viewer = ref(null);
const main = ref<InstanceType<typeof Splide>>();
const thumbs = ref<InstanceType<typeof Splide>>();

const inited = (viewerInstance: any) => {
    viewer.value = viewerInstance;
};

const mainOptions = {
    type: 'slide',
    perPage: 1,
    perMove: 1,
    gap: '1rem',
    pagination: false,
    focus: 'center',
    breakpoints: {
        640: {
            height: '15rem'
        }
    },
};

const thumbOptions = {
    type: 'slide',
    rewind: true,
    perPage: 5,
    gap: '1rem',
    pagination: false,
    fixedHeight: 70,
    cover: true,
    focus: 'center',
    isNavigation: true,
    updateOnMove: true
};

onMounted(() => {
    const thumbsSplide = thumbs.value?.splide;

    if (thumbsSplide) {
        main.value?.sync(thumbsSplide);
    }
});
</script>
