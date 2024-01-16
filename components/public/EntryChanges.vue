<template>
  <div class="flex flex-col">
    <div class="flex flex-col mt-4">
      <div class="overflow-x-auto">
        <table class="table-auto w-full" v-if="rows.length > 0">
          <thead>
            <tr class="bg-gray-50 break-keep-all">
                <th v-for="column in columns" :key="column.key" class="text-left px-3 py-3.5 font-semibold">
                  {{ column.label }}
                  <span v-if="column.sortable" class="cursor-pointer" @click="handleSort(column.key)">
                    <UIIcon class="w-5 h-5 inline-block" :name="sortOrder.key === column.key ? sortOrder.order === 'asc' ? 'ph:sort-ascending' : 'ph:sort-descending' : 'ph:funnel-simple'"/>
                  </span>
                </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="change in rows">
              <td v-for="column in columns" :key="column.key" class="p-3">
                <div v-html="change[column.key]"></div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="flex justify-center items-center h-32">
          <p class="text-pmca-primary">Nenhuma alteração registrada</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Diff from "diff";

const props = defineProps({
  entryChanges: {
    type: Array,
    required: true
  }
})


const changes = ref(props.entryChanges);
const rows = computed(() => formatRows(changes.value));

const translations = {
  'name': 'Nome',
  'definition': 'Definição',
  'notes': 'Notas',
  'category': 'Categoria',
  'relatedEntries': 'Verbetes relacionados',
  'entries': 'Verbetes',
  'variations': 'Variações',
  'translations': 'Traduções',
  'references': 'Referências'
}

const columns = [
  {
    key: 'date',
    label: 'Data',
    sortable: true,
  },
  {
    key: 'user',
    label: 'Usuário',
    sortable: true
  },
  {
    key: 'field',
    label: 'Campo',
    sortable: true
  },
  {
    key: 'changes',
    label: 'Alterações',
  }
]

const formatRows = (changes: EntryChanges[]) => {
  
  const rows = [];

  for (const change of changes) {

    const changes = JSON.parse(change.changes);

    for (const [key, value] of Object.entries(changes)) {
      const row = {
        date: new Date(change.createdAt).toLocaleString('pt-BR').substring(0, 17),
        user: change.user ? change.user.name : 'Usuário excluído',
        field: translations[key],
        changes: formatChanges(value)
      }

      rows.push(row);
    }
  }

  return rows;
}

const formatChanges = (change: Change) => {

  const formattedChanges = [];

  if (change.old !== undefined && change.new !== undefined) {

      const diff = Diff.diffWords(change.old, change.new);

      const diffFormatted = diff.map((part: { added: any; removed: any; value: any; }) => {
        
        const classText = part.added ? 'text-green-600' : part.removed ? 'text-red-600 line-through' : '';
        return `<p class="${classText} inline">${part.value}</p>`;
      }).join('');
      
      formattedChanges.push(diffFormatted);

      return formattedChanges.join('');
  }

  for (const [key, value] of Object.entries(change)) {
    if (key === 'added') {
      formattedChanges.push('<i>Adicionado: </i>' + value.join(', '));
    }

    if (key === 'removed') {
      formattedChanges.push('<i>Removido: </i>' + value.join(', '));
    }

  }
  
  return formattedChanges.join('<br>');
}


const sortOrder = ref({
  key: '',
  order: ''
});


const handleSort = (key: string) => {

  if (sortOrder.value.key === key) {
    sortOrder.value.order = sortOrder.value.order === 'asc' ? 'desc' : 'asc';
  } else {
    sortOrder.value.key = key;
    sortOrder.value.order = 'asc';
  }

  rows.value.sort((a, b) => {

    if (sortOrder.value.order === 'asc') {
      if (a[sortOrder.value.key] < b[sortOrder.value.key]) {
        return -1;
      }
      if (a[sortOrder.value.key] > b[sortOrder.value.key]) {
        return 1;
      }
    } else {
      if (a[sortOrder.value.key] > b[sortOrder.value.key]) {
        return -1;
      }
      if (a[sortOrder.value.key] < b[sortOrder.value.key]) {
        return 1;
      }
    }

    return 0;
  });
}

</script>
