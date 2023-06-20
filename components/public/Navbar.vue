<template>
  <nav id="navbar" class="py-4">

    <div class="container max-w-screen-xl mx-auto border-b-2 pb-4 border-b-pmca-primary">

      <div class="grid grid-cols-4 md:grid-cols-12 gap-4">
        <div class="mt-1">
          <NuxtLink to="/">
            <img src="/logo-pmca.png" alt="Logo" class="w-14 h-14" />
          </NuxtLink>
        </div>
        <div class="col-span-3 md:col-span-4">
          <div class="flex flex-col justify-between">
            <div>
              <h1 class="text-2xl font-semibold flex-row mb-2">
                Glossário de conservação-restauro de livros e documentos
              </h1>
            </div>
            <div>
              <UILink v-for="link in links" :key="link.name" :href="link.path" class="text-2xl mr-5">
                {{ link.name }}
              </UILink>
            </div>
          </div>
        </div>
        <div class="col-span-4 md:col-span-7">
          <form class="flex flex-row justify-end align-bottom" @submit.prevent="searchHandler">
            <input
              v-model="search"
              type="text"
              name="termo"
              placeholder="Pesquisar"
              class="w-10/12 bg-gray-50 border border-gray-200 p-2 focus:outline-none focus:border-pmca-accent rounded-sm leading-none"
            />
            <PublicButton type="submit">
              <Icon name="ph:magnifying-glass" class="h-6 w-6"></Icon>
            </PublicButton>
          </form>
        </div>


      </div>
    </div>

  </nav>
</template>

<script setup lang="ts">

const router = useRouter();

const search = ref(router.currentRoute.value.query.termo || '');


const links = ref([
    {
      name: 'Verbetes',
      path: '/verbetes'
    },
    {
      name: 'Sobre',
      path: ''
    },
    {
      name: 'Software',
      path: ''
    },
    {
      name: 'PMCA',
      path: ''
    }
]);


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

</script>