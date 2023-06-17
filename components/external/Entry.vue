<template>
  <article class="container max-w-screen-xl mx-auto p-5 md:flex bg-white border border-neutral my-5">
    <section class="w-full md:w-1/5 mx-auto">
      <a href="#" class="text-red-900 text-lg uppercase hover:underline">{{ entry.category.name ?? 'sem categoria' }}</a>
      <h1 class="text-5xl text-black"> {{ entry.name }} </h1>
      <p class="text-lg text-black mt-4"><a href="#">Paper</a> (en) | <a href="#">Papier</a> (fr) | <a
          href="#">Papel</a>(es)</p>
      <ExternalEntryActions />
    </section>
    <section class="w-full md:w-4/5 md:pl-10 py-6 md:pt-0">

      <ExternalEntryMedia :images=images v-if="images.length > 0" />

      <div class="flex flex-col">

        <ExternalEntryAttribute :title="'Definição'" :content="entry.definition" />

        <ExternalEntryAttribute :title="'Termos relacionados'" :content="terms" />

        <ExternalEntryAttribute :title="'Notas'" :content="entry.notes" />

        <ExternalEntryAttribute :title="'Referências'" :content="entry.references" />

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

const images = ref([])

props.entry.media.forEach((media: Media) => {
  images.value.push('/' + media.name)
})

const terms = [
  {
    name: 'Papelão',
    link: '#'
  },
  {
    name: 'Celulose',
    link: '#'
  },
  {
    name: 'Papel reciclado',
    link: '#'
  }
]

</script>

<style scoped></style>