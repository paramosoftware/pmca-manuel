<template>
    <Form
        gender-noun="f"
        singular-name="translation" 
        plural-name="translations" 
        singular-name-pt="tradução" 
        plural-name-pt="traduções"
        url-path="traducoes"
        :object=translation 
        :is-create="translation.id == 0" 
        :is-standalone=false
        @auxiliary-saved="updateParent"
        @error="handleError"
        >

        <input type="hidden" v-model="translation.entry.id" id="entryId" />

        <FieldInput 
            id="name" 
            type="text"  
            label="Tradução" 
            required
            v-model="translation.name"
            placeholder="Tradução" 
            />

        <FieldAutocomplete 
            id="language"
            route="languages" 
            :modelValue="translation.language"
            @update="updateModel"
            label="Idioma"  
            :allowCreate="true"
            :multiple="false"
            placeholder="Digite um idioma..."  />


    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ translation?: Translation, entryId: number }>();

const translation = ref<Translation>(
    props.translation ?? {
        id: 0,
        name: '',
        languageId: 0,
        language: {
            id: 0,
            name: ''
        },
        entry: {
            id: props.entryId,
            name: '',
        }
    }
);

const updateModel = (property: string, action: string, item: any) => {
    if (translation.value) {
        if (action === 'add') {
            translation.value[property] = item;
            
        } else if (action === 'remove') {
            translation.value[property] = {id: 0, name: ''}
        }
    }
}

const emit = defineEmits(['update'])

const updateParent = (translation : Translation) => {
    emit('update', 'translations', 'add',  translation)
}

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
