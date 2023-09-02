<template>
<UModal v-model="isModalDeleteOpen" @close="closeModal">
    <UCard :ui="{ rounded: '' }">
        <template #header>
            <UICloseButton @click="closeModal" />
            <UITitle>
                Excluir {{ singularNamePt }}
            </UITitle>
        </template>

        <p>Tem certeza que deseja excluir?</p>

        <template #footer>
            <div class="flex flex-row justify-end items-center">
                <UIButton @click="deleteObject(objectIdToDelete)" class="ml-2">Excluir</UIButton>
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


const toast = useToast()
const emit = defineEmits(['delete', 'update:modelValue']);

const closeModal = () => {
    emit('update:modelValue', false);
}


const deleteObject = async (id: number) => {
    const { data, error } = await useFetchWithBaseUrl(`/api/${props.pluralName}/${id}`, {
        method: 'DELETE'
    });


    if (error.value) {
        toast.add({ 
            title: 'Aconteceu algum problema ao excluir ' + props.singularNamePt,
            ui: { rounded: 'rounded-sm', padding: 'p-5' }
        })

        return;
    }


    if (data.value) {

        toast.add({ 
            title: 'Exclusão realizada com sucesso.',
            ui: { rounded: 'rounded-sm', padding: 'p-5' }
        })

        emit('delete', id);
        closeModal();
    }
}

</script>