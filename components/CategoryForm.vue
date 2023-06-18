<template>
    <Form
        gender-noun="f" 
        singular-name="category" 
        plural-name="categories" 
        singular-name-pt="categoria" 
        plural-name-pt="categorias"
        url-path="categorias"
        :object=category 
        :is-create="category.id == 0">

        <FormInput 
            id="name" 
            label="Nome" 
            v-model.trim="category.name" 
            type="text" 
            required
            />

        <FormInput 
            id="description" 
            label="Descrição" 
            v-model.trim="category.description" 
            type="text" 
            textarea
        
            />

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

tree.value = useConvertToTreeData(categories.value, true, false, category.value.id);

watch(categories, (newVal) => {
    tree.value = useConvertToTreeData(newVal, true, false, category.value.id);
});

</script>
