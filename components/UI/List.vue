<template>
    <div class="flex flex-col justify-center items-center mt-5 mb-auto">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral rounded-sm">
            <div class="flex flex-row justify-start items-center">
                <UIAnchorReturn :href=ROUTES.restricted />
            </div>

            <div class="justify-between flex flex-row items-center my-4">
                <h1 class="text-4xl first-letter:uppercase">{{ labelPlural }}</h1>
                <NuxtLink :to="createUrl">
                    <UIButton>{{ genderNoun === 'f' ? 'Nova' : 'Novo' }}</UIButton>
                </NuxtLink>
            </div>

            <div class="mt-4">
                <FieldInput 
                    label="Filtrar" 
                    v-model="filter" 
                    @input="filteredObjects" 
                    id="filter"
                    type="text"
                    :placeholder="'Filtrar ' + labelPlural" />
            </div>

            <div v-for="object in filteredObjects" :key="object.id" class="w-full py-4 border-b border-pmca-accent last:border-b-0">

                <UIListCard 
                    :object="object" 
                    :label="label"
                    :label-plural="labelPlural"
                    @open-modal="openModalDelete"
                    :url-path="urlPath"
                    :is-html="isHtml"
                    />
            </div>

            <UIListModalDelete  
                :object-name-plural="objectNamePlural"
                :label="label"
                :label-plural="labelPlural"
                v-model="isModalDeleteOpen"
                :object-id-to-delete="objectIdToDelete"
                @delete="removeFromList"
             />


        </div>
    </div>
</template>

<script setup lang="ts">
import { ROUTES } from '~/config';

const props = defineProps({
    objectName: {
        type: String,
        required: true,
    },
    objectNamePlural: {
        type: String,
        required: true,
    },
    genderNoun: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
        default: 'Objeto'
    },
    labelPlural: {
        type: String,
        required: true,
        default: 'Objetos'
    },
    urlPath: {
        type: String,
        required: true
    },
    isHtml: {
        type: Boolean,
        default: false
    }
});

const createUrl = computed(() => {
    return ROUTES.create + props.urlPath;
});


const isModalDeleteOpen = ref(false);
const objectIdToDelete = ref(0);
const filter = ref('')
const { data } = await useFetchWithBaseUrl('/api/' + props.objectNamePlural);

const objects = ref<{ id: number, name: string }[]>(data.value as { id: number, name: string }[]);

const removeFromList = (id: number) => {
    objects.value = objects.value.filter(object => object.id !== id);
}

const openModalDelete = (id: number) => {
    isModalDeleteOpen.value = true;
    objectIdToDelete.value = id;
}


const filteredObjects = computed(() => {
    if (!filter.value) {
        return objects.value;
    }

    const normalizedFilterValue = filter.value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    return objects.value.filter(object =>
        object.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes(normalizedFilterValue)
    );
});


</script>