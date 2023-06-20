<template>
    <div class="container">
        <Viewer :images="images" @inited=inited class="viewer">
            <div class="snap-x w-full overflow-x-auto flex mt-0 sm:mt-0 scrollbar-hide h-60">
                <img v-for="image in images" :src="image" :key="image" class="snap-start p-2 flex-none object-contain">
            </div>
        </Viewer>
    </div>
</template>


<script setup lang="ts">
import 'viewerjs/dist/viewer.css'
import { component as Viewer } from "v-viewer"

defineProps({
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
</script>