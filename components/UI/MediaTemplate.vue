<template>
    <div
        class="relative rounded border border-gray-300 shadow-sm min-h-32"
        @click="isPdfModalOpen = true"
    >
        <UIPdfViewerModal
            v-model="isPdfModalOpen"
            :isPdfModalOpen="isPdfModalOpen"
            @isPdfModalOpen="isPdfModalOpen = $event"
            :elementName="element.name"
            v-if="isPdf"
        />
        <UIImg
            v-else
            class="w-full h-32 object-cover rounded cursor-pointer"
            :src="element.name || undefined"
            :alt="element.subtitle || undefined"
            :quality="quality"
        />
        <div class="h-32 bg-gray-50 bg-opacity-50 flex flex-col justify-between" v-if="isPdf">
            <p class="text-gray-600 text-opacity-80 p-2 line-clamp-2">
                {{  element.originalFilename || 'PDF' }}
            </p>
            <UIIcon
                class="w-16 h-16 text-red-600 text-opacity-80 p-2"
                name="ph:file-pdf"
                :title="element.originalFilename || 'PDF'"
            />
        </div>

        <div
            class="flex justify-between absolute bottom-2 right-2"
        >
            <div id="rightSideButtons">
                <UIButton
                    @click="addSubtitle(element)"
                    padding="p-1"
                    square
                    class="mr-1"
                    size="sm"
                    v-if="!isPdf"
                >
                    <UIIcon
                        name="ph:subtitles"
                        title="Editar legenda"
                        variant="button"
                    />
                </UIButton>
                <UIButton
                    @click="deleteMedia(element)"
                    padding="p-1"
                    square
                    size="sm"
                >
                    <UIIcon
                        name="ph:trash-simple"
                        variant="button"
                    />
                </UIButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const isPdfModalOpen = ref(false);

defineProps({
    isPdf: {
        type: Boolean,
        default: false
    },
    element: {
        type: Object as PropType<ConceptMedia>,
        default: null
    },
    quality: {
        type: Number,
        default: 60
    },
    deleteMedia: {
        type: Function,
        required: true
    },
    addSubtitle: {
        type: Function,
        required: true
    }
});
</script>
