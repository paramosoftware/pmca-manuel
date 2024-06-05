<template>
    <PublicPage title="Fontes">
        <div class="flex flex-col justify-left">
            <div class="mt-2">
                <div 
                    v-for="reference in references"
                    :key="reference.id"
                    class="flex flex-row mb-5"
                    v-html="reference.nameRich"
                ></div>
            </div>
        </div>
    </PublicPage>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

const { data, pending, error } = (await useFetchWithBaseUrl(
    `/api/public/reference`,
    {
        params: {
            pageSize: -1
        }
    }
)) as {
    data: Ref<PaginatedResponse>;
    pending: Ref<boolean>;
    error: Ref<Error | undefined>;
};

const references = ref(data.value.items) as Ref<Reference[]>;
</script>

<style scoped>
div>>>a {
    color: #1B75D0;
    text-decoration: underline;
}
div>>>a:hover {
    color: #155CA2
}
</style>