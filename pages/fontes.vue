<template>
    <PublicPage title="Fontes">
        <div class="flex flex-col justify-left break-all">
            <div class="mt-2">
                <div 
                    v-for="reference in references"
                    :key="reference.id"
                    class="flex flex-row mb-5"
                    v-html="reference.nameRich ?? reference.name"
                ></div>
                <div v-if="references.length === 0" class="text-center text-gray-500 mt-10">
                    Nenhuma fonte encontrada.
                </div>
            </div>
        </div>
    </PublicPage>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

const glossaryStore = useGlossaryStore();
await glossaryStore.fetch(true);
const { id: glossaryId } = storeToRefs(glossaryStore);

const { data, pending, error } = (await useFetchWithBaseUrl(
    `/api/public/reference`,
    {
        params: {
            pageSize: -1,
            where: JSON.stringify({
                glossaryId: glossaryId.value
            })
        }
    }
)) as {
    data: Ref<PaginatedResponse>;
    pending: Ref<boolean>;
    error: Ref<Error | undefined>;
};

const references = ref([]) as Ref<Reference[]>;

if (data.value) {
    references.value = data.value.items as Reference[];
}

</script>

<style scoped>
div :deep(a) {
    color: #1B75D0;
    text-decoration: underline;
}
div :deep(a:hover) {
    color: #155CA2;
}
</style>