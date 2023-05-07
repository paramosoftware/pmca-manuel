<template>
    <li>
        <a :href="link + entryNameNormalized" class="flex items-center text-black" :class="padding">
            <span class="text-lg p-3 border-l border-red-900 hover:border-l-4">
                {{ entry }}
            </span>
        </a>
    </li>
</template>

<script setup lang="ts">

const props = defineProps({
    entry: {
        type: String,
        required: true
    },
    padding: {
        type: String,
        default: ''
    },
    link: {
        type: String,
        default: '/verbetes/'
    }
})


const entryNameNormalized = props.entry.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, '-');


</script>