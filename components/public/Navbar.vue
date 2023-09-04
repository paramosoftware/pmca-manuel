<template>
  <nav id="navbar" class="py-4">
    <div class="container border-b-2 pb-4 border-b-pmca-primary">
      <div class="grid grid-cols-4 md:grid-cols-12 gap-4">
        <div class="mt-1">
          <NuxtLink to="/">
            <img src="/icons/icon-pmca.png " alt="Logo" class="w-14 h-14" />
          </NuxtLink>
        </div>
        <div class="col-span-3 md:col-span-4">
          <div class="flex flex-col justify-between">
            <h1 class="text-2xl font-semibold flex-row mb-2">
              {{title}}
            </h1>
          </div>
        </div>
        <div class="block md:hidden text-right align-middle col-span-4 md:col-span-0 mr-3">
            <NuxtLink to="/verbetes-selecionados">
                <Icon class="text-pmca-accent w-9 h-9 cursor-pointer mr-2" name="ph:bookmarks-simple-fill" />
            </NuxtLink>
            <button @click="showMenu = !showMenu" type="button"  aria-controls="navbar-main" aria-expanded="false" aria-label="Abrir menu">
              <Icon name="ph:list" class="w-9 h-9" />
            </button>
        </div>
        <div class="col-span-1 md:col-span-1">
        </div>
        <div class="col-span-4 md:col-span-6 relative mr-3 lg:mr-0">
          <PublicSearchBar />
        </div>
      </div>
      <div class="mt-4">
        <PublicNavLinks :show-menu="showMenu" @update:show-menu="showMenu = $event"/>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const showMenu = ref(false);

const config = useRuntimeConfig();
const title = ref(config.public.appName);
</script>