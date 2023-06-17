<template>
  <article class="container max-w-screen-xl mx-auto p-5 md:flex bg-white border border-neutral my-5">
    <section class="w-full md:w-1/5 mx-auto">
      <h1 class="text-5xl text-black"> {{ entry.name }} </h1>
      <ExternalEntryActions />
    </section>
    <section class="w-full md:w-4/5 md:pl-10 py-6 md:pt-0">

      <ExternalEntryMedia :images=images v-if="images.length > 0" />

      <div class="flex flex-col">

        <ExternalEntryAttribute title="Traduções" :content="translations" />

        <ExternalEntryAttribute title="Definição" :content="entry.definition" :is-html=true />

        <ExternalEntryAttribute title="Verbetes relacionados" :content="relatedTerms" :has-link="true" />

        <ExternalEntryAttribute title="Notas" :content="entry.notes" :is-html=true />

        <ExternalEntryAttribute title="Referências" :content="references" :is-html=true :is-one-line="true" />

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

if (props.entry.relatedEntries) {
  props.entry.relatedEntries.forEach((entry: Entry) => {
    relatedTerms.value.push({
      name: entry.name,
      link: '/verbetes/' + entry.code
    })
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