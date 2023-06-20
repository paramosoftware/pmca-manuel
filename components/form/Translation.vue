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
            label="Termo traduzido" 
            required
            v-model="translation.name"
            placeholder=""
            ref="name"
            />

        <FieldSelect 
            label="Idioma" 
            v-model="translation.language.id" 
            id="language" 
            :options="languageOptions" 
            :mandatory="true"
        />

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
            name: '',
        },
        entry: {
            id: props.entryId,
            name: '',
        }
    }
);

const { data: languages } = await useFetchWithBaseUrl('/api/languages');

const languageOptions = computed(() => {
    const arrLanguages = [];

    for (var i = 0; i < languages.value.length; i++) {           
        arrLanguages.push({id: languages.value[i].id, textValue: languages.value[i].name});
    }

    translation.value.language.id = languages.value[0].id;

    return arrLanguages;
});

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