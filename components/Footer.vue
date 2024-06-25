<template>
    <footer
        class="p-4 border-t-2 bg-white shadow-md rounded-md text-gray-400 text-xs"
    >
        <div class="md:flex flex-row justify-center md:justify-between items-center">
            <div class="flex flex-col items-center md:items-start">
                <p>{{ title }}</p>
                <p>Versão {{ version }}</p>
            </div>
            <div class="flex flex-col items-center md:items-start">
                <a href="https://sites.usp.br/pmca/" target="_blank" rel="noopener">
                    Projeto Manuel Correia de Andrade (PMCA)
                </a>
                <a href="https://paramosoftware.com.br/" target="_blank" rel="noopener">
                    Desenvolvimento por Páramo Software
                </a>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const title = ref(config.public.appName);
const version = ref(config.public.appVersion);
</script>
