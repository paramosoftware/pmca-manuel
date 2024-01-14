<template>
    <main class="container mb-auto p-2 mx-auto">
        <div class="sm:flex sm:justify-between sm:items-center">
            <UIPageTitle>
                {{ title }}
            </UIPageTitle>
            <div class="flex justify-end mb-4 mt-4 sm:mt-0 sm:mb-0" v-if="hasTree">

                <button @click="mode = 'alfa'">
                    <Icon name="ph:cards" class="mr-3 cursor-pointer" :class="mode === 'alfa' ? 'text-pmca-accent' : ''" />
                </button>

                <button @click="mode = 'hier'">
                    <Icon name="ph:tree-structure" class="cursor-pointer"  :class="mode === 'hier' ? 'text-pmca-accent' : ''" />
                </button>

            </div>
        </div>

        <div v-if="mode === 'hier'">
            <UITreeView :tree="categoriesTree" class="mt-6" />
        </div>

        <div class="mt-6" v-else>
            <div class="flex flex-col md:flex-row mt-5">
                <div class="w-full md:w-1/3">
                    <FieldInput id="filter" v-model="search" type="text" :placeholder="placeholder" :disabled="filterDisabled" />
                </div>
            </div>
            <div class="mt-4 md:flex md:flex-row md:justify-between md:items-center">
                <div class="text-md" v-if="total > 0">
                    {{ total }} {{ total > 1 ? 'itens' : 'item' }} encontrado{{ total > 1 ? 's' : '' }}
                </div>
                <div class="text-md" v-else-if="total === 0 && search !== ''">
                    Nenhum item encontrado
                    <span v-if="search !== ''">para "<i>{{ search.substring(0, 20) }}</i>"</span>
                </div>
                <div class="flex flex-row items-center justify-between mt-5 md:mt-0">
                    <button @click="entryStore.sortByName()" class="mr-3" v-if="total > 0">
                        <Icon class="w-8 h-8" :name="sort === 'asc' ? 'ph:sort-ascending' : 'ph:sort-descending'" />
                    </button>
                    <UPagination v-model="page" :total="total" :page-count="pageSize" show-last show-first size="md" v-if="total > pageSize" />
                </div>
            </div>

            <div class="flex flex-col mt-5 border-t border-gray-200 py-5">
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    <div v-for="entry in entries" :key="entry.id">
                        <PublicEntryCard :entry="entry" />
                    </div>
                </div>
            </div>

            <div class="flex flex-row items-center justify-end mt-5" v-if="total > pageSize">
                <UPagination v-model="page" :total="total" :page-count="pageSize" show-last show-first size="md"  />
            </div>
                    
        </div>
    </main>
</template>
       
<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: 'Verbetes'
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

const router = useRouter();

const query = computed(() => {
    return router.currentRoute.value.query;
});

const mode = ref(query.value?.modo || 'alfa');

if (!props.hasTree) {
    mode.value = 'alfa';
}

const entryStore = useEntryStore();
await entryStore.load('', props.userSelection);
await entryStore.fetchCategoriesTree();

const { entries, page, pageSize, total, search, pending, sort, error, categoriesTree } = storeToRefs(entryStore);

search.value = query.value?.search?.toString() || '';

const filterDisabled = ref(false);

watch(total, () => {
    filterDisabled.value = search.value === '' && total.value === 0 && !pending.value;
});

watch(mode, () => {
    page.value = 1;
});

const placeholder = computed(() => {
    return props.userSelection ? 'Filtrar verbetes' : 'Pesquisar verbetes';
});
</script>
      