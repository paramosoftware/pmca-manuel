<template>
    <div class="flex flex-col mt-4">
        <p class="text-lg uppercase text-red-900">{{ title }}</p>
        <div class="flex flex-col">

            <p class="text-xl text-black">
                <span v-if="Array.isArray(content)">
                    <span v-for="item in content" :key="item.name">
                        <NuxtLink v-if="hasLink && !isOneLine" class="hover:underline" :to="item.link">
                            {{ item.name }}
                        </NuxtLink>
                        <span v-else-if="!isOneLine">{{ item.name }}</span>
                        <span v-if="!isOneLine && content.indexOf(item) !== content.length - 1"> | </span>

                        <p v-if="isOneLine" class="text-xl text-black">
                            <div v-if="isHtml" v-html="item.name" class="mb-2"></div>
                        </p>
                    </span>
                </span>

                <div v-else-if="isHtml" v-html="content"></div>

                <span v-else>{{ content }}</span>
            </p>
        </div>
    </div>
</template>
  
<script setup lang="ts">
defineProps({
    title: {
        type: String,
        required: true
    },
    content: {
        type: [String, Array, Object],
    },
    isHtml: {
        type: Boolean,
        default: false
    },
    hasLink: {
        type: Boolean,
        default: false
    },
    isOneLine: {
        type: Boolean,
        default: false
    }
})
</script>