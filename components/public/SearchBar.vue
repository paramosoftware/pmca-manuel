<template>
    <form class="flex flex-row justify-end align-bottom" @submit.prevent="searchHandler">
        <input v-model="search" @input="searchEntries" type="text" name="termo" placeholder="Pesquisar"
            class="w-full bg-gray-50 border border-gray-200 p-2 focus:outline-none focus:border-pmca-accent rounded-sm leading-none" />

        <div v-if="searching" class="absolute right-16 top-0 mt-2 mr-50">
            <Icon name="ph:spinner" class="animate-spin h-6 w-6"></Icon>
        </div>

        <PublicButton type="submit">
            <Icon name="ph:magnifying-glass" class="h-6 w-6"></Icon>
        </PublicButton>
    </form>
    <div class="flex flex-row justify-end align-bottom" v-if="entries.length > 0">
        <ul @click.away="entries = []" @keydown.escape="entries = []" v-if="searchTerm !== ''"
            class="bg-white border border-x-gray-300 border-b-gray-300 p-2 space-y-1 absolute z-10 w-full shadow-md text-left">

            <li v-for="entry in entries" :key="entry.name" @click="selectEntry(entry.slug)"
                class="cursor-pointer hover:bg-gray-100 p-2 rounded-sm hover:text-pmca-accent">
                {{ entry.name }}
            </li>
        </ul>
    </div>
</template>


<script setup lang="ts">
const router = useRouter();
const search = ref(router.currentRoute.value.query.termo || '');
let entries = ref([] as Entry[]);
let timeoutId: NodeJS.Timeout = setTimeout(() => { }, 0);
let searching = ref(false);
let show = ref(false);

const searchTerm = computed(() => {
  return search.value;
});

const searchHandler = (e: Event) => {
  if (search.value) {
    e.preventDefault();

    router.push({
      path: '/busca',
      query: {
        termo: search.value
      }
    });
  }
};

const selectEntry = (slug: string) => {
  router.push({
    path: '/verbetes/' + slug
  });

  search.value = '';
  entries.value = [];
};


const searchEntries = async () => {
  if (searchTerm.value === '') {
    entries.value = []
    return
  }

  clearTimeout(timeoutId);

  timeoutId = setTimeout(async () => {

    searching.value = true

    const { data } = await useFetchWithBaseUrl('api/entries/autocomplete', {
      params: {
        q: searchTerm.value
      }
    })

    entries.value = data.value
    entries.value = entries.value.slice(0, 10)

    setTimeout(() => {
      searching.value = false
    }, 300);
    

  }, 300);

  if (entries.value.length === 0 && !searching.value) {
    show.value = true

    setTimeout(() => {
      show.value = false
    }, 3000);
  }

}
</script>
