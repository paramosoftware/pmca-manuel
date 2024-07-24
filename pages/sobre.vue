<template>
    <PublicPage :title="name">
        <div class="flex flex-col break-words">
            <p>
                O {{ appName }} é é um software livre multiplataforma para a
                gestão e divulgação de vocabulários, desenvolvido como uma das
                atividades do
                <UILink href="https://sites.usp.br/pmca/" class="inline">
                    Projeto Manuel Correia de Andrade
                </UILink>.
                Entre suas principais funções, estão:
            </p>

            <ul class="list-disc list-inside mt-5">
                <li>cadastro de termos em diferentes idiomas;</li>
                <li>
                    edição de termos de maneira hierarquizada com imagens
                    relacionadas;
                </li>
                <li>
                    exportação e importação individualizada e em lote em
                    diferentes formatos;
                </li>
                <li>
                    publicização dos termos cadastrados em um site público com
                    diferentes modos de visualização e busca;
                </li>
            </ul>

            <h2 class="mt-5 text-xl font-bold">Desenvolvimento</h2>

            <p>
                O {{ appName }} foi desenvolvido com o objetivo de ser um
                software de código-aberto, livre e gratuito, de fácil instalação
                e configuração, que pode ser executado em qualquer servidor (com
                Node.js instalado) ou computador pessoal(Windows, Mac e Linux),
                mantendo a mesma interface e funcionalidades.
            </p>

            <p class="mt-5">
                A versão web, hospedada em um servidor, pode ser acessada por
                qualquer dispositivo que tenha acesso à internet, a partir de um
                navegador, podendo servir como um ponto de referência para área
                de terminologia de conservação-restauro. A versão desktop,
                executada em um computador pessoal, pode ser usada em qualquer
                dispositivo desktop, sem a necessidade de acesso à internet,
                podendo servir como um repositório pessoal para gestão de
                vocabulários.
            </p>

            <p class="mt-5">
                A versão web e a versão desktop compartilham o mesmo
                código-fonte, o que permite que as atualizações de
                funcionalidades e correções de bugs sejam aplicadas em ambas as
                versões simultaneamente. Além disso, os dados cadastrados na
                versão web podem ser exportados e importados para a versão
                desktop e vice-versa, o que permite que os usuários possam
                migrar de uma versão para outra sem perderem os dados
                cadastrados. O código-fonte do {{ appName }} está disponível no
                repositório do
                <UILink :href="repository" class="inline">GitHub</UILink>.
            </p>

            <h2 class="mt-5 text-xl font-bold">
                Projeto Manuel Correia de Andrade
            </h2>

            <p>
                O Projeto Manuel Correia de Andrade é formado por um conjunto de
                ações de preservação e divulgação do acervo homônimo, doado ao
                Instituto de Estudos Brasileiros da Universidade de São Paulo
                pela família do acadêmico pernambucano Manuel Correia de
                Andrade.
            </p>

            <section v-for="section in sections" :key="section.title">
                <h2 class="mt-5 text-xl font-bold">
                    {{ section.title }}
                </h2>

                <div class="flex flex-wrap my-5 items-center">
                    <div v-for="item in section.items" :key="item.name">
                        <div class="flex items center">
                            <UILink :href="item.url">
                                <img
                                    :src="`/icons/${item.logo}`"
                                    :alt="`Logo ${item.name}`"
                                    class="w-48 px-6"
                                />
                            </UILink>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </PublicPage>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'public'
});

const config = useRuntimeConfig();
const name = ref('Sobre');
const repository = config.public.repositoryUrl;
const appName = config.public.appName;
const description = ref(
    `Informações sobre o ${appName} e o Projeto Manuel Correia de Andrade`
);

const funding = ref([
    {
        name: 'Banco Nacional de Desenvolvimento Econômico e Social (BNDES)',
        logo: 'logo-bndes.svg',
        url: 'https://www.bndes.gov.br/'
    }
]);

const support = ref([
    {
        name: 'Lei de Incentivo à Cultura',
        logo: 'logo-lei-rouanet.png',
        url: 'https://www.planalto.gov.br/ccivil_03/leis/l8313cons.htm'
    },
    {
        name: 'Ministério da Cultura (MinC)',
        logo: 'logo-minc.png',
        url: 'https://www.gov.br/cultura/pt-br'
    },
    {
        name: 'Fundação da Universidade de São Paulo (FUSP)',
        logo: 'logo-fusp.png',
        url: 'https://www.fusp.org.br/'
    },
    {
        name: 'Instituto de Estudos Brasileiros (IEB)',
        logo: 'logo-ieb.png',
        url: 'https://www.ieb.usp.br/'
    },

]);

const sections = ref([
    {
        title: 'Financiamento',
        items: funding
    },
    {
        title: 'Apoio',
        items: support
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
