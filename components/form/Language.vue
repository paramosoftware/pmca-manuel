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

        <FormInput label="Nome" type="text" v-model="language.name" />

        <FormInput label="Sigla" type="text" v-model="language.code" />

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
