<template>
    <div
        class="relative rounded border border-gray-300 shadow-sm"
        @click="isReferenceModalOpen = true"
    >
        <UIReferenceModal
            v-model="isReferenceModalOpen"
            :isReferenceModalOpen="isReferenceModalOpen"
            @isReferenceModalOpen="isReferenceModalOpen = $event"
            :elementName="element.name"
        />
        <UIImg
            v-if="!props.isReference"
            class="w-full h-32 object-cover rounded cursor-pointer"
            :src="props.element.name || undefined"
            :alt="props.element.subtitle || undefined"
            :quality="props.quality"
        />
        <h1 v-if="props.isReference" class="p-2">
            {{ props.element.originalFilename }}
        </h1>
        <div
            class="flex justify-between"
            :class="[
                { 'absolute bottom-2 right-2': !isReference },
                { 'p-2': isReference }
            ]"
        >
            <UIIcon
                v-if="props.isReference"
                class="w-7 h-7"
                name="ph:file-pdf"
                title="Identificação"
            />
            <div id="rightSideButtons">
                <UIButton
                    @click="addSubtitle(props.element)"
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
                    @click="deleteMedia(props.element)"
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
    </div>
</template>

<script setup lang="ts">
const isReferenceModalOpen = ref(false);
const props = defineProps({
    isReference: {
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
