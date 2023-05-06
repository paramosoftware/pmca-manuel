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
                <h1 class="text-3xl text-black">Verbetes</h1>
                <button @click="create"
                    class="text-white bg-red-900 p-2 focus:outline-none focus:border-transparent hover:bg-red-950">
                    NOVO
                </button>
            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="filter">
                    Filtrar
                </label>
                <input v-model="filter" @input="filteredEntries"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="filter" type="text" placeholder="Filtrar verbetes">
            </div>

            <div v-for="entry in filteredEntries" :key="entry.id" class="w-full py-4 border-b border-red-900 last:border-b-0">
                <div class="w-full h-full flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl text-black">{{ entry.name }}</h1>
                        <p class="text-md text-gray-500">
                            {{ entry.definition }}
                        </p>
                    </div>
                    <div>
                        <span class="sr-only">Editar verbete</span>
                        <Icon name="ph:pencil-simple" class="text-black w-6 h-6 m-1" title="Editar verbete"
                            @click="() => edit(entry.id)" />
                        <span class="sr-only">Excluir verbete</span>
                        <Icon name="ph:trash-simple" class="text-black w-6 h-6 m-1" title="Excluir verbete"
                            @click="() => deleteCategory(entry.id)" />
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const entries = ref<Entry[]>([]);

const { data } = await useFetch('/api/entries');

entries.value = data.value;

const router = useRouter();

const create = () => {
    router.push('/logged/verbetes/criar');
}

const edit = (id: number) => {
    router.push(`/logged/verbetes/editar/${id}`);
}

const deleteCategory = async (id: number) => {
    const { data } = await useFetch(`/api/entries/${id}`, {
        method: 'DELETE'
    });

    if (data) {
        entries.value = entries.value.filter(entry => entry.id !== id);
    }
}

const filter = ref('');

const filteredEntries = computed(() => {
    if (!filter.value) {
        return entries.value;
    }

    return entries.value.filter(entry => entry.name.toLowerCase().includes(filter.value.toLowerCase()));
});


</script>


<style scoped></style>