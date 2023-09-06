<template>
    <div class="w-full h-full flex items-center justify-between">
        <NuxtLink :to="editUrl">
            <h1 v-if="isHtml" v-html="object.name"></h1>
            <h1 v-else>{{ object.name }}</h1>
        </NuxtLink>
        <div>
            <span class="sr-only">Editar {{ label }}</span>
            <NuxtLink :to="editUrl">
                <Icon name="ph:pencil-simple" class="w-6 h-6 m-1" />
            </NuxtLink>
            <span class="sr-only">Excluir {{ label }}</span>
            <Icon name="ph:trash-simple" class="w-6 h-6 m-1 cursor-pointer" @click="openModal(object.id)" />
        </div>
    </div>
</template>


<script setup lang="ts">
import { ROUTES } from '~/config';
const props = defineProps({
    label: {
        type: String,
        required: true
    },
    labelPlural: {
        type: String,
        required: true
    },
    urlPath: {
        type: String,
        required: true
    },
    object: {
        type: Object as PropType<{ name: string, id: number }>,
        required: true
    },
    isHtml: {
        type: Boolean,
        default: false
    }
})

const editUrl = computed(() => {
    return ROUTES.edit + props.urlPath + '/' + props.object.id;
})

const emit = defineEmits(['openModal']);

const openModal = (id: number) => {
    emit('openModal', id);
}

</script>
