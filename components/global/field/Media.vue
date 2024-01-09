<template>
    <div class="mt-8">
        <h2 class="cursor-pointer" @click="isOpenAccordion = !isOpenAccordion">
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
                            <UICloseButton @click="isOpen = false" />

                            <UITitle>
                                Upload de arquivos
                            </UITitle>
                        </template>

                        <FieldDropzone @update="addMedia" @close="isOpen = false" />

                    </UCard>
                </UModal>
            </div>

            <draggable class="grid grid-cols-6 gap-4" :list="media" @end="updateMediaPosition" :animation="200"
                item-key="id">
                <template #item="{ element }">
                    <div class="relative">
                        <UIImg class="w-full h-32 object-cover rounded" :src="element.media.name" />
                        <div class="absolute top-0 right-0">
                            <UIButton @click="deleteMedia(element)" padding="p-1">
                                <Icon class="w-4 h-4" name="ph:trash-simple" />
                            </UIButton>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>
    </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';

const isOpen = ref(false)
const isOpenAccordion = ref(false)

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    options: {
        type: Object as PropType<FormField>,
        required: true
    }
});

const formStore = useFormStore();

const label = props.options.label ?? '';

const media = computed(() => {
    if (!formStore.getFieldData(props.id)) {
        formStore.setFieldData(props.id, []);
    }
    
    return formStore.getFieldData(props.id) as EntryMedia[];
});

const deleteMedia = async (media: EntryMedia) => {
    formStore.removeFieldData(props.id, media);
    updateMediaPosition({ oldIndex: 0, newIndex: 1 })
}

const addMedia = (media: EntryMedia) => {
    formStore.addFieldData(props.id, media);
    updateMediaPosition({ oldIndex: 0, newIndex: 1 })
}

const updateMediaPosition = (event: any) => {
    if (event.oldIndex !== event.newIndex) {
        const media = formStore.getFieldData(props.id) as EntryMedia[];
        media.map((item, index) => {
            item.position = index + 1;
        });

        formStore.setFieldData(props.id, media);
    }
}

</script>