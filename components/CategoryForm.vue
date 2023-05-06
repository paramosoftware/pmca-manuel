<template>
    <div class="flex flex-col justify-center items-center mt-10">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <div class="flex flex-row justify-start items-center">
                <a href="/logged/categorias" class="text-red-900 uppercase text-lg hover:underline">
                    <Icon name="ph:arrow-left" class="w-5 h-5 text-black" />
                    Voltar
                </a>
            </div>
            <div class="justify-between flex flex-row items-center mt-4">
                <h1 class="text-3xl text-black">{{ category.id === 0 ? 'Criar' : 'Editar' }} categoria</h1>
                <button v-if="category.id !== 0" @click="() => $router.push('/logged/categorias/criar')"
                            class="text-white bg-red-900 p-2 focus:outline-none focus:border-transparent hover:bg-red-950">
                        NOVA
                </button>
            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="name">
                    Nome
                </label>
                <input v-model="category.name"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="name" type="text" placeholder="Nome da categoria">
            </div>
            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="description">
                    Descrição
                </label>
                <textarea v-model="category.description"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="description" type="text" placeholder="Descrição da categoria"></textarea>
            </div>
            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="parent">
                    Categoria superior
                </label>
                <select v-model="category.parentId"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="parent">
                    <option value="0"></option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                    </option>
                </select>
            </div>
            <div class="mt-5 text-end">
                <button @click="saveCategory"
                    class="text-white bg-red-900 p-2 focus:outline-none focus:border-transparent hover:bg-red-950">
                    SALVAR
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const router = useRouter();

const props = defineProps<{ category?: Category }>();

const { data: categories } = await useFetch('/api/categories');

const category = ref<Category>({
    id: 0,
    name: '',
    description: '',
    parentId: 0,
    children: [],
});


if (props.category) {
    category.value = props.category;
}

const saveCategory = async () => {
    let url = `/api/categories/${category.value.id}`;
    let method = 'PUT';

    if (category.value.id === 0) {
        url = '/api/categories';
        method = 'POST';
    }

    const { data: savedCategory } = await useFetch(url, {
        // @ts-ignore
        method: method,
        body: JSON.stringify(category.value),
    });

    if (savedCategory) {
        router.push('/logged/categorias/editar/' + savedCategory.value.id);
    }
};

</script>


<style scoped></style>