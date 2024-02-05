<template>
<UModal v-model="isOpen" @close="closeModal">
    <UCard :ui="{ rounded: '' }">
        <template #header>
            <UICloseButton @click="closeModal" />
            <UITitle>
                {{ title }}
            </UITitle>
        </template>
        
        <UIIcon name="ph:warning" class="h-10 w-10 text-pmca-warning mr-3" />
        {{ message  }}

        <slot />

        <template #footer>
            <div class="flex justify-end">
                <UButton @click="closeModal" class="mr-2">
                    {{ cancelButtonText }}
                </UButton>
                <UButton @click="onConfirm" variant="outline">
                    {{ confirmButtonText }}
                </UButton>
            </div>
        </template>
    </UCard>
</UModal>

</template>


<script setup lang="ts">
const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: 'Confirmação'
    },
    message: {
        type: String,
        default: 'Tem certeza que deseja realizar esta ação?'
    },
    confirmButtonText: {
        type: String,
        default: 'Confirmar'
    },
    cancelButtonText: {
        type: String,
        default: 'Cancelar'
    },
})

const isOpen = ref(false);

watch(() => props.modelValue, (newValue) => {
    isOpen.value = newValue;
})
const emit = defineEmits(['confirm', 'close']);

const closeModal = () => {
    emit('close');
}

const onConfirm = () => {
    emit('confirm');
}
</script>