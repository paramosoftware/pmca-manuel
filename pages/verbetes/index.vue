<template>
  <ExternalNavbar />
  <main class="container max-w-screen-xl mx-auto p-5 bg-white border border-neutral mt-5">
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <h1 class="text-5xl text-black">Verbetes</h1>
        <p class="text-black">{{ filteredEntries.length }} resultados</p>
      </div>

      <button class="flex flex-col items-end justify-center" @click="handleSort">
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

      <div class="w-full sm:w-1/10 mt-4 md:mt-0 ml-5">
        <label class="text-lg uppercase text-red-900" for="list-mode">
          Modo de exibição
        </label>
        <select v-model="listMode" @input=handleMode
          class="w-full  text-md text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
          id="list-mode">
          <option value="category">Por categoria</option>
          <option value="alphabetical">Alfabética</option>
          <option value="list">Lista</option>
        </select>
      </div>
    </div>


    <span v-if="filteredEntries.length === 0" class="text-black text-xl">
      Nenhum resultado encontrado
    </span>

    <div v-if="listMode !== 'list'" id="accordion-flush" data-accordion="collapse" class="mt-5"
      data-active-classes="text-black" data-inactive-classes="text-black">

      <div v-for="(entries, key, index) in filteredEntriesByMode">
        <h2 :key="key" :id="'accordion-flush-heading-' + index" class="cursor-pointer mb-5">
          <button type="button"
            class="flex items-center justify-between border-b border-b-red-900 w-full p-5 text-4xl text-black text-left bg-white"
            :data-accordion-target="'#accordion-flush-body-' + index" aria-expanded="false"
            :aria-controls="'accordion-flush-body-' + index">
            <span>{{ key }}</span>
            <Icon data-accordion-icon class="w-20 shrink-0 text-black" name="ph:caret-down" />
          </button>
        </h2>

        <div :id="'accordion-flush-body-' + index" class="hidden px-10"
          :aria-labelledby="'accordion-flush-heading-' + index">
          <ExternalEntryList v-for="entry in entries" :key="entry.id" :entry="entry"
            :show-category="listMode !== 'category'" class="pl-4" />
        </div>

      </div>
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
const filter = ref('');
const listMode = ref('category'); // category, alphabetical, list
const sortOrder = ref('asc');

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

fetchEntries(query.value);

// TODO: for some reason, watch is not triggered when the URL is changed directly, 
// so the fetchEntries need to be called at least once
watch(() => query.value, async (newQuery) => {
  await fetchEntries(newQuery)
});

const filteredEntries = computed(() => {
  if (!filter.value) {
    return entries.value;
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
        return a.toLowerCase().localeCompare(b.toLowerCase());
      } else {
        return b.toLowerCase().localeCompare(a.toLowerCase());
      }
    });

    const sortedGroupedEntries = {};

    sortedKeys.forEach(key => {
      sortedGroupedEntries[key] = groupedEntries[key];
    });

    return sortedGroupedEntries;

  }

});

const handleFilter = (event: Event) => {
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
  