<template>
<UModal v-model="isModalDeleteOpen">
    <UCard :ui="{ rounded: '' }">
        <template #header>
            <span class="text-2xl text-black">
                Excluir {{ singularNamePt }}
            </span>
        </template>

        <p>Você tem certeza que deseja excluir?</p>

        <template #footer>
            <div class="flex flex-row justify-end items-center">
                <Button @click="closeModal">CANCELAR</Button>
                <Button @click="deleteObject(objectIdToDelete)" class="ml-2">EXCLUIR</Button>
            </div>
        </template>
    </UCard>
</UModal>

</template>


<script setup lang="ts">

const props = defineProps({
    pluralName: {
        type: String,
        required: true,
    },
    singularNamePt: {
        type: String,
    },
    pluralNamePt: {
        type: String,
    },
    objectIdToDelete: {
        type: Number,
        required: true
    },
    modelValue: {
        type: Boolean,
        required: true
    }
})

const isModalDeleteOpen = ref(false);

watch(() => props.modelValue, (newValue) => {
    isModalDeleteOpen.value = newValue;
})


const emit = defineEmits(['delete', 'update:modelValue']);

const closeModal = () => {
    emit('update:modelValue', false);
}


const deleteObject = async (id: number) => {
    const { data } = await useFetchWithBaseUrl(`/api/${props.pluralName}/${id}`, {
        method: 'DELETE'
    });

    if (data) {
        emit('delete', id);
        closeModal();
    }
}

</script>