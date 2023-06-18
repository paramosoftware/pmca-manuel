<template>
    <div class="w-full h-full flex items-center justify-between">
        <div>
            <h1 class="text-2xl text-black">{{ object.name }}</h1>
        </div>
        <div>
            <span class="sr-only">Editar {{ singularNamePt }}</span>
            <NuxtLink :to="`/logged/${pluralNamePt}/editar/${object.id}`">
                <Icon name="ph:pencil-simple" class="text-black w-6 h-6 m-1" />
            </NuxtLink>
            <span class="sr-only">Excluir {{ singularNamePt }}</span>
            <Icon name="ph:trash-simple" class="text-black w-6 h-6 m-1" @click="openModal(object.id)" />
        </div>
    </div>
</template>


<script setup lang="ts">

defineProps({
    singularNamePt: {
        type: String,
        required: true
    },
    pluralNamePt: {
        type: String,
        required: true
    },
    object: {
        type: Object as PropType<{ name: string, id: number }>,
        required: true
    },

})

const emit = defineEmits(['openModal']);

const openModal = (id: number) => {
    emit('openModal', id);
}

</script>
