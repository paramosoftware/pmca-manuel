<template>
    <Form 
        gender-noun="m"
        singular-name="entry" 
        plural-name="entries"
        singular-name-pt="verbete" 
        plural-name-pt="verbetes" 
        :object=entry
        :is-create="entry.id == 0"
        url-path="verbetes"
        @auxiliary-saved="console.log('auxiliary-saved', $event)"
        >

        <FormInput 
            id="name"
            label="Nome" 
            v-model="entry.name"  
            type="text" 
            required
            placeholder="Nome do verbete" />

        <FormQuillEditor label="Definição" v-model="entry.definition" id="definition" />

        <FormQuillEditor label="Notas" v-model="entry.notes" id="notes" />

        <FormFinder 
            label="Categoria" 
            v-model="entry.categoryId"
            :default-expanded="entry.categoryId ?? undefined"
            id="category"
            :tree="tree" />


        <FormAutocomplete 
            id="relatedEntries" 
            route="entries"
            :modelValue="entry.relatedEntries"
            @update="updateModel"
            label="Verbetes relacionados"
            placeholder="Digite o nome de um verbete..."  />


        <FormModalAuxiliaryForm
            id="translations"
            :items="entry.translations"
            route="translations"
            :object-id="entry.id"
            label="Traduções" 
            >
    
            <TranslationForm :entry-id="entry.id" @update="updateModel" />
        
        </FormModalAuxiliaryForm>


        <FormAutocomplete 
            id="references"
            route="references" 
            :modelValue="entry.references"
            @update="updateModel"
            label="Referências"  
            placeholder="Adicione referências..."
            :allow-create=true
            />


        <FormMedia 
            id="media" 
            :media="entry.media" 
            label="Imagens" 
            :object-id="entry.id" 
            @update="updateModel"
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
            parentId: category.parentId,
        })),
});

const tree = ref({});

tree.value = useConvertToTreeData(categories.value, true, false, null);

const updateModel = (property: string, action: string, item: any) => {

    console.log('updateModel', property, action, item);

    if (props.entry && props.entry[property]) {

        if (action === 'add') {
            props.entry[property].push(item);

        } else if (action === 'remove') {
            props.entry[property] = props.entry[property].filter((e) => e.id !== item.id);
        }
    }
}

</script>
