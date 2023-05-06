<template>
    <div class="flex flex-col justify-center items-center mt-10">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <div class="flex flex-row justify-start items-center">
                <a href="/logged" class="text-red-900 uppercase text-lg hover:underline">
                    <Icon name="ph:arrow-left" class="w-5 h-5 text-black" />
                    VOLTAR
                </a>
            </div>

            <div class="justify-between flex flex-row items-center my-4">
                <h1 class="text-3xl text-black">Categorias</h1>
                <button @click="createCategory"
                    class="text-white bg-red-900 p-2 focus:outline-none focus:border-transparent hover:bg-red-950">
                    NOVA
                </button>
            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="filter">
                    Filtrar
                </label>
                <input v-model="filter" @input="filteredCategories"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="filter" type="text" placeholder="Filtrar categorias">
            </div>

            <!-- TODO: Improve filters -->
            <!-- TODO: Pagination  -->

            <div v-for="category in filteredCategories" :key="category.id" class="w-full py-4 border-b border-red-900 last:border-b-0">
                <div class="w-full h-full flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl text-black">{{ category.name }}</h1>
                        <p class="text-md text-gray-500">
                            {{ category.description }}
                        </p>
                    </div>
                    <div>
                        <span class="sr-only">Editar categoria</span>
                        <Icon name="ph:pencil-simple" class="text-black w-6 h-6 m-1" title="Editar categoria"
                            @click="() => editCategory(category.id)" />
                        <span class="sr-only">Excluir categoria</span>
                        <Icon name="ph:trash-simple" class="text-black w-6 h-6 m-1" title="Excluir categoria"
                            @click="() => deleteCategory(category.id)" />
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const categories = ref<Category[]>([]);

const { data } = await useFetch('/api/categories');

categories.value = data.value;

const router = useRouter();

const createCategory = () => {
    router.push('/logged/categorias/criar');
}

const editCategory = (id: number) => {
    router.push(`/logged/categorias/editar/${id}`);
}

const deleteCategory = async (id: number) => {
    const { data } = await useFetch(`/api/categories/${id}`, {
        method: 'DELETE'
    });

    if (data) {
        categories.value = categories.value.filter(category => category.id !== id);
    }
}

const filter = ref('');

const filteredCategories = computed(() => {
    if (!filter.value) {
        return categories.value;
    }

    return categories.value.filter(category => category.name.toLowerCase().includes(filter.value.toLowerCase()));
});


</script>


<style scoped></style>