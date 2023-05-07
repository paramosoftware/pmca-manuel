<template>
    <div class="snap-x w-full overflow-x-scroll flex mt-0 sm:mt-0 scrollbar-hide">
        <div v-for="img in imgs" :key="img" class="snap-start p-2 flex-none">
            <img :src="img" />
        </div>
    </div>
</template>


<script setup lang="ts">

// TODO: hardcoded while media is not implemented

const imgs = [
    "https://picsum.photos/id/24/300/200",
    "https://picsum.photos/id/403/300/200",
    "https://picsum.photos/id/444/300/200",
]

</script>