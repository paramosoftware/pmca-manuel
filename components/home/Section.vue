<template>
    <section :id="title.toLowerCase()">
        <div class="container w-full lg:max-w-full lg:flex bg-gray-100">
            <div class="w-full rounded-sm px-10 py-6 flex flex-col justify-between">
                <div class="mb-8">
                    <UITitle>
                        <span class="text-semibold text-4xl">
                            {{ title }}
                        </span>
                    </UITitle>
                </div>

                <div class="flex flex-col justify-between">
                    <div class="mb-8">
                        <slot />
                    </div>
                </div>

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