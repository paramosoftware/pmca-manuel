<template>
    <UModal
        :ui="{
            padding: 'p-0',
            width: 'sm:max-w-4xl',
            height: 'h-auto',
            container: 'items-center'
        }"
    >
        <div
            id="modalWrapper"
            class="flex h-[80vh] w-full justify-center bg-white-500"
        >
            <div
                class="flex flex-col h-full w-full max-w-full items-center justify-center"
            >
                <UCard
                    class="w-full rounded-tl-sm rounded-tr-sm rounded-bl-none rounded-br-none"
                >
                    <template #header>
                        <UICloseButton @click="closeModal()" />
                        <UITitle> Visualização de PDF </UITitle>
                    </template>
                </UCard>
                <div id="pdfContainer" class="w-full h-full p-4">
                    <UIPdf :src="props.elementName" />
                </div>
            </div>
        </div>
    </UModal>
</template>

<script setup lang="ts">
const props = defineProps({
    isReferenceModalOpen: {
        type: Boolean,
        default: false
    },
    elementName: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:isReferenceModalOpen']);
const closeModal = () => {
    emit('update:isReferenceModalOpen', false);
};
</script>
