<template>
    <PublicPage :title="name">
        <div class="flex flex-col break-all">
            Faça o download da última versão do {{ appName }} (v{{ version }})
            de acordo com o seu sistema operacional. As versões disponíveis são:

            <div class="md:flex md:flex-row justify-center md:space-x-5">
                <div
                    v-for="option in downloadOptions"
                    :key="option.name"
                    class="flex flex-col items-center mt-5"
                >
                    <UILink
                        :href="`${downloadLink}.${option.ext}`"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <UIButton>
                            <UIIcon :name="option.icon" variant="button" />
                            {{ option.name }}
                        </UIButton>
                    </UILink>
                </div>
            </div>

            <div class="mt-5">
                As instruções de instalação e uso estão disponíveis no
                <UILink href="/manual" class="inline">Guia de Instalação</UILink>.
            </div>

            <div class="mt-5">
                O código fonte do {{ appName }} está disponível no repositório do
                <UILink :href="repository" class="inline">GitHub</UILink>. O código é
                licenciado sob a licença MIT, o que significa que você pode
                modificar e distribuir o código como desejar.
            </div>
        </div>
    </PublicPage>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

const config = useRuntimeConfig();
const name = ref('Download');
const repository = config.public.repositoryUrl;
const appName = config.public.appName;
const version = config.public.appVersion;
const description = ref(`Download da última versão do ${appName} (${version})`);
const downloadLink = ref(`${repository}/releases/download/${version}/pmca-manuel-${version}`);

const downloadOptions = ref([
    {
        name: 'Windows',
        ext: 'exe',
        icon: 'ph:windows-logo'
    },
    {
        name: 'Mac',
        ext: 'dmg',
        icon: 'ph:apple-logo'
    },
    {
        name: 'Ubuntu/Debian (deb)',
        ext: 'deb',
        icon: 'ph:linux-logo'
    },
    {
        name: 'Linux (AppImage)',
        ext: 'AppImage',
        icon: 'ph:linux-logo'
    }
]);

useSeoMeta({
    title:
        name.value !== config.public.appName
            ? `${config.public.appName} | ${name.value}`
            : config.public.appName,
    description: description.value,
    ogTitle: name.value,
    ogDescription: description.value
});
</script>
