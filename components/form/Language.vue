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
            type="text" 
            required
            v-model.trim="object.name" 
            />

        <FieldInput 
            id="code"
            label="Sigla" 
            type="text" 
            v-model.trim="object.code" 
            />

    </Form>
</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';

const urlPath = 'idioma';
const objectConfig = OBJECTS[urlPath];

const props = defineProps<{ object?: Language }>();

const object = ref<Language>(
    props.object ?? {
        id: 0,
        name: '',
        code: ''
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
