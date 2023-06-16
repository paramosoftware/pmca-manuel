<template>
    <Form singular-name="category" plural-name="categories" singular-name-pt="categoria" plural-name-pt="categorias"
        :object=category :is-create="category.id == 0">

        <FormInput label="Nome" v-model="category.name" id="name" type="text" placeholder="Nome da categoria" />

        <FormInput label="Descrição" v-model="category.description" id="description" type="text" textarea
            placeholder="Descrição da categoria" />

        <FormFinder 
            label="Localização hierárquica" 
            v-model="category.parentId" 
            :default-expanded="category.parentId ?? undefined"
            id="parent"
            :item-id="category.id"
            :tree="tree" />

    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ category?: Category }>();

const category = ref<Category>(
    props.category ?? {
        id: 0,
        name: '',
        description: '',
        parentId: 0,
    }
);

const tree = ref({});

const { data: categories } = await useFetchWithBaseUrl('/api/categories');

tree.value = useConvertToTreeData(categories.value, category.value.id);

watch(categories, (newVal) => {
    tree.value = useConvertToTreeData(newVal, category.value.id);
});

</script>
