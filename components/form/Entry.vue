<template>
    <Form 
        :object=object
        :gender-noun=objectConfig.genderNoun 
        :object-name=objectConfig.singular
        :object-name-plural=objectConfig.plural
        :label=objectConfig.label
        :label-plural=objectConfig.labelPlural
        :url-path=urlPath
        :is-create="object.id == 0"
        @error="handleError"
        >

        <FieldInput 
            id="name"
            ref="nameRef"
            label="Nome" 
            v-model.trim="object.name"  
            type="text" 
            required
            placeholder="Nome do verbete" />

        <FieldQuillEditor label="Definição" v-model="object.definition" id="definition" />

        <FieldQuillEditor label="Notas" v-model="object.notes" id="notes" />

        <FieldFinder 
            label="Categoria" 
            v-model="object.categoryId"
            :default-expanded="object.categoryId ?? undefined"
            id="category"
            :tree="tree" />


        <FieldAutocomplete 
            id="relatedEntries" 
            route="entries"
            :modelValue="object.relatedEntries"
            @update="updateModel"
            label="Verbetes relacionados"
            placeholder="Digite o nome de um verbete..."  />

        
        <FieldModalAuxiliaryForm
            id="variations"
            :items="object.variations"
            label="Variações do termo"
            ref="fieldVariations"
            @update="updateModel"
            >
    
            <FormVariation :entry-id="object.id" @update="updateModel" />
        
        </FieldModalAuxiliaryForm>


        <FieldModalAuxiliaryForm
            id="translations"
            :items="object.translations"
            label="Traduções do termo em outras línguas"
            ref="fieldTranslations"
            @update="updateModel"
            >

            <FormTranslation :entry-id="object.id" @update="updateModel" />
        
        </FieldModalAuxiliaryForm>
        

        <FieldAutocomplete 
            id="references"
            route="references" 
            :modelValue="object.references"
            @update="updateModel"
            label="Referências"  
            placeholder="Adicione referências..."
            :allow-create=true
            :is-html=true
            />


        <FieldMedia 
            id="media" 
            :media="object.media" 
            label="Imagens" 
            :object-id="object.id" 
            @update="updateModel"
            v-if="object.id !== 0" />

    </Form>
</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';

const urlPath = 'verbete';
const objectConfig = OBJECTS[urlPath];

const props = defineProps<{ object?: Entry }>();

const object = ref<Entry>(
    props.object ?? {
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

if(!object.value.categoryId)
{
    for (var i = 0; i < categories.value.length; i++)
    {
        if (categories.value[i].parentId == null)
            object.value.categoryId = categories.value[i].id;
    }
}

const fieldVariations = ref(null);
const fieldTranslations = ref(null);

const updateModel = (property: string, action: string, item: any) => {

    if (object.value && object.value[property]) {

        if (action === 'add') {

            let exists = false;

            if (item.name) {
                exists = object.value[property].find((e) => e.name.toLowerCase() === item.name.toLowerCase());
            } else {
                exists = object.value[property].find((e) => e.id === item.id);
            }   

            if (!exists) {
                object.value[property].push(item);
            }

        } else if (action === 'remove') {
            
            object.value[property] = object.value[property].filter((e) => e.id !== item.id);

        } else if (action === 'update') {

            const index = object.value[property].findIndex((e) => e.id === item.id);
            object.value[property][index] = item;
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
