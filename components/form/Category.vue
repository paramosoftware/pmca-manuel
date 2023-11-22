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
            />

        <FieldInput 
            id="description" 
            label="Descrição" 
            v-model.trim="object.definition" 
            type="text" 
            textarea
        
            />

        <FieldFinder 
            label="Localização hierárquica" 
            v-model="object.parentId" 
            :default-expanded="object.parentId ?? undefined"
            id="parent"
            :item-id="object.id"
            :tree="tree" />

    </Form>
</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';

const urlPath = 'categoria';
const objectConfig = OBJECTS[urlPath];

const props = defineProps<{ object?: Category }>();

const hasError = ref(false);

const object = ref<Category>(
    props.object ?? {
        id: 0,
        name: '',
        definition: '',
        parentId: 0,
    }
);

const tree = ref({});

const { data: categories } = await useFetchWithBaseUrl('/api/' + objectConfig.singular + '/query', {
    method: 'POST',
    body: JSON.stringify({
        include: ['children', 'entries'],
        orderBy: ['name', 'id']
    })
});

tree.value = useConvertToTreeData(categories.value.data, true, false, object.value.id);

watch(categories, (newVal) => {
    tree.value = useConvertToTreeData(newVal, true, false, object.value.id);
});


const nameRef = ref(null);
const handleError = (error: { error: string, field: string }) => {
    const field = error.field;
    if (field == 'name') {
        hasError.value = true;
        nameRef.value.showError = true;
        nameRef.value.$el.children[1].focus();
    }
};

</script>
