<template>
    <embed class="pdf" :src="srcMedia" width="100%" height="100%"/>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();

const placeholderFile = '/placeholder.png';

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
    lazy: {
        type: Boolean,
        default: true
    },
    placeholder: {
        type: Boolean,
        default: false
    }
});

const srcMedia = ref(props.src);

if (props.src) {
    srcMedia.value = `${config.public.baseURL}/api/media/${props.src}`;
} else {
    srcMedia.value = placeholderFile;
}
</script>
