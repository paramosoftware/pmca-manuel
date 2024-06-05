<template>
    <footer
        class="p-4 border-t-2 bg-white shadow-md rounded-md text-gray-400 text-xs"
    >
        <div class="md:flex flex-row justify-center md:justify-between items-center">
            <div class="flex flex-col items-center md:items-start">
                <p>Nome da aplicação</p>
                <p>Versão x.x.x</p>
            </div>
            <div class="flex flex-col items-center md:items-start">
                <p>Projeto Manuel Correia de Andrade (PMCA)</p>
                <p>Desenvolvimento por Páramo Software</p>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const router = useRouter();
const path = router.currentRoute.value.path;

const config = useRuntimeConfig();
const title = ref(config.public.appName);
const blockTitle = ref('');

if (title.value.length > 30) {
    title.value = title.value.substring(0, title.value.indexOf(' ', 30));
    blockTitle.value = config.public.appName.replace(title.value, '');
}
</script>
