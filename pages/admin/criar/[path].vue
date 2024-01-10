<template>

    <template v-if="pending">
        <div class="flex flex-col justify-center items-center h-screen">
            <Icon class="animate-spin w-40 h-40 mr-5" name="ph:circle-notch" />
            <p class="text-2xl font-bold">Carregando...</p>
        </div>
    </template>

    <template v-else-if="error">
        <Fallback  />
    </template>

    <template v-else>
        <GenericForm :formStore="formStore" />
    </template>
</template>
   
<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
});

const formStore = useFormStore();
destroyStore(formStore);

await formStore.load(useRoute().params.path.toString());

const pending = computed(() => formStore.pending);
const error = computed(() => formStore.error);

onUnmounted(() => {
    destroyStore(formStore);
});

useHead({
    title: 'Criar ' + uncapitalize(formStore.label) + ' | ' + useRuntimeConfig().public.appName
});
</script>
  