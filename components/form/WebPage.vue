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
            label="Título" 
            v-model.trim="object.name"
            type="text" 
            required
            />

        <FieldInput
            id="slug"
            ref="codeRef"
            label="Nome no menu"
            v-model.trim="object.menuName"
            type="text"
            required
            />

        <FieldQuillEditor
            id="content"
            required
            v-model.trim="object.content"
            label="Conteúdo"
            />

    </Form>
</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';

const urlPath = 'pagina';
const objectConfig = OBJECTS[urlPath];

const props = defineProps<{ object?: WebPage }>();

const object = ref<WebPage>(
    props.object ?? {
        id: 0,
        name: '',
        menuName: '',
        content: '',
        slug: ''
    }
);

const nameRef = ref(null);
const handleError = (error: { error: string, field: string }) => {
    const field = error.field;
    if (field == 'name') {
        nameRef.value.showError = true;
        nameRef.value.$el.children[1].focus();
    }
};

</script>