<template>
    <div class="my-5">
        <FieldInput
            id="filter"
            v-model="search"
            type="text"
            placeholder="Pesquisar"
            :disabled="filterDisabled"
            size="lg"
        />
    </div>
</template>

<script setup lang="ts">
const conceptStore = useConceptStore();
const { search, total, pending } = storeToRefs(conceptStore);

const route = useRoute()
const router = useRouter()

onMounted(async () => {
   if (route.query.search) {
       search.value = route.query.search as string;
   }

    watch(search, () => {
        router.push({ query: {}});
    },
    { once: true }
    );
});

const filterDisabled = ref(
    search.value === '' && total.value === 0 && !pending.value
);
</script>
