<template>
    <Form 
        singular-name="translation" 
        plural-name="translations" 
        singular-name-pt="tradução" 
        plural-name-pt="traduções"
        :object=translation 
        :is-create="translation.id == 0" 
        :is-standalone=false
        @auxiliary-saved="updateTranslation"
        >


        <input type="hidden" v-model="translation.entry.id" id="entryId" />

        <FormInput label="Tradução" v-model="translation.name" id="name" type="text" placeholder="Tradução" />


        <FormAutocomplete 
            id="language" 
            :modelValue="translation.language"
            @update:modelValue="translation.language = $event" 
            label="Idioma"  
            :searchFunction="searchLanguages" 
            :allowCreate="true"
            :multiple="false"
            :createFunction="createLanguage"
            placeholder="Digite um idioma..."  />


    </Form>
</template>

<script setup lang="ts">

const props = defineProps<{ translation?: Translation, entryId: number }>();

const searchLanguages = async (searchTerm:string) => {
 
 const { data: languages } = await useFetchWithBaseUrl('api/languages/autocomplete', {params: {q: searchTerm}})

 return languages.value.map((language: Language) => ({
   id: language.id,
   name: language.name,
   }))
}

const createLanguage = async (languageName: string) => {
    const { data: language } = await useFetchWithBaseUrl('api/languages', {method: 'POST', body: {name: languageName}})
    return language.value
}

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


const emit = defineEmits(['updateTranslationList'])

const updateTranslation = (translation : Translation) => {
    const { id, name } = translation
    emit('updateTranslationList', { id, name })
}

</script>
