<template>
    <div class="flex flex-row md:flex-row mt-5 max-w-full h-auto">
        <div
            class="max-w-full w-full flex flex-col justify-start items-center space-y-8 mb-4"
        >
            <FieldInput
                id="filter"
                class="w-full self-start text-3xl"
                v-model="search"
                type="text"
                placeholder="Pesquisar"
                :disabled="filterDisabled"
                size="lg"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
const conceptStore = useConceptStore();
const { search, total, pending } = storeToRefs(conceptStore);

const filterDisabled = ref(
    search.value === '' && total.value === 0 && !pending.value
);
</script>
