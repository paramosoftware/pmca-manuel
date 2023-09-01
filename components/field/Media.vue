<template>
    <div class="mt-8">
        <h2 class="cursor-pointer"  @click="isOpenAccordion = !isOpenAccordion">
            <button type="button"
                class="flex items-center justify-between w-full mt-4 text-lg text-pmca-secondary first-letter:uppercase text-left bg-white border border-gray-300 p-2">
                <span>
                    {{ label }}
                    <span class="text-sm text-gray-400" v-if="media.length">
                        ({{ media.length }} 
                        arquivo{{ media.length > 1 ? 's' : '' }})
                    </span>
                </span>

                <Icon class="w-10 text-gray-300" :name="isOpenAccordion ? 'ph:caret-up' : 'ph:caret-down'" />
            </button>
        </h2>

        <div class="p-2 border border-gray-300" v-show="isOpenAccordion">
            <div class="mb-4 text-right">
                <UIButton label="ADICIONAR ARQUIVOS" @click="isOpen = true" />
                <UModal v-model="isOpen" :ui="{ width: 'max-w-5xl', rounded: '' }">
                    <UCard :ui="{ rounded: '' }">
                        <template #header>
                            <span class="text-2xl text-black">
                                Upload de arquivos
                            </span>
                        </template>

                        <FieldDropzone :id="id" :entry-id="objectId" @update="addMedia" />

                    </UCard>
                </UModal>
            </div>

            <div class="grid grid-cols-6 gap-4">
                <div v-for="image in media" :key="image.id" class="relative">
                    <UIImg class="w-full h-32 object-cover rounded" :src="image.name" />
                    <button type="button" class="text-black" @click="deleteMedia(image.id)">
                        <Icon class="absolute top-0 right-0 w-6 h-6 bg-white rounded-full" name="ph:trash-simple" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const isOpen = ref(false)
const isOpenAccordion = ref(false)

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
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


const emit = defineEmits(['update'])

const deleteMedia = async (id: number) => {

    const { data } = await useFetchWithBaseUrl('api/media/' + id, {
        method: 'DELETE'
    })

    if (data) {
        emit('update', props.id, 'remove', data.value)
    }
}

const addMedia = (media: Media) => {
    emit('update', props.id, 'add', media)
}
</script>