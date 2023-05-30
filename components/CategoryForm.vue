<template>
    <Form singular-name="category" plural-name="categories" singular-name-pt="categoria" plural-name-pt="categorias"
     :object=category :is-create="category.id == 0">

            <FormInput label="Nome" v-model="category.name" id="name" type="text" placeholder="Nome da categoria" />

            <FormInput label="Descrição" v-model="category.description" id="description" type="text" textarea
                placeholder="Descrição da categoria" />

            <FormSelect label="Categoria superior" v-model="category.parentId" id="parent" :options="categories" />

    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ category?: Category }>();

const { data: categories } = useFetch('/api/categories');

const category = ref<Category>(
    props.category ?? {
        id: 0,
        name: '',
        description: '',
        parentId: 0,
    }
);

</script>

<style scoped></style>