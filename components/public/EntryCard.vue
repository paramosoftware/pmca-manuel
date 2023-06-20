<template>
    <NuxtLink :to="link">
        <div class="max-w-sm w-full lg:max-w-full lg:flex shadow-md hover:shadow-lg">
        <div class="w-full border border-gray-200 rounded-sm p-4 flex flex-col justify-between">
            <div class="mb-8">
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
    </script>
    
    
    