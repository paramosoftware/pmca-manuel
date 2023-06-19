<template>
    <nav id="navbar" class="sticky w-full top-0 left-0 right-0 z-10 p-4 border-b border-neutral-400 bg-neutral-100">

    <div class="flex flex-col md:flex-row items-center justify-between">
      <div class="flex flex-row items-center mb-5">
        <NuxtLink to="/">
          <span class="text-2xl p-5 hover:underline text-black">Início</span>
        </NuxtLink>

        <NuxtLink to="/verbetes">
          <span class="text-2xl p-5 hover:underline text-black">Verbetes</span>
        </NuxtLink>

        <NuxtLink to="/logged" v-show="isUserLogged">
          <span class="text-2xl p-5 hover:underline text-black">Gerenciar</span>
        </NuxtLink>

        <UIButton label="Logout" v-show="isUserLogged" :on-click="logout">
        </UIButton>
      </div>

      <div class="flex items-center">
        <form id="search" @submit="searchHandler">
          <label for="default-search" class="mb-2 text-sm font-medium text-black sr-only">Search</label>
          <div class="relative md:w-[500px]">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon name="ph:magnifying-glass" class="text-black w-5 h-5" />
            </div>
            <input type="search" id="default-search" v-model="search"
              class="w-full p-4 pl-10 text-sm text-black border-black bg-transparent focus: focus:outline-none  focus:ring-2 focus:ring-black focus:border-transparent"
              required>
            <button type="submit" class="text-black absolute right-2.5 bottom-2.5 text-sm px-4 py-2">Buscar</button>
          </div>
        </form>
      </div>
    </div>
  </nav>
</template>


<script setup lang="ts">

const router = useRouter();

const search = ref(router.currentRoute.value.query.termo || '');

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

const logout = async () => {
  const { data, error } = await useFetchWithBaseUrl('/api/auth/logout', {
      method: 'POST',
  });

  //console.log(data);

  router.push({
      path: '/login'
  });
};

</script>

<script lang="ts">

export default {
  data() {
    return {
      isUserLogged: true
    }
  },
  created() {
    this.checkUserIsLogged();
  },
  methods: {
      async checkUserIsLogged() {
          const { isAuthenticated, isAdmin } = useAuth();
          this.isUserLogged = await isAuthenticated();
      }
  }
}

</script>