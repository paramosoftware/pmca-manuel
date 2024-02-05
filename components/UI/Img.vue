<template>
    <img :src="srcImg" :alt="alt" :class="class" />
</template>

<script setup lang="ts">
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
    }
})


const srcImg = ref(props.src);


if (isElectron() && props.src) {
    srcImg.value = 'app://' + props.src;
} else if (props.src) {
    srcImg.value = '/api/media/' + props.src;
} else {
    srcImg.value = '/placeholder.png';
}

</script>