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

        <FormQuillEditor label="Definição" v-model="entry.definition" id="definition" />

        <FormQuillEditor label="Notas" v-model="entry.notes" id="notes" />

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


        <FormAutocomplete 
            id="references" 
            :modelValue="entry.references"
            @update:modelValue="entry.references = $event" 
            label="Referências"  
            :searchFunction="searchReferences"
            placeholder="Adicione referências..."
            :allow-create=true
            :create-function="createReference"
            
            
            />


        <FormMedia 
            id="media" 
            :media="entry.media" 
            label="Imagens" 
            :object-id="entry.id" 
            @remove:media="removeMedia"
            v-if="entry.id !== 0" />

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
        references: [],
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

const searchReferences = async (searchTerm:string) => {
 
  const { data: references } = await useFetchWithBaseUrl('api/references/autocomplete', {params: {q: searchTerm}})

  return references.value.map((reference: Reference) => ({
        id: reference.id,
        name: reference.name,
    }))

}

const createReference = async (reference: string) => {
    const { data: language } = await useFetchWithBaseUrl('api/references', {method: 'POST', body: {name: reference}})
    return language.value
}

const removeMedia = (media: Media) => {
    props.entry.media = props.entry.media.filter((m: Media) => m.id !== media.id);
}

</script>
