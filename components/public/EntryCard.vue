<template>
    <NuxtLink :to="link">
        <div class="max-w-sm w-full lg:max-w-full lg:flex shadow-sm hover:shadow-md">
            <div class="w-full border border-gray-200 rounded-sm flex flex-col justify-between">

                <img :src="thumbnail" :alt="entry.name" class="object-cover w-full rounded-sm" :class="height" />


                <div :class="titlePadding">
                    <UITitle>
                        <span class="text-semibold" :class="titleSize">
                            {{ entry.name }}
                        </span>
                    </UITitle>
                </div>
            </div>
        </div>
    </NuxtLink>
</template>
    
    
<script setup lang="ts">

const props = defineProps({
    entry: {
        type: Object,
        required: true
    },
    height: {
        type: String,
        default: 'h-60'
    },
    titleSize: {
        type: String,
        default: 'text-2xl'
    },
    titlePadding: {
        type: String,
        default: 'p-4'
    }
})

const link = computed(() => {
    return "/verbetes/" + props.entry.code
})


const thumbnail = computed(() => {
    if (props.entry.media.length === 0) {
        return '/placeholder.png'
    }
    return '/' + props.entry.media[0].name
})
</script>
    
    
    