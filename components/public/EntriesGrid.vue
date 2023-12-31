<template>
    <NuxtLayout name="public">
        <main class="container mb-auto p-2 mx-auto">
            <div class="flex items-center justify-between">
                <div class="flex flex-col">
                    <UIPageTitle>{{ title }}</UIPageTitle>
                </div>
            </div>

            <div class="flex flex-col md:flex-row mt-5">

                <div class="w-full md:w-7/10">
                    <label class="text-lg text-pmca-secondary" for="filter">
                        Filtrar
                    </label>
                    <input v-model="filter" @input=handleFilter
                        class="w-full bg-gray-50 border border-gray-200 p-2 focus:outline-none focus:border-pmca-accent rounded-sm leading-none"
                        id="filter" type="text" placeholder="Filtrar verbetes">
                </div>

                <div class="w-full sm:w-3/10 md:ml-3" v-if="hasViewMode">
                    <label class="text-lg text-pmca-secondary" for="list-mode">
                        Modo de exibição
                    </label>
                    <select v-model="listMode" @input=handleMode
                        class="w-full text-md bg-gray-50 border border-gray-200 p-2 focus:outline-none focus:border-pmca-accent rounded-sm"
                        id="list-mode">
                        <option value="hier">Hierárquico</option>
                        <option value="alfa">Alfabético</option>
                    </select>
                </div>

            </div>

            <div v-if="listMode === 'hier' && hasViewMode">
                <UITreeView :tree="tree" class="mt-6" />
            </div>

            <div v-else class="mt-6">

                <div class="flex flex-row justify-between">
                    <div class="flex flex-row text-xl">
                        <p v-if="filteredEntries.length > 0">
                            {{ filteredEntries.length }}
                            <span v-if="filteredEntries.length === 1">verbete </span>
                            <span v-else>verbetes </span>
                            <span v-if="filter.length > 0"> encontrado<span v-if="filteredEntries.length > 1">s
                                </span></span>
                        </p>
                        <p v-if="filteredEntries.length === 0">
                            Nenhum resultado encontrado
                        </p>
                    </div>
                    <div class="flex flex-row">
                        <button class="flex flex-col items-end justify-center" @click="handleSort">
                            <Icon class="w-8 h-8"
                                :name="sortOrder === 'asc' ? 'ph:sort-ascending' : 'ph:sort-descending'" />
                        </button>
                    </div>
                </div>

                <div class="flex flex-col mt-5">
                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        <div v-for="entry in filteredEntries" :key="entry.id" :entry="entry">
                            <PublicEntryCard :entry="entry" />
                        </div>
                    </div>
                </div>

            </div>


        </main>
    </NuxtLayout>
</template>
       
<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: 'Verbetes'
    },
    hasViewMode: {
        type: Boolean,
        default: false
    },
    userSelection: {
        type: Boolean,
        default: false
    }
});

const router = useRouter();

const query = computed(() => {
    return router.currentRoute.value.query;
});

const entries = ref([])
const sortOrder = ref('asc');
const filter = ref('');
const tree = ref({});

if (props.hasViewMode) {

    const { data: hierarchy } = await useFetchWithBaseUrl('/api/entry?query=' + JSON.stringify({
        pageSize: -1,
        select: ['id', 'name', 'parentId'],
        where: {
            isCategory: true,
        },
        include: {
            children: {
                where: {
                    isCategory: false
                }
            }
        }
    }), {
        transform: (categories: any) =>
            categories.data.map((category: Category) => {
                return {
                    id: category.id,
                    name: category.name,
                    parentId: category.parentId,
                    entries: category.children
                }
            })
    });

    tree.value = useConvertToTreeData(hierarchy.value, false, true, null);
}

if (props.userSelection) {
    const fetchEntries = async (ids: string[]) => {

        const fetch = useFetchWithBaseUrl('/api/entry?query=' + JSON.stringify({
            where: {
                id: ids
            },
            include: {
                media: {
                    orderBy: ['position'],
                    include: ['media'],
                }
            }
        }));

        await fetch.execute({ _initial: true });
        entries.value = fetch.data.value.data;
    };

    const { selectedEntries } = useEntrySelection();
    
    if (selectedEntries.length > 0) {
        await fetchEntries(selectedEntries);
    }

} else {
    const fetchEntries = async (query: string) => {

        const body = {
            include: {
                media: {
                    orderBy: ['position'],
                    include: ['media'],
                }
            },
            orderBy: ['name'],
        };

        if (query) {
            // @ts-ignore
            body.where = {
                or: [
                    {
                        name: {
                            like: query
                        }
                    },
                    {
                        definition: {
                            like: query
                        }
                    },
                    {
                        notes: {
                            like: query
                        }
                    }
                ]
            };
        }

        const { data } = await useFetchWithBaseUrl('/api/entry?query=' + JSON.stringify(body));

        entries.value = data.value.data;
    };

    await fetchEntries(query.value.termo || '');

    watch(() => query.value, async (newQuery) => {
        await fetchEntries(newQuery.termo);
    });
}

const filteredEntries = computed(() => {

    if (!filter.value) {
        return entries.value;
    }

    const normalizedFilterValue = filter.value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    return entries.value.filter(entry =>
        entry.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes(normalizedFilterValue)
    );

});

// hierarchical (hier) or alphabetical (alfa)
const listMode = computed(() => {
    return query.value?.modo || 'hier';
});

const handleFilter = (event: Event) => {
    if (listMode.value === 'hier') {
        router.push({
            query: {
                ...query.value,
                modo: 'alfa'
            }
        });
    }
    filter.value = event.target.value;
};

const handleMode = (event: Event) => {
    router.push({
        query: {
            ...query.value,
            modo: event.target.value
        }
    });

    listMode.value = event.target.value;

};

const handleSort = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    entries.value = entries.value.reverse();
};

</script>
      