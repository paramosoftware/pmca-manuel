<template>
    <div class="flex flex-col mt-5 border-y border-gray-200 py-5" v-if="total > 0">
        <div
            class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-8"
            ref="grid"
        >
            <div
                v-for="concept in concepts"
                :key="concept.id"
                class="flex md:justify-center items-center"
            >
                <PublicCard
                    :concept="concept"
                    class="flex-grow max-w-md md:max-w-md lg:max-w-xl mx-auto truncate"
                />
            </div>
        </div>
    </div>
    <div
        class="text-xl text-center text-gray-400"
        v-if="search === '' && total === 0 && !pending"
    >
        Nenhum item encontrado
    </div>
</template>

<script setup lang="ts">
const [grid] = useAutoAnimate({ duration: 250 });
const conceptStore = useConceptStore();
const { concepts, search, total, pending } = storeToRefs(conceptStore);
</script>
