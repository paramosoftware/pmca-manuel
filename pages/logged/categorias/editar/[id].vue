<template>
    <CategoryForm :category="category" />
</template>

<script setup lang="ts">

const category = ref<Category>();

const router = useRouter();
const { data } = await useFetch(`/api/categories/${router.currentRoute.value.params.id}`);

// TODO: check if there is a better way 
category.value = data.value;

</script>


