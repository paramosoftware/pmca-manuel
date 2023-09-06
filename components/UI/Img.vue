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

if (props.src) {

    const pathImg = '/media/' + props.src

    if (useIsElectron()) {
        srcImg.value = 'app://' + pathImg
    } else {
        srcImg.value = pathImg
    }
    
} else {
    srcImg.value = '/placeholder.png'
}


</script>