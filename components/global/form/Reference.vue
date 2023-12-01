<template>
    <Form 
        :object=object
        :gender-noun=objectConfig.genderNoun 
        :object-name=objectConfig.singular
        :object-name-plural=objectConfig.plural
        :label=objectConfig.label
        :label-plural=objectConfig.labelPlural
        :url-path=urlPath
        :is-create="object.id === 0"
        @error="handleError"
        >

        <FieldQuillEditor
            id="name"
            ref="nameRef"
            required
            v-model.trim="object.name"
            label="Referência" 
            />

    </Form>
</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';

const urlPath = 'referencia';
const objectConfig = OBJECTS[urlPath];

const props = defineProps<{ object?: Reference }>();

const object = ref<Reference>(
    props.object ?? {
        id: 0,
        name: '',
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
