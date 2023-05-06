<template>
    <div class="flex flex-col justify-center items-center mt-10">
        <div class="container max-w-screen-md mx-auto p-5 bg-white border border-neutral">
            <div class="flex flex-row justify-start items-center">
                <a href="/logged/verbetes" class="text-red-900 uppercase text-lg hover:underline">
                    <Icon name="ph:arrow-left" class="w-5 h-5 text-black" />
                    Voltar
                </a>
            </div>
            <div class="justify-between flex flex-row items-center mt-4">
                <h1 class="text-3xl text-black">{{ entry.id === 0 ? 'Criar' : 'Editar' }} verbete</h1>
                <button v-if="entry.id !== 0" @click="() => $router.push('/logged/verbete/criar')"
                    class="text-white bg-red-900 p-2 focus:outline-none focus:border-transparent hover:bg-red-950">
                    NOVO
                </button>
            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="name">
                    Nome
                </label>
                <input v-model="entry.name"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="name" type="text" placeholder="Nome do verbete">
            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="definition">
                    Definição
                </label>
                <textarea v-model="entry.definition"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="definition" type="text" placeholder="Definição do verbete"></textarea>
            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="notes">
                    Notas
                </label>
                <textarea v-model="entry.notes"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="notes" type="text" placeholder="Notas do verbete"></textarea>

            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="references">
                    Referências
                </label>
                <textarea v-model="entry.references"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="references" type="text" placeholder="Referências do verbete"></textarea>

            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="category">
                    Categoria
                </label>
                <select v-model="entry.category"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="category">
                    <option value="0"></option>
                    <option v-for="category in categories" :key="category.id" :value="category">
                        {{ category.name }}
                    </option>
                </select>


            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="media">
                    Mídia
                </label>
                <input v-model="entry.media"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="media" type="text" placeholder="Mídia do verbete">

            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="translations">
                    Traduções
                </label>
                <input v-model="entry.translations"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="translations" type="text" placeholder="Traduções do verbete">

            </div>

            <div class="mt-4">
                <label class="text-lg uppercase text-red-900" for="relatedEntries">
                    Verbetes relacionados
                </label>
                <input v-model="entry.relatedEntries"
                    class="w-full text-sm text-black border-black bg-transparent focus:outline-none focus:ring-red-900 focus:border-transparent"
                    id="relatedEntries" type="text" placeholder="Verbete relacionado">

            </div>
            <div class="mt-5 text-end">
                <button @click="save"
                    class="text-white bg-red-900 p-2 focus:outline-none focus:border-transparent hover:bg-red-950">
                    SALVAR
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const router = useRouter();

const props = defineProps<{ entry?: Entry }>();

const entry = ref<Entry>(
    props.entry ?? {
        id: 0,
        name: '',
        definition: '',
        notes: '',
        references: '',
        category: {
            id: 0,
            name: ''
        },
        media: [],
        translations: [],
        relatedEntries: []
    }
);

const save = async () => {
    let url = `/api/entries/${entry.value.id}`;
    let method = 'PUT';

    if (entry.value.id === 0) {
        url = '/api/entries';
        method = 'POST';
    }

    const { data: savedEntry } = await useFetch(url, {
        // @ts-ignore
        method: method,
        body: JSON.stringify(entry.value),
    });

    if (savedEntry) {
        // TODO: check Typescript error
        console.log(savedEntry);
        router.push(`/logged/verbetes/editar/${savedEntry.value.id}`);
    }
};


const { data: categories } = await useAsyncData(
  "categories",
  () => $fetch('/api/categories'),
  {
    transform: (categories) =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
  }
);

</script>


<style scoped></style>