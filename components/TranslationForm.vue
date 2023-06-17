<template>
    <Form 
        singular-name="translation" 
        plural-name="translations" 
        singular-name-pt="tradução" 
        plural-name-pt="traduções"
        :object=translation 
        :is-create="translation.id == 0" 
        :is-standalone=false
        @auxiliary-saved="updateParent"
        >


        <input type="hidden" v-model="translation.entry.id" id="entryId" />

        <FormInput label="Tradução" v-model="translation.name" id="name" type="text" placeholder="Tradução" />

        <FormAutocomplete 
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



</script>
