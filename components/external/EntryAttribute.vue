<template>
    <div class="flex flex-col mt-4">
        <p class="text-lg uppercase text-red-900">{{ title }}</p>
        <div class="flex flex-col">

            <p class="text-xl text-black">
                <span v-if="Array.isArray(content)">
                    <span v-for="item in content" :key="item.name">
                        <a  class="hover:underline"  :href="item.link">{{ item.name }}</a> 
                        <span v-if="content.indexOf(item) !== content.length - 1"> | </span>
                    </span>
                </span>
                <span v-else>
                    {{ content }}
                </span>
            </p>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { defineProps } from 'vue'

defineProps({
    title: {
        type: String,
        required: true
    },
    content: {
        // TODO: make this a type
        type: [String, Array],
    }
})
</script>