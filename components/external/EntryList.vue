<template>
    <div class="w-full py-4 border-b last:border-b-0 border-red-900">
        <a :href="link" class="w-full h-full flex items-center justify-between">
            <div>
                <span v-if="entry.category != null && showCategory">
                    <p class="text-red-900 text-md uppercase">{{ entry.category.name }}</p>
                </span>
                <h1 class="text-3xl text-black">{{ entry.name }}</h1>
                <p class="text-xl text-black mt-4">
                    <span v-if="entry.translations > 0">
                        <span v-for="translation in entry.translations" :key="translation.id">
                            <p>{{ translation.name }} ({{ translation.code }})</p>
                            <span v-if="translation != entry.translations[entry.translations.length - 1]"> | </span>
                        </span>
                    </span>
                </p>
                <p class="text-md text-gray-500">
                    {{ entry.definition?.length > 130 ? entry.definition.substring(0, 130) + '...' : entry.definition }}
                </p>
            </div>
            <div class="">
                <Icon name="ph:arrow-right" class="text-9xl text-black w-20" />
            </div>
        </a>
    </div>
</template>


<script setup lang="ts">

const props = defineProps({
    entry: {
        type: Object,
        required: true
    },
    showCategory: {
        type: Boolean,
        default: true
    }
})

const link = computed(() => {
    return "/verbetes/" + props.entry.code
})


</script>