<template>
  <article class="container md:flex my-5">
    <section class="w-full md:w-1/5">
      <PublicSidebar :open-entry-id="entry.id" class="mb-2" />
      <h1 class="text-4xl mt-5 break-words"> {{ entry.name }} </h1>
      <div class="mt-4 w-1/4">
        <UITitle>Baixar</UITitle>
        <div class="flex flex-row mt-2">
            <a href="#" class="mr-2">
                <Icon name="ph:file-pdf" />
            </a>
        </div>
    </div>
    </section>
    <section class="w-full md:w-4/5 md:pt-0">

      <div>
        <PublicEntryActions class="mb-2" :entryId="entry.id" :title="entry.name" />
      </div>

      <PublicEntryMedia :images=images v-if="images.length > 0" />

      <div class="flex flex-col">

        <PublicEntryAttribute title="Traduções" :content="translations" />

        <PublicEntryAttribute title="Definição" :content="entry.definition" :is-html=true />

        <PublicEntryAttribute title="Notas" :content="entry.notes" :is-html=true />

        <PublicEntryAttribute title="Referências" :content="references" :is-html=true :is-one-line="true" />

        <PublicEntryRelatedEntries title="Verbetes relacionados" :entries="entry.relatedEntries" />

      </div>
    </section>
  </article>
</template>

<script setup lang="ts">

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
})

const relatedTerms = ref<Array<{ name: string, link: string }>>([])
const images = ref([])
const translations = ref([])
const references = ref([])


if (props.entry.media) {
  props.entry.media.forEach((media: Media) => {
    images.value.push('/' + media.name)
  })
}

if (props.entry.references) {
  props.entry.references.forEach((reference: Reference) => {
    references.value.push ({
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

</script>

<style scoped></style>