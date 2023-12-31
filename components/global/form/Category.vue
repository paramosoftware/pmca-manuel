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

        
        <FieldInput
            id="isCategory"
            label=""
            v-model="object.isCategory"
            type="checkbox"
            hidden
            />
        

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
        isCategory: true,
    } as Category
);

const tree = ref({});

const { data: categories } = await useFetchWithBaseUrl('/api/entry/query', {
    method: 'POST',
    body: JSON.stringify({
        where: {
            isCategory: true
        },
        pageSize: -1
    }),
    transform: (categories) =>
        categories.data.map((category: Category) => ({
            id: category.id,
            name: category.name,
            parentId: category.parentId,
        }))
});

tree.value = useConvertToTreeData(categories.value, true, false, object.value.id);

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
