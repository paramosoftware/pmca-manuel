<template>

<component :is="component"></component>

</template>
   
<script setup lang="ts">
import { OBJECTS } from '~/config';
definePageMeta({
    middleware: 'auth'
});

const route = useRoute();
const config = useRuntimeConfig();
const path = route.params.path.toString().toLowerCase();
let component: string | Component = 'Fallback';

const validateRoute = () => {
    return OBJECTS[path];
};

if (validateRoute()) {
    const object = OBJECTS[path].form ?? OBJECTS[path].singular;
    const form = 'Form' + capitalize(object);
    component = vueComponentExists(form) ? resolveComponent(form) : 'Fallback';
}

useHead({
    title: 'Criar ' + OBJECTS[path].label + ' | ' + config.public.appName,
});
</script>
  