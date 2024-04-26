<template>
    <div class="mt-8" v-if="itemId">
        <h2 class="cursor-pointer" @click="isOpenAccordion = !isOpenAccordion">
            <button
                type="button"
                class="flex items-center justify-between w-full mt-4 text-lg text-pmca-secondary first-letter:uppercase text-left bg-white border border-gray-300 p-2"
            >
                <span>
                    {{ label }}
                    <span class="text-sm text-gray-400" v-if="media.length">
                        ({{ media.length }} arquivo{{
                            media.length > 1 ? 's' : ''
                        }})
                    </span>
                </span>

                <UIIcon
                    class="w-10 text-gray-300"
                    :name="isOpenAccordion ? 'ph:caret-up' : 'ph:caret-down'"
                />
            </button>
        </h2>

        <div class="p-2 border border-gray-300" v-show="isOpenAccordion">
            <div class="mb-4 text-right">
                <UIButton @click="isOpen = true">
                    <UIIcon name="ph:plus-circle" class="w-5 h-5" />
                    Adicionar arquivos
                </UIButton>
                <UModal
                    v-model="isOpen"
                    :id="id + '-modal'"
                    :ui="{
                        padding: 'p-0',
                        width: 'sm:max-w-5xl',
                        container: 'items-center'
                    }"
                >
                    <UCard>
                        <template #header>
                            <UICloseButton @click="isOpen = false" />

                            <UITitle> Upload de arquivos </UITitle>
                        </template>

                        <FieldDropzone
                            @update="addMedia"
                            @close="isOpen = false"
                            :url="url"
                        />
                    </UCard>
                </UModal>
            </div>

            <Viewer
                :images="media"
                @inited="inited"
                class="viewer"
                @show="changeQuality"
            >
                <draggable
                    class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    :list="media"
                    @end="updateMediaPosition"
                    :animation="200"
                    item-key="id"
                >
                    <template #item="{ element }">
                        <div class="relative">
                            <UIImg
                                class="w-full h-32 object-cover rounded cursor-pointer"
                                :src="element.name"
                                :alt="element.subtitle"
                                :quality="quality"
                            />
                            <div class="absolute top-0 right-0">
                                <UIButton
                                    @click="addSubtitle(element)"
                                    padding="p-1"
                                    square
                                    class="mr-1"
                                >
                                    <UIIcon
                                        class="w-4 h-4"
                                        name="ph:subtitles"
                                        title="Editar legenda"
                                    />
                                </UIButton>
                                <UIButton
                                    @click="deleteMedia(element)"
                                    padding="p-1"
                                    square
                                >
                                    <UIIcon
                                        class="w-4 h-4"
                                        name="ph:trash-simple"
                                        title="Excluir"
                                    />
                                </UIButton>
                            </div>
                        </div>
                    </template>
                </draggable>
            </Viewer>
        </div>
    </div>
    <UModal
        v-model="modalSubtitleIsOpen"
        :id="id + 'subtitle-modal'"
        :ui="{
            padding: 'p-0',
            width: 'sm:max-w-3xl',
            container: 'items-center'
        }"
    >
        <UCard>
            <UICloseButton @click="closeSubtitleModal" />

            <FieldTextarea
                :id="id + '-subtitle'"
                label="Legenda"
                v-model="subtitle"
            />

            <div class="text-end">
                <UIButton label="Salvar" @click="saveSubtitle" class="mt-4" />
            </div>
        </UCard>
    </UModal>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import 'viewerjs/dist/viewer.css';
import { component as Viewer } from 'v-viewer';

const viewer = ref(null);

const inited = (viewerInstance: any) => {
    viewer.value = viewerInstance;
};

const quality = ref(60);

function changeQuality() {
    quality.value = 100;
}

const isOpen = ref(false);
const isOpenAccordion = ref(false);
const modalSubtitleIsOpen = ref(false);
const subtitleMediaId = ref(0);
const subtitle = ref('');

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    modelValue: {
        type: Array as PropType<EntryMedia[]>,
        default: []
    },
    label: {
        type: String,
        default: ''
    },
    itemId: {
        type: Number,
        default: 0
    },
    url: {
        type: String
    },
    formStore: {
        type: Object as PropType<FormStore>
    }
});

const emit = defineEmits(['update:modelValue']);

const label = getFormFieldConfig('label', '', props);
let modelValue = getFormFieldConfig('modelValue', [], props);
let itemId = getFormFieldConfig('itemId', 0, props);

if (props.formStore) {
    itemId = computed(() => props.formStore?.getId());
}

const url = computed(() => {
    return props.url
        ? props.url
        : `/api/${props.formStore?.model}/${itemId.value}/upload`;
});

const media = computed(() => {
    if (props.formStore) {
        modelValue = computed(() => props.formStore?.getFieldData(props.id));
    }

    if (!modelValue.value) {
        return [];
    }

    return Array.isArray(modelValue.value)
        ? modelValue.value
        : [modelValue.value];
});

const deleteMedia = async (media: EntryMedia) => {
    if (props.formStore) {
        props.formStore.removeFieldData(props.id, media as unknown as Item);
    }
    emit('update:modelValue', media);
    updateMediaPosition({ oldIndex: 0, newIndex: 1 });
};

const addMedia = (media: EntryMedia) => {
    if (props.formStore) {
        props.formStore.addFieldData(props.id, media as unknown as Item);
    }
    emit('update:modelValue', media);
    updateMediaPosition({ oldIndex: 0, newIndex: 1 });
};

const updateMediaPosition = (event: any) => {
    if (event.oldIndex !== event.newIndex) {
        const media = modelValue.value;

        media.map((item: EntryMedia, index: number) => {
            item.position = index + 1;
            // @ts-ignore
            item._action_ = 'update';
        });

        if (props.formStore) {
            props.formStore.setFieldData(props.id, media);
        }

        emit('update:modelValue', media);
    }
};

const addSubtitle = (media: EntryMedia) => {
    modalSubtitleIsOpen.value = true;
    subtitle.value = media.subtitle || '';
    subtitleMediaId.value = media.id;
};

const closeSubtitleModal = () => {
    subtitle.value = '';
    subtitleMediaId.value = 0;
    modalSubtitleIsOpen.value = false;
};

const saveSubtitle = () => {
    modalSubtitleIsOpen.value = false;
    const media = modelValue.value;

    media.map((item: EntryMedia) => {
        if (item.id === subtitleMediaId.value) {
            item.subtitle = subtitle.value;
            // @ts-ignore
            item._action_ = 'update';
        }
    });

    if (props.formStore) {
        props.formStore.setFieldData(props.id, media);
    }

    updateMediaPosition({ oldIndex: 0, newIndex: 1 });

    closeSubtitleModal();
};
</script>
