<template>
    <Form 
        gender-noun="m"
        singular-name="language" 
        plural-name="languages"
        singular-name-pt="idioma"
        plural-name-pt="idiomas"
        url-path="idiomas"
        :object=language
        :is-create="language.id == 0">

        <FormInput 
            id="name"
            label="Nome" 
            type="text" 
            required
            v-model.trim="language.name" 
            />

        <FormInput 
            id="code"
            label="Sigla" 
            type="text" 
            v-model.trim="language.code" 
            />

    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ language?: Language }>();

const language = ref<Language>(
    props.language ?? {
        id: 0,
        name: '',
        code: ''
    }
);
</script>
