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
        >

        <FieldInput label="Variação" v-model="object.name" id="name" type="text" placeholder="Variação" :show-label="false" :required="true" />

    </Form>
</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';

const urlPath = 'variacao';
const objectConfig = OBJECTS[urlPath];

const props = defineProps<{ object?: Variation }>();

const object = ref<Variation>(
    props.object ?? {
        id: 0,
        name: ''
    }
);

const emit = defineEmits(['update'])

const updateParent = (variation : Variation) => {
    const { entry, ...variationWithoutEntry } = variation;
    emit('update', 'variations', 'add',  variationWithoutEntry)
}

</script>
