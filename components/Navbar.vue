<template>
  <nav id="navbar" class="py-4">

    <div class="container mx-auto border-b-2 pb-4 border-b-pmca-primary">

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
          <div class="flex flex-row justify-end align-bottom">
            <UDropdown :items="items" :popper="{ placement: 'bottom-start' }" :ui="{ rounded: 'rounded-sm' }" >
              <UAvatar size="sm">
                <Icon name="ph:user-circle" class="h-6 w-6"></Icon>
              </UAvatar>
            </UDropdown>
          </div>
        </div>


      </div>
    </div>

  </nav>
</template>

<script setup lang="ts">

const links = ref([
    {
      name: 'Gerenciar',
      path: '/logged'
    },
]);


const items = [
  [{
    label: 'Nome',
    disabled: true,
  }],
  [{
    label: 'Sair',
    click: () => {
      logout();
    }
  }]
]

const logout = async () => {
  const { data, error } = await useFetchWithBaseUrl('/api/auth/logout', {
      method: 'POST',
  });
  
  navigateTo('/')
};
</script>