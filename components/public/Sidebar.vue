<template>
   <div class="container max-w-screen-xl mx-auto">
      <PublicButton :type="'button'" @click="sidebarIsOpen = true">
            {{ title }}
            <Icon name="ph:caret-right" class="w-5 h-5" />
      </PublicButton>
   </div>
   <USlideover v-model="sidebarIsOpen" side="left" :ui="{ width: 'w-screen max-w-xl' }">
      
      <UITitle class="p-3">{{ title }}</UITitle>

      <button type="button" @click="sidebarIsOpen = false" class="absolute top-0 right-0 p-2">
         <Icon name="ph:x" class="w-5 h-5" />
         <span class="sr-only">Fechar menu</span>
      </button>

      <UITreeView :tree="tree" class="p-3 overflow-y-auto text-pmca-primary" />
   </USlideover>
</template>

<script setup lang="ts">

const props = defineProps({
   openEntryId: Number
});

const title = 'Hierarquia';

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