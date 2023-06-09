<template>
    <section :id="title.toLowerCase()" class="bg-neutral-100 container max-w-screen-xl mx-auto p-5">
        <div class="flex flex-col md:flex-row h-full pt-10">
            <div class="w-full md:w-1/5 h-full">
                <div class="flex flex-col justify-start h-full">
                    <h1 class="text-4xl text-black mb-5 first-letter:uppercase">{{ title }}</h1>
                </div>
            </div>
            <div class="w-full md:w-4/5 h-full">
                <slot />
            </div>
        </div>
    </section>
</template>


<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true
    }
})
</script>