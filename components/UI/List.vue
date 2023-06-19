<template>
    <ExternalNavbar />
    
    <div class="flex flex-col justify-center items-center mt-10">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <div class="flex flex-row justify-start items-center">
                <UIAnchorReturn href="/logged" />
            </div>

            <div class="justify-between flex flex-row items-center my-4">
                <h1 class="text-3xl text-black first-letter:uppercase">{{ pluralNamePt }}</h1>
                <NuxtLink :to="'/logged/' + urlPath + '/criar'">
                    <UIButton>{{ genderNoun === 'f' ? 'NOVA' : 'NOVO' }}</UIButton>
                </NuxtLink>
            </div>

            <div class="mt-4">
                <FieldInput 
                    label="Filtrar" 
                    v-model="filter" 
                    @input="filteredObjects" 
                    id="filter"
                    type="text"
                    :placeholder="'Filtrar ' + pluralNamePt" />
            </div>

            <div v-for="object in filteredObjects" :key="object.id" class="w-full py-4 border-b border-red-900 last:border-b-0">

                <UIListCard 
                    :object="object" 
                    :singular-name-pt="singularNamePt"
                    :plural-name-pt="pluralNamePt"
                    @open-modal="openModalDelete"
                    :url-path="urlPath"
                    :is-html="isHtml"
                    />
            </div>

            <UIListModalDelete  
                :plural-name="pluralName"
                :singular-name-pt="singularNamePt"
                :plural-name-pt="pluralNamePt"
                v-model="isModalDeleteOpen"
                :object-id-to-delete="objectIdToDelete"
                @delete="removeFromList"
             />


        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    genderNoun: {
        type: String,
        required: true,
    },
    singularName: {
        type: String,
        required: true,
    },
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
    urlPath: {
        type: String
    },
    isHtml: {
        type: Boolean,
        default: false
    }
});


const isModalDeleteOpen = ref(false);
const objectIdToDelete = ref(0);
const objects = ref<{ id: number, name: string }[]>([]);
const filter = ref('')
const { data } = await useFetchWithBaseUrl('/api/' + props.pluralName);

objects.value = data.value;

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

    return objects.value.filter(object => object.name.toLowerCase().includes(filter.value.toLowerCase()));
});


</script>