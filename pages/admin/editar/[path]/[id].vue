<template>
    <component :is="component" :object="object"></component>
</template>

<script setup lang="ts">
import { OBJECTS } from '~/config';
definePageMeta({
    middleware: 'auth'
});

const config = useRuntimeConfig();
const route = useRoute();
const path = route.params.path.toString().toLowerCase();
const id = route.params.id.toString();
const object = ref({});

const validateRoute = () => {
    return OBJECTS[path] && isNaN(parseInt(id)) === false;
};

const form = 'Form' + useCapitalize(OBJECTS[path].singular);
let component = validateRoute() && useComponentExists(form) ? resolveComponent(form) : 'Fallback';


if (component !== 'Fallback') {

    const { data } = await useFetchWithBaseUrl('/api/' + OBJECTS[path].plural + '/' + id);
    object.value = data.value as unknown as any;

    if (!object.value) {
        component = 'Fallback';
    }
}

useHead({
    title: 'Editar ' + OBJECTS[path].label + ' | ' + config.public.appName,
});
</script>