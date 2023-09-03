<template>
  <article class="container flex">
    <div class="w-full">
      <div class="sm:flex sm:justify-between sm:items-center">
        <UIPageTitle>
          {{ entry.name }}
          <client-only>
            <Icon class="text-pmca-accent cursor-pointer"
              :name="entrySelected ? 'ph:bookmark-simple-fill' : 'ph:bookmark-simple'" @click="saveSelection(entry.id)" />
          </client-only>
        </UIPageTitle>
        <PublicEntryActions :entryId="entry.id" :title="entry.name" />
      </div>

      <UITab :tabs="['Verbete', 'Hierárquica', 'Histórico de alterações']" @change="handleTabChange">
        <template #tabPanel-1>
          <div class="flex flex-col">

            <PublicEntryMedia :images=images v-if="images.length > 0" />

            <PublicEntryAttribute title="Traduções" :content="translations" />

            <PublicEntryAttribute title="Variações" :content="entry.variations" />

            <PublicEntryAttribute title="Definição" :content="entry.definition" :is-html=true />

            <PublicEntryAttribute title="Notas" :content="entry.notes" :is-html=true />

            <PublicEntryAttribute title="Referências" :content="references" :is-html=true :is-one-line="true" />

            <PublicEntryRelatedEntries title="Verbetes relacionados" :entries="entry.relatedEntries" />
          </div>
        </template>
        <template #tabPanel-2>
          <div class="flex flex-col">
              <UITreeView :tree="tree" class="p-3 overflow-y-auto text-pmca-primary" />
          </div>
        </template>
        <template #tabPanel-3>
          <div class="flex flex-col">
          </div>
        </template>
      </UITab>
    </div>
  </article>
</template>

<script setup lang="ts">

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
})

const images = ref([]);
const translations = ref([]);
const references = ref([]);
const entrySelected = ref(false);
const tree = ref([]);

if (process.client) {
  if (localStorage.getItem('selectedEntries') !== null) {
    const selectedEntries = JSON.parse(localStorage.getItem('selectedEntries')!)
    if (selectedEntries.includes(props.entry.id)) {
      entrySelected.value = true;
    }
  }
}

const saveSelection = (id: number) => {

  event.preventDefault();

  if (localStorage.getItem('selectedEntries') === null) {
    localStorage.setItem('selectedEntries', JSON.stringify([id]))
    entrySelected.value = true;
  } else {
    const selectedEntries = JSON.parse(localStorage.getItem('selectedEntries')!)
    if (selectedEntries.includes(id)) {
      const index = selectedEntries.indexOf(id)
      selectedEntries.splice(index, 1)
      localStorage.setItem('selectedEntries', JSON.stringify(selectedEntries))
      entrySelected.value = false;
    } else {
      selectedEntries.push(id)
      localStorage.setItem('selectedEntries', JSON.stringify(selectedEntries))
      entrySelected.value = true;
    }
  }
}


if (props.entry.media) {
  props.entry.media.forEach((media: EntryMedia) => {
    images.value.push(media.media.name)
  })
}

if (props.entry.references) {
  props.entry.references.forEach((reference: Reference) => {
    references.value.push({
      name: reference.name,
    })
  })
}

if (props.entry.translations) {
  props.entry.translations.forEach(async (translation: Translation) => {
    const language = translation.languageId
    const { data } = await useFetchWithBaseUrl('/api/languages/' + language)
    translations.value.push({
      name: translation.name + ' (' + data.value.name + ')',
      link: ''
    })
  })
}

const handleTabChange = async (value: number) => {
  if (value === 2 && tree.value.length === 0) {
    await fetchHierarchy();
  }
}

const fetchHierarchy = async () => {
  const { data: hierarchy } = await useFetchWithBaseUrl('/api/categories', {
    transform: (categories) =>
      categories.map((category: Category) => ({
        id: category.id,
        name: category.name,
        parentId: category.parentId,
        entries: category.entries,
      })),
  });

  tree.value = useConvertToTreeData(hierarchy.value, false, true, null, props.entry.id);
}
</script>