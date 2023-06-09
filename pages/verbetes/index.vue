<template>
    <ExternalNavbar />
    <main class="container max-w-screen-xl mx-auto p-5 bg-white border border-neutral mt-5">
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <h1 class="text-5xl text-black">Verbetes</h1>
          <p class="text-black">{{ filteredEntries.length }} resultados</p>
        </div>
  
        <div class="flex flex-col items-end justify-center">
          <Icon name="bi:sort-alpha-up" class="text-black" />
        </div>
      </div>
  
  
      <div class="mt-4">
        <label class="text-lg uppercase text-red-900" for="filter">
          Filtrar
        </label>
        <input v-model="filter" @input=handleInput
          class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
          id="filter" type="text" placeholder="Filtrar verbetes">
      </div>
  
      <Pagination v-if="totalPages > 1" :currentPage="currentPage" :totalPages="totalPages"
        @update:currentPage="updateCurrentPage" />
  
      <span v-if="filteredEntries.length === 0" class="text-black text-xl">
        Nenhum resultado encontrado
      </span>
      <span v-else>
        <ExternalEntryList v-for="entry in filteredEntries" :key="entry.id" :entry="entry" />
      </span>
  
      <Pagination v-if="totalPages > 1" :currentPage="currentPage" :totalPages="totalPages"
        @update:currentPage="updateCurrentPage" />
  
    </main>
  
  
    <Footer />
  </template>
   
  <script setup lang="ts">
  
  const router = useRouter();
  
  const query = computed(() => {
    return router.currentRoute.value.query;
  });
  
  const entries = ref([])
  
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
  
  const filter = ref('');
  
  const handleInput = (event: Event) => {
    filter.value = event.target.value;
  };
  
  const filteredEntries = computed(() => {
    if (!filter.value) {
      return entries.value;
    }
  
    return entries.value?.filter(entry => entry.name.toLowerCase().includes(filter.value.toLowerCase()));
  });
  
  const totalResults = computed(() => filteredEntries.value?.length)
  
  const currentPage = ref(1)
  
  // TODO: Paginate results and fix pagination
  
  const totalPages = computed(() => {
    if (totalResults.value === 0) {
      return 1
    }
    return Math.ceil(totalResults.value / 10)
  })
  
  const updateCurrentPage = (newPage: number) => {
    currentPage.value = newPage
  }
  
  </script>
   
  <style scoped></style>