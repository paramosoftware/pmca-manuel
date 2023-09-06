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
        :is-standalone=false
        @form-submitted="updateParent"
        @error="handleError"
        >

        <FieldInput 
            id="name" 
            type="text"  
            label="Termo traduzido" 
            required
            v-model="object.name"
            placeholder=""
            ref="name"
            />

        <FieldSelect 
            label="Idioma" 
            v-model="object.language.id" 
            id="language" 
            :options="languages" 
            :mandatory="true"
        />

    </Form>
</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';

const urlPath = 'traducao';
const objectConfig = OBJECTS[urlPath];

const props = defineProps<{ object?: Translation, entryId: number }>();

const object = ref<Translation>(
    props.object ?? {
        id: 0,
        name: '',
        language: {
            id: 0,
            name: '',
        },
        entry: {
            id: props.entryId,
            name: '',
        }
    }
);

const { data: languages } = await useFetchWithBaseUrl('/api/languages', {
    transform: (languages) =>
        languages.map((language: Language) => ({
            id: language.id,
            name: language.name
        })),
});

const emit = defineEmits(['update'])

const updateParent = (translation : Translation) => {
    emit('update', 'translations', 'add',  {
        id: translation.id, name: translation.name, languageId: translation.language.id
    })
}

const nameRef = ref(null);
const handleError = (error: { error: string, field: string }) => {
    const field = error.field;
    if (field == 'name') {
        nameRef.value.showError = true;
        nameRef.value.$el.children[1].focus();
    }
};

</script>

<script lang="ts">

export default {
    mounted () {
        this.$nextTick(() => this.$refs["name"].$el.children[1].focus());
    }
} 
 
</script>