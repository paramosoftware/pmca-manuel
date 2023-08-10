<template>
    <Form 
        gender-noun="f"
        singular-name="web-page" 
        plural-name="web-pages"
        singular-name-pt="página"
        plural-name-pt="páginas"
        url-path="paginas"
        :object=webPage 
        :is-create="webPage.id == 0"
        @error="handleError"
        >

        <FieldInput 
            id="name"
            ref="nameRef" 
            label="Título" 
            v-model.trim="webPage.name"
            type="text" 
            required
            />

        <FieldInput
            id="slug"
            ref="codeRef"
            label="Nome no menu"
            v-model.trim="webPage.menuName"
            type="text"
            required
            />

        <FieldQuillEditor
            id="name"
            ref="nameRef"
            required
            v-model.trim="webPage.content"
            label="Conteúdo"
            />

    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ webPage?: WebPage }>();

const webPage = ref<WebPage>(
    props.webPage ?? {
        id: 0,
        name: '',
        menuName: '',
        content: '',
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