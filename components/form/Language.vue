<template>
    <Form 
        gender-noun="m"
        singular-name="language" 
        plural-name="languages"
        singular-name-pt="idioma"
        plural-name-pt="idiomas"
        url-path="idiomas"
        :object=language
        :is-create="language.id == 0"
        @error="handleError"
        >

        <FormInput 
            id="name"
            ref="nameRef"
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

const nameRef = ref(null);
const handleError = (error: { error: string, field: string }) => {
    const field = error.field;
    if (field == 'name') {
        nameRef.value.showError = true;
        nameRef.value.$el.children[1].focus();
    }
};


</script>
