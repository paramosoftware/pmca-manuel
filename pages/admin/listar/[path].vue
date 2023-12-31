<template>
    <span v-if="!validateRoute()">
        <Fallback />
    </span>

    <UIList v-else
        :object-name=objectName
        :object-name-plural=objectNamePlural
        :gender-noun=genderNoun
        :label=label
        :label-plural=labelPlural
        :url-path=path
        :is-html=isHtml
        :where="where"
        />
</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';

definePageMeta({
    middleware: 'auth'
});

const route = useRoute();
const config = useRuntimeConfig();
const path = route.params.path.toString().toLowerCase();

let objectName = '';
let objectNamePlural = ''
let genderNoun = '';
let label = '';
let labelPlural = '';
let isHtml = false;
let where = {};

const validateRoute = () => {
    return OBJECTS[path];
};

if (validateRoute()) {
    objectName = OBJECTS[path].singular;
    objectNamePlural = OBJECTS[path].plural;
    genderNoun = OBJECTS[path].genderNoun;
    label = OBJECTS[path].label;
    labelPlural = OBJECTS[path].labelPlural;
    isHtml = OBJECTS[path].isHtml || false;
    where = OBJECTS[path].where || {};
}

useHead({
    title: 'Listar ' + OBJECTS[path].labelPlural + ' | ' + config.public.appName,
});
</script>