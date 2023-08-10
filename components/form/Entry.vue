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
        @error="handleError"
        >

        <FieldInput 
            id="name"
            ref="nameRef"
            label="Nome" 
            v-model.trim="entry.name"  
            type="text" 
            required
            placeholder="Nome do verbete" />

        <FieldQuillEditor label="Definição" v-model="entry.definition" id="definition" />

        <FieldQuillEditor label="Notas" v-model="entry.notes" id="notes" />

        <FieldFinder 
            label="Categoria" 
            v-model="entry.categoryId"
            :default-expanded="entry.categoryId ?? undefined"
            id="category"
            :tree="tree" />


        <FieldAutocomplete 
            id="relatedEntries" 
            route="entries"
            :modelValue="entry.relatedEntries"
            @update="updateModel"
            label="Verbetes relacionados"
            placeholder="Digite o nome de um verbete..."  />

        
        <FieldModalAuxiliaryForm
            id="variations"
            :items="entry.variations"
            label="Variações do termo"
            ref="fieldVariations"
            @update="updateModel"
            >
    
            <FormVariation :entry-id="entry.id" @update="updateModel" />
        
        </FieldModalAuxiliaryForm>


        <FieldModalAuxiliaryForm
            id="translations"
            :items="entry.translations"
            label="Traduções do termo em outras línguas"
            ref="fieldTranslations"
            @update="updateModel"
            >

            <FormTranslation :entry-id="entry.id" @update="updateModel" />
        
        </FieldModalAuxiliaryForm>
        

        <FieldAutocomplete 
            id="references"
            route="references" 
            :modelValue="entry.references"
            @update="updateModel"
            label="Referências"  
            placeholder="Adicione referências..."
            :allow-create=true
            />


        <FieldMedia 
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
        slug: '',
        definition: '',
        notes: '',
        references: [],
        categoryId: 0,
        media: [],
        variations: [],
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

if(!entry.value.categoryId)
{
    for (var i = 0; i < categories.value.length; i++)
    {
        if (categories.value[i].parentId == null)
            entry.value.categoryId = categories.value[i].id;
    }
}

const fieldVariations = ref(null);
const fieldTranslations = ref(null);

const updateModel = (property: string, action: string, item: any) => {


    if (entry.value && entry.value[property]) {

        if (action === 'add') {

            const exists = entry.value[property].find((e) => e.name.toLowerCase() === item.name.toLowerCase());

            if (!exists) {
                entry.value[property].push(item);
            }

        } else if (action === 'remove') {
            entry.value[property] = entry.value[property].filter((e) => e.id !== item.id);
        }
    }

    if (property == "variations")
        fieldVariations.value.isOpenModal = false;
    else if (property == "translations")
        fieldTranslations.value.isOpenModal = false;
}

const nameRef = ref(null);

const handleError = (error: { error: string, field: string }) => {
    const field = error.field;
    if (field == 'name' || field == 'slug') {
        nameRef.value.showError = true;
        nameRef.value.$el.children[1].focus();
    }
};
</script>
