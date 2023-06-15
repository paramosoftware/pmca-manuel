<template>
    <div id="accordion-collapse" class="mt-8" data-accordion="collapse" data-active-classes="text-black"
        data-inactive-classes="text-black">
        <h2 :id="'accordion-collapse-heading-' + id" class="cursor-pointer">
            <button type="button"
                class="flex items-center justify-between w-full mt-4 text-lg uppercase text-red-900 text-left bg-white border border-gray-300 p-2"
                :data-accordion-target="'#accordion-collapse-body-' + id" aria-expanded="false"
                :aria-controls="'accordion-collapse-body-' + id">
                <span>{{ label }}</span>
                <Icon data-accordion-icon class="w-10 rotate-180 text-gray-300" name="ph:caret-down" />
            </button>
        </h2>

        <div :id="'accordion-collapse-body-' + id" class="hidden p-2 border border-gray-300"
            :aria-labelledby="'accordion-collapse-heading-' + id">

            <div class="mb-4 text-right">
                <Button label="ADICIONAR ARQUIVOS" @click="isOpen = true" />
                <UModal v-model="isOpen" :ui="{ width: 'max-w-5xl', rounded: '' }">
                    <UCard :ui="{ rounded: '' }">
                        <template #header>
                            <span class="text-2xl text-black">
                                Upload de arquivos
                            </span>
                        </template>

                        <FormDropzone :entry-id="objectId" />

                    </UCard>
                </UModal>
            </div>

            <div class="grid grid-cols-6 gap-4">
                <div v-for="image in media" :key="image" class="relative">
                    <img class="h-40 max-w-sm" :src="'/' + image.name" />
                    <button class="text-black" @click="deleteMedia(image.id)">
                        <Icon class="absolute top-0 right-0 w-6 h-6 bg-white rounded-full" name="ph:trash-simple" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const isOpen = ref(false)

import { initFlowbite } from 'flowbite'

onMounted(() => {
    initFlowbite();
})

onUpdated(() => {
    initFlowbite();
})

const props = defineProps({
    id: String,
    objectId: {
        type: Number,
        required: true,
    },
    label: String,
    media: {
        type: Array as PropType<Media[]>,
        default: () => []
    }
})


const emit = defineEmits(['remove:media'])

const deleteMedia = async (id: number) => {

    const { data } = await useFetchWithBaseUrl('api/media/' + id, {
        method: 'DELETE'
    })

    if (data) {
        emit('remove:media', data.value)
    }
}
</script>