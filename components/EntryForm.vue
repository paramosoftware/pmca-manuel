<template>

    <Form singular-name="entry" plural-name="entries" singular-name-pt="verbete" plural-name-pt="verbetes" :object=entry :is-create="entry.id == 0">

            <FormInput label="Nome" v-model="entry.name" id="name" type="text" placeholder="Nome do verbete" />

            <FormInput label="Descrição" v-model="entry.definition" id="definition" type="text" textarea
                placeholder="Definição do verbete" />

            <FormInput label="Notas" v-model="entry.notes" id="notes" type="text" textarea
                placeholder="Notas do verbete" />

            <FormInput label="Referências" v-model="entry.references" id="references" type="text" textarea
                placeholder="Referências do verbete" />

            <FormSelect v-model="entry.categoryId" :label="'Categoria'" :options="categories" />
    </Form>


</template>

<script setup lang="ts">

const props = defineProps<{ entry?: Entry }>();

const entry = ref<Entry>(
    props.entry ?? {
        id: 0,
        name: '',
        code: '',
        definition: '',
        notes: '',
        references: '',
        categoryId: 0,
        media: [],
        translations: [],
        relatedEntries: []
    }
);

const { data: categories } = await useFetchWithBaseUrl('/api/categories', {
  transform: (categories) =>
    categories.map((category: Category) => ({
      id: category.id,
      name: category.name,
    })),
});

</script>


<style scoped></style>