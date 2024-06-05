<template>
    <div class="sm:flex sm:justify-between sm:items-center">
        <UIPageTitle>
            <PublicBreadcrumb :add-concept-link="userSelection" />
            {{ title }}
        </UIPageTitle>
        <div class="flex justify-end mb-4 mt-4 sm:mt-0 sm:mb-0">
            <span v-if="userSelection" class="flex items-center">
                <UIIcon
                    name="ph:broom"
                    class="ml-3"
                    title="Desmarcar todos"
                    @click="conceptStore.clearSelection()"
                />
                <PublicExportDropdown class="ml-3" />
            </span>
        </div>
    </div>

    <div class="mt-6">
        <div class="flex flex-col md:flex-row mt-5">
            <div class="w-full md:w-1/3">
                <FieldInput
                    id="filter"
                    v-model="search"
                    type="text"
                    :placeholder="placeholder"
                    :disabled="filterDisabled"
                    size="lg"
                />
            </div>
        </div>
        <div
            class="mt-4 md:flex md:flex-row md:justify-between md:items-center"
        >
            <div class="text-md" v-if="total > 0">
                {{ total }}
                {{ total > 1 ? 'itens' : 'item' }} encontrado{{
                    total > 1 ? 's' : ''
                }}
            </div>
            <div class="text-md" v-else-if="total === 0 && search !== ''">
                Nenhum item encontrado
                <span v-if="search !== ''"
                    >para "<i>{{ search.substring(0, 20) }}</i
                    >"</span
                >
            </div>
            <div
                class="flex flex-row items-center justify-between mt-5 md:mt-0"
            >
                <UIIcon
                    class="w-8 h-8 mr-3"
                    :name="
                        sort === 'asc'
                            ? 'ph:sort-ascending'
                            : 'ph:sort-descending'
                    "
                    title="Ordenar por nome"
                    @click="conceptStore.sortByName()"
                    v-if="total > 1"
                />
                <UPagination
                    v-model="page"
                    :total="total"
                    :page-count="pageSize"
                    show-last
                    show-first
                    v-if="total > pageSize"
                />
            </div>
        </div>

        <div class="flex flex-col mt-5 border-t border-gray-200 py-5">
            <div
                class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
                ref="grid"
            >
                <div v-for="concept in concepts" :key="concept.id">
                    <PublicCard :concept="concept" />
                </div>
            </div>
        </div>

        <div class="text-xl" v-if="search === '' && total === 0 && !pending">
            Nenhum termo
            {{ props.userSelection ? 'selecionado' : 'encontrado' }}.
        </div>

        <div
            class="flex flex-row items-center justify-end mt-5"
            v-if="total > pageSize"
        >
            <UPagination
                v-model="page"
                :total="total"
                :page-count="pageSize"
                show-last
                show-first
                size="md"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: 'Termos'
    },
    userSelection: {
        type: Boolean,
        default: false
    },
    hasTree: {
        type: Boolean,
        default: true
    }
});

// TODO: transform the internal search into a filter of the large search
// TODO: filter tree view based on search
// TODO: add transition/animations to page change

const [grid] = useAutoAnimate({ duration: 250 });

const router = useRouter();

const query = computed(() => {
    return router.currentRoute.value.query;
});

const mode = ref(query.value?.modo || 'alfa');

if (!props.hasTree) {
    mode.value = 'alfa';
}

const conceptStore = useConceptStore();
await conceptStore.load('', props.userSelection);
await conceptStore.fetchConceptsTree();

const {
    concepts,
    page,
    pageSize,
    total,
    search,
    pending,
    sort
} = storeToRefs(conceptStore);

search.value = query.value?.search?.toString() || '';

const filterDisabled = ref(
    search.value === '' && total.value === 0 && !pending.value
);

watch(total, () => {
    filterDisabled.value =
        search.value === '' && total.value === 0 && !pending.value;
});

watch(mode, () => {
    page.value = 1;
});

const userSelection = computed(() => {
    return props.userSelection;
});

watch(userSelection, async () => {
    await conceptStore.load('', true);
});

const placeholder = computed(() => {
    return props.userSelection ? 'Filtrar termos' : 'Pesquisar termos';
});

onUnmounted(() => {
    search.value = '';
});
</script>
