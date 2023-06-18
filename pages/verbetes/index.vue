<template>
  <ExternalNavbar />
  <main class="container max-w-screen-xl mx-auto p-5 bg-white border border-neutral mt-5">
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <h1 class="text-4xl text-black">Verbetes</h1>
        <p class="text-black">{{ filteredEntries.length }} resultados</p>
      </div>

      <button v-if="listMode != 'hierarchical'"  class="flex flex-col items-end justify-center" @click="handleSort">
        <Icon class="text-black w-20" :name="sortOrder === 'asc' ? 'ph:sort-ascending' : 'ph:sort-descending'" />
      </button>
    </div>

    <div class="flex flex-col md:flex-row mt-4">
      <div class="w-full md:w-7/10">
        <label class="text-lg uppercase text-red-900" for="filter">
          Filtrar
        </label>
        <input v-model="filter" @input=handleFilter
          class="w-full text-md text-black border-black bg-transparent placeholder:text-gray-500 focus:outline-none focus:ring-red-900 focus:border-transparent"
          id="filter" type="text" placeholder="Filtrar verbetes">
      </div>

      <div class="w-full sm:w-1/10 mt-4 md:mt-0 md:ml-5">
        <label class="text-lg uppercase text-red-900" for="list-mode">
          Modo de exibição
        </label>
        <select v-model="listMode" @input=handleMode
          class="w-full  text-md text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
          id="list-mode">
          <option value="hierarchical">Hierárquica</option>
          <option value="alphabetical">Alfabética</option>
        </select>
      </div>

    </div>

    <span v-if="filteredEntries.length === 0" class="text-black text-xl">
      Nenhum resultado encontrado
    </span>

    <div v-else-if="listMode === 'hierarchical'">
        <TreeView :tree="tree" class="mt-5 p-2" />
    </div>

    <div v-else class="mt-5">
      <ExternalEntryList v-for="entry in filteredEntries" :key="entry.id" :entry="entry" />
    </div>


  </main>


  <Footer />
</template>
   
<script setup lang="ts">

import { initFlowbite } from 'flowbite'

onMounted(() => {
  getCategoriesFromEntries(entries.value)
  initFlowbite();
})

onUpdated(() => {
  initFlowbite();
})

const router = useRouter();

const query = computed(() => {
  return router.currentRoute.value.query;
});

const entries = ref([])
const entriesByCategory = ref([])
const sortOrder = ref('asc');
const filter = ref('');
const listMode = ref('hierarchical'); // hierarchical, alphabetical
const categories = ref([]);
const category = ref("0");
const tree = ref({});


const { data: hierarchy } = await useFetchWithBaseUrl('/api/categories', {
    transform: (categories) =>
        categories.map((category: Category) => ({
            id: category.id,
            name: category.name,
            parentId: category.parentId,
            entries: category.entries,
        })),
});

tree.value = useConvertToTreeData(hierarchy.value, false, true, null);

const fetchEntries = async (query) => {
  const { data } = await useFetchWithBaseUrl('/api/entries/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: query
    })
  });

  entries.value = data.value;
}

await fetchEntries(query.value);

// TODO: for some reason, watch is not triggered when the URL is changed directly, 
// so the fetchEntries need to be called at least once
watch(() => query.value, async (newQuery) => {
  await fetchEntries(newQuery)
});

const filteredEntries = computed(() => {

  if (!filter.value && !category.value) {
    return entries.value;
  }

  if (category.value != "0") {
    return entriesByCategory.value?.filter(entry => entry.name.toLowerCase().includes(filter.value.toLowerCase()) && entry.category?.id === parseInt(category.value));
  } 

  return entries.value?.filter(entry => entry.name.toLowerCase().includes(filter.value.toLowerCase()));
});

const filteredEntriesByMode = computed(() => {

  if (listMode.value === 'alphabetical') {
    return filteredEntries.value.reduce((acc, entry) => {
      const letter = entry.name[0].toUpperCase();
      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(entry);
      return acc;
    }, {});

  } else if (listMode.value === 'category') {

    const groupedEntries = filteredEntries.value.reduce((acc, entry) => {
      const category = entry.category ? entry.category.name : 'Sem categoria';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(entry);
      return acc;
    }, {});


    const sortedKeys = Object.keys(groupedEntries).sort((a, b) => {
      if (sortOrder.value === 'asc') {
        return a.toLowerCase().localeCompare(b.toLowerCase(), 'pt-BR');
      } else {
        return b.toLowerCase().localeCompare(a.toLowerCase(), 'pt-BR');
      }
    });

    const sortedGroupedEntries = {};

    sortedKeys.forEach(key => {
      sortedGroupedEntries[key] = groupedEntries[key];
    });

    return sortedGroupedEntries;

  }

});

const getCategoriesFromEntries = (newEntries: Entry[]) => {
  categories.value = newEntries.reduce((acc, entry) => {
    if (entry.category && !acc.find(category => category.id === entry.category.id)) {
      acc.push(entry.category);
    }
    return acc;
  }, []);
}

const handleCategory = (event: Event) => {
  category.value = event.target.value;

  if (category.value) {
    entriesByCategory.value = entries.value.filter(entry => entry.category?.id === parseInt(category.value));
  } 

};

const handleFilter = (event: Event) => {

  listMode.value = 'alphabetical';

  filter.value = event.target.value;
};

const handleMode = (event: Event) => {

  listMode.value = event.target.value;

};

const handleSort = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  entries.value = entries.value.reverse();
};

</script>
  