<template>
    <NuxtImg
        :src="srcImg"
        :alt="alt"
        :class="class"
        :width="width"
        :height="height"
        :quality="quality"
        :loading="lazy ? 'lazy' : 'eager'"
        :format="format"
        :placeholder="placeholder"
    />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();

const props = defineProps({
    src: {
        type: String,
        required: false,
        default: ''
    },
    alt: {
        type: String,
        required: false,
        default: ''
    },
    class: {
        type: String,
        default: ''
    },
    format: {
        type: String,
        default: 'webp'
    },
    width: {
        type: String,
        default: '100%'
    },
    height: {
        type: String,
        default: '100%'
    },
    quality: {
        type: String,
        default: '80'
    },
    lazy: {
        type: Boolean,
        default: true
    },
    placeholder: {
        type: Boolean,
        default: false
    }
});

const srcImg = ref(props.src);

if (props.src) {
    srcImg.value = `${config.public.baseURL}/api/media/${props.src}`;
} else {
    srcImg.value = '/placeholder.png';
}
</script>
