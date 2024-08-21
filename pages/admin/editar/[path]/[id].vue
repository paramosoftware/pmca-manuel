<template>
    <template v-if="pending">
        <div class="flex flex-col justify-center items-center h-screen">
            <UIIcon
                class="animate-spin w-40 h-40 mr-5"
                name="ph:circle-notch"
            />
            <p class="text-2xl font-bold">Carregando...</p>
        </div>
    </template>

    <template v-else-if="error">
        <Fallback />
    </template>

    <template v-else>
        <Form :formStore="formStore" />
    </template>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'resource']
});

const formStore = useFormStore();
const route = useRoute();

await formStore.load(
    route.params.path.toString(),
    route.params.id.toString()
);

const pending = computed(() => formStore.pending);
const error = computed(() => formStore.error);

onUnmounted(() => {
    destroyStore(formStore);
});

useHead({
    title:
        'Editar ' +
        uncapitalize(formStore.label) +
        ' | ' +
        useRuntimeConfig().public.appName
});
</script>
