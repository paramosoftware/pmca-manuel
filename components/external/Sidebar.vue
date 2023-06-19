<template>
   <div class="sticky text-center mt-5 m-5 z-0">
      <button type="button" @click="sidebarIsOpen = true">
         <span class="sr-only">Abrir menu</span>
         <p class="uppercase text-lg text-red-900" style="writing-mode: vertical-lr;">{{ title }}</p>
         <Icon name="ph:caret-right" class="w-5 h-5 p-0 m-0" />
      </button>
   </div>

   <USlideover v-model="sidebarIsOpen" side="left" :ui="{ width: 'w-screen max-w-xl  ' }">
      <h5 class="text-xl text-red-900 uppercase mt-5 p-2">{{ title }}</h5>

      <button type="button" @click="sidebarIsOpen = false" class="absolute top-0 right-0 p-4">
         <Icon name="ph:x" class="w-5 h-5" />
         <span class="sr-only">Fechar menu</span>
      </button>

      <UITreeView :tree="tree" class="mt-2 p-2 overflow-y-scroll" />
   </USlideover>
</template>

<script setup lang="ts">

const props = defineProps({
   openEntryId: Number
});

const title = 'hierarquia';

const sidebarIsOpen = ref(false);

const tree = ref([]);

const { data: hierarchy } = await useFetchWithBaseUrl('/api/categories', {
   transform: (categories) =>
      categories.map((category: Category) => ({
         id: category.id,
         name: category.name,
         parentId: category.parentId,
         entries: category.entries,
      })),
});

tree.value = useConvertToTreeData(hierarchy.value, false, true, null, props.openEntryId);

</script>