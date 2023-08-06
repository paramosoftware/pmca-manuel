<template>
    <NuxtLink :to="link">
        <div class="max-w-sm w-full lg:max-w-full lg:flex shadow-sm hover:shadow-md">
            <div class="w-full border border-gray-200 rounded-sm p-4 flex flex-col justify-between">
                <div class="flex justify-center">
                    <img :src="thumbnail" :alt="entry.name" class="w-72 h-64 object-cover shadow-sm rounded-sm">
                </div>

                <div class="mt-4">
                <UITitle>
                    <span class="text-semibold text-2xl">
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
    
    
    