<template>
    <Form 
        singular-name="entry" 
        plural-name="entries"
        singular-name-pt="verbete" 
        plural-name-pt="verbetes" 
        :object=entry
        :is-create="entry.id == 0"
        @auxiliary-saved="console.log('auxiliary-saved', $event)"
        >

        <FormInput label="Nome" v-model="entry.name" id="name" type="text" placeholder="Nome do verbete" />

        <FormInput label="Descrição" v-model="entry.definition" id="definition" type="text" textarea
            placeholder="Definição do verbete" />

        <FormInput label="Notas" v-model="entry.notes" id="notes" type="text" textarea placeholder="Notas do verbete" />

        <FormInput label="Referências" v-model="entry.references" id="references" type="text" textarea
            placeholder="Referências do verbete" />

        <FormSelect v-model="entry.categoryId" :label="'Categoria'" :options="categories" />

        <FormAutocomplete 
            id="relatedEntries" 
            :modelValue="entry.relatedEntries"
            @update:modelValue="entry.relatedEntries = $event" 
            label="Verbetes relacionados"  
            :searchFunction="searchEntries" 
            placeholder="Digite o nome de um verbete..."  />


        <FormModalAuxiliaryForm
            id="translations"
            :items="entry.translations"
            route="translations"
            :object-id="entry.id"
            label="Traduções" 
            @update-translation="console.log('update-translation', $event)"
            >
            
  
            <TranslationForm :entry-id="entry.id" />
        
        </FormModalAuxiliaryForm>

        <span v-if="entry.id !== 0">

            <div class="mt-4">
                <Button label="ADICIONAR ARQUIVOS" @click="isOpen = true" />
                <UModal v-model="isOpen" :ui = "{ width: 'max-w-5xl', rounded: '' }">
                    <UCard :ui="{ rounded: '' }">
                        <template #header>
                            <span class="text-2xl text-black">
                                Upload de arquivos
                            </span>
                        </template>

                        <FormDropzone :entry-id="entry.id" />

                    </UCard>
                </UModal>
            </div>

        </span>

    </Form>
</template>

<script setup lang="ts">
const isOpen = ref(false)

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

const searchEntries = async (searchTerm:string) => {
 
  const { data: entries } = await useFetchWithBaseUrl('api/entries/autocomplete', {params: {q: searchTerm}})

  return entries.value.map((entry: Entry) => ({
    id: entry.id,
    name: entry.name,
    })).filter((entry: Entry) =>
        props.entry ? entry.id !== props.entry.id : true
    )

}
</script>
