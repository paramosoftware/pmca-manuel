<template>
    <div class="flex flex-col mt-5 border-y border-gray-200 py-5" v-if="total > 0">
        <div
            class="flex flex-row gap-5 flex-wrap justify-center items-center"
            ref="grid"
        >
            <div
                v-for="concept in concepts"
                :key="concept.id"
            >
                <PublicCard 
                :concept="concept"
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
