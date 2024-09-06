<template>
    <PublicPage :title="name">
        <div class="flex flex-col">
            <p>
                MANUEL é um software de terminologia de conservação de livros e documentos gráficos desenvolvido para
                cobrir
                uma lacuna: a inexistência de um glossário visual digital no idioma português, a partir de conceitos
                desenvolvidos na prática local. Trata-se de uma ferramenta, para consulta adaptável às necessidades
                específicas de cada acervo. Um dos principais requisitos do software é o amplo acesso, não sendo
                mandatório
                ter um servidor próprio para utilizá-lo. Outros requisitos: código aberto, para atualizações pelo
                usuário;
                licença não proprietária, sem custo, independente do tempo de utilização ou quantidade de dados;
                arquitetura
                amigável, considerando um quadro funcional não especializado, contexto das instituições pequenas e
                médias no
                país; design funcional e agradável.
            </p>

            <p>
                O glossário é um conjunto de conceitos, uma lista de palavras, de um determinado campo do conhecimento e
                sua
                principal função é eliminar as ambiguidades, explicar os termos e facilitar o acesso à informação. O
                principal objetivo dessa ferramenta é fornecer uma terminologia rica em exemplos visuais, que contribua
                para: a identificação de alterações produzidas por agentes de deterioração, elaboração de fichas de
                diagnóstico, descrição em documentos e editais, compartilhamento de informação com pares, e muitas
                outras
                ações intrínsecas à gestão de coleções. A ferramenta é importante para as instituições de guarda no
                contexto
                brasileiro, de reduzida capacitação técnica e escassez de recursos e de acesso à informação organizada e
                aplicável.
            </p>

            <p>
                Iniciado o desenvolvimento em março de 2023, o Manuel tornou-se um software livre multiplataforma
                para a
                gestão e divulgação de vocabulários utilizados na área de conservação de acervos bibliográficos e
                documentais. Entre suas principais funções, estão:
                cadastros e edição de termos de maneira hierarquizada com imagens relacionadas; exportação e importação
                individualizada e em lote em diferentes formatos; difusão dos termos cadastrados em um site público com
                diferentes modos de visualização e busca.
            </p>

            <p>
                MANUEL foi desenvolvido com o objetivo de ser um software de código-aberto, livre e gratuito, de fácil
                instalação e configuração, que pode ser executado em qualquer servidor (com Node.js instalado) ou
                computador
                pessoal, mantendo a interface e funcionalidades. A versão web, hospedada em um servidor, pode ser
                acessada
                por qualquer dispositivo que tenha acesso à internet, a partir de um navegador. A versão desktop,
                executada
                em um computador pessoal, pode ser usada em qualquer dispositivo desktop, sem a necessidade de acesso à
                internet, podendo servir como um repositório individual para gestão de vocabulários.
            </p>

            <p>
                A versão web e a versão desktop compartilham o mesmo código-fonte, o que permite que as atualizações de
                funcionalidades e correções de bugs sejam aplicadas em ambas as versões simultaneamente. Além disso, os
                dados cadastrados na versão web podem ser exportados e importados para a versão desktop e vice-versa, o
                que
                permite aos usuários migrarem de uma versão para outra sem perderem os dados cadastrados.
            </p>

            <h2 class="mt-5 text-xl font-bold">Requisitos</h2>

            <p>
                MANUEL é um software de código livre e aberto, desenvolvido pela Páramo Software, em TypeScript. A
                versão
                web foi desenvolvida com os frameworks Nuxt, Prisma e Express.js, enquanto a versão desktop foi criada
                com o
                framework Electron. Com um código-fonte único, disponível no
                <UILink :href="repository" class="inline">
                    GitHub</UILink>, o Manuel pode receber
                contribuições
                de qualquer pessoa, pode ser usado em qualquer servidor Linux com Node.js instalado ou em desktop com
                Windows, Linux ou MacOS. Para o seu funcionamento, o software MANUEL requer: 4GB de memória RAM e 15GB
                de espaço em disco (dependendo das imagens associadas aos termos);

            </p>

            <h2 class="mt-5 text-xl font-bold">Distribuição</h2>

            <p>

                O Manuel tem duas opções de distribuição. 1) A instalação em desktop, contendo um pacote de arquivos
                para
                servidor distribuída em arquivos executáveis, específicos para cada plataforma, que podem ser baixados e
                instalados em qualquer computador pessoal. 2) A versão para servidor, distribuída em um arquivo
                compactado,
                que deve ser descompactado, configurado e executado de acordo com as instruções a serem disponibilizadas
                na
                documentação, presente no repositório de download (Github) do Manuel. A distribuição é gratuita, sem
                a
                necessidade de cadastro, em uma página do site público, onde os usuários podem baixar o pacote de
                instalação
                para desktop. Os links para download estarão conectados ao repositório no GitHub, onde estarão
                disponíveis o
                código-fonte, a documentação e os pacotes de instalação.
            </p>

            <h2 class="mt-5 text-xl font-bold">Ficha Técnica</h2>

            <section v-for="credit in credits" :key="credit.name">
                <h3 class="mt-5 text-lg font-bold">{{ credit.name }}</h3>
                <p>{{ credit.value }}</p>
            </section>

            <h2 class="mt-5 text-xl font-bold">
                PROJETO MANUEL CORREIA DE ANDRADE
            </h2>

            <p>
                O <UILink href="https://sites.usp.br/pmca/" class="inline">
                    Projeto Manuel Correia de Andrade
                </UILink>, composto por um conjunto de ações de preservação e extroversão do
                acervo de mesmo nome, doado pela família do titular ao Instituto de Estudos Brasileiros da Universidade
                de
                São Paulo, foi desenvolvido com o apoio do Banco Nacional de Desenvolvimento Econômico e Social BNDES
                através da Lei Federal de Incentivo à Cultura, de junho de 2022 à julho de 2024 na sede do IEB/USP.
            </p>
            <p>
                O principal objetivo do Projeto foi integrar a coleção bibliográfica e documental que pertenceu ao
                acadêmico
                pernambucano ao acervo do IEB garantindo amplo acesso deste patrimônio cultural ao público. Entre as
                ações
                de preservação previstas, o Projeto realizou até o momento a higienização de 24.671 livros e periódicos,
                com
                a catalogação de mais de 11.500 livros que já se encontram disponíveis para consulta. Mais de 30 metros
                lineares de documentação textual também passaram por tratamento de higienização, com a descrição
                unitária de
                3.132 documentos e a digitalização de 545 itens.
            </p>

            <p>
                Por iniciativa do Coordenador, Prof. Dr. Alexandre de Freitas Barbosa, foi constituída uma Comissão
                Científica (Acadêmica) do Projeto composta por docentes e pesquisadores das áreas de Geografia, Economia
                e
                História da Universidade de São Paulo, Universidade Federal de Pernambuco, Universidade Federal Rural de
                Pernambuco, Universidade Estadual de Pernambuco e Fundação Joaquim Nabuco, com o objetivo de ampliar as
                ações de extroversão do Projeto, atualizar a relevância da produção teórica de Manuel Correia de
                Andrade,
                refletida em seu acervo, e fortalecer uma rede de acervos relacionados.
            </p>

            <p>
                Outras atividades desenvolvidas pelo projeto:
            </p>

            <section v-for="activity in activities" :key="activity.title">
                <h3 class="mt-5 text-lg font-bold">{{ activity.title }}</h3>

                <ul class="list-disc list-inside mt-5">
                    <li v-for="item in activity.items" :key="item.name">
                        <span class="italic">{{ item.name }}</span>
                        <span v-if="item.date">, {{ item.date }}</span>
                        <span v-if="item.location">, {{ item.location }}</span>
                        <span v-if="item.speaker">, {{ item.speaker }}</span>
                    </li>
                </ul>
            </section>

            <section v-for="section in sections" :key="section.title">
                <h2 class="mt-5 text-xl font-bold">
                    {{ section.title }}
                </h2>

                <div class="flex flex-wrap my-5 items-center">
                    <div v-for="item in section.items" :key="item.name">
                        <div class="flex items-center mx-10 my-5">
                            <UILink :href="item.url">
                                <img :src="`/icons/${item.logo}`" :alt="`Logo ${item.name}`" class="w-48 px-5" />
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


const support = ref([
    {
        name: 'Banco Nacional de Desenvolvimento Econômico e Social (BNDES)',
        logo: 'logo-bndes.svg',
        url: 'https://www.bndes.gov.br/'
    },
    {
        name: 'Ministério da Cultura (MinC)',
        logo: 'logo-minc.png',
        url: 'https://www.gov.br/cultura/pt-br'
    },
    {
        name: 'Projeto Manuel Correia de Andrade',
        logo: 'logo-pmca-full.png',
        url: 'https://sites.usp.br/pmca/'
    },
    {
        name: 'Fundação da Universidade de São Paulo (FUSP)',
        logo: 'logo-fusp.png',
        url: 'https://www.fusp.org.br/'
    },
]);

const sections = ref([
    {
        title: 'Apoio',
        items: support
    }
]);


const credits = ref([
    {
        name: 'Coordenação do Projeto Manuel Correia de Andrade',
        value: 'Prof. Dr. Alexandre de Freitas Barbosa e Prof. Dr. Jaime Tadeu Oliva'
    },
    {
        name: 'Coordenação Técnica do Projeto Manuel Correia de Andrade',
        value: 'Caetana Britto e Leandro Melo'
    },
    {
        name: 'Desenvolvimento do aplicativo Manuel',
        value: 'Páramo Software - Frederico Camargo e Matheus Silva'
    },
    {
        name: 'Coordenação de desenvolvimento e pesquisa do Glossário de conservação de obras em papel',
        value: 'Leandro Melo'
    },
    {
        name: 'Pesquisa e redação do Glossário de conservação de obras em papel',
        value: 'Leandro Melo e Ana Paula Hirata Tanaka'
    },
    {
        name: 'Colaboração',
        value:
            'Alessandra França Barbosa, Otavio Boszczovski, Silvana Bojanoski, Rejane Elias Clemencio, Gabriel Moore Beviláqua, Gilcy Rodrigues Azevedo, Islana Carla Ferreira Da Silva, Joana Assef Neves e estagiários do projeto: Pedro Baptista, Mylena Bertolo, Bianca Cruz, Marcos Castro e Priscila Gomes'
    },
    {
        name: 'Imagens',
        value: 'Estúdio Garagem'
    },
    {
        name: 'Identidade Visual',
        value: 'Yves Ribeiro'
    }
]);


const activities = ref(
    {
        seminars: {
            title: 'Seminários',
            items: [
                {
                    name: 'O Brasil de Manuel Correia de Andrade: Interpretações, Diálogos e Acervos',
                    date: '26 a 29 de setembro de 2023',
                    location: 'FFLCH/USP'
                }
            ]
        },
        courses: {
            title: 'Cursos',
            items: [
                {
                    name: 'Microbiologia de Acervos',
                    date: '24 e 31/05 e 07 e 14/06 de 2023',
                    location: 'IEB/USP'
                }
            ]
        },
        webinars: {
            title: 'Webinários',
            items: [
                {
                    name: 'A terminologia de Conservação no contexto dos arquivos e bibliotecas',
                    date: '15/12/2022',
                    speaker: 'Mestre Alessandra Barbosa'
                },
                {
                    name: 'Terminologia, termos e conceitos na área de conservação-restauração de obras em papel',
                    date: '28/04/2023',
                    speaker: 'Profa. Dra. Silvana Bojanoski'
                },
                {
                    name: 'Irradiação de obras em papel como tratamento de infestações: Ação emergencial ou procedimento de rotina?',
                    date: '15/06/2023',
                    speaker: 'Dra. Fernanda Mokdessi Auada'
                },
                {
                    name: 'Produção do espaço e interdisciplinaridade na obra de Manuel Correia de Andrade',
                    date: '08/08/2023',
                    speaker: 'Profa. Dra. Ana Regina Marinho'
                },
                {
                    name: 'Seminário Internacional sobre Contaminação por Inseticidas em Acervos',
                    date: '30/07/2024',
                    speaker: 'Arquivo Público do Estado de São Paulo'
                }
            ]
        },
        openClasses: {
            title: 'Aulas Abertas',
            items: [
                {
                    name: 'A Formação da Escola Paulista de Geografia',
                    date: '23/02/2023',
                    location: 'auditório do IEB',
                    speaker: 'Profa. Dra. Larissa Alves de Lira'
                },
                {
                    name: 'A formação territorial do nordeste brasileiro em Manuel Correia de Andrade: um estudo sobre a sua atualidade',
                    date: '14/11/2023',
                    location: 'sala de defesas do IEB',
                    speaker: 'Profa. Dra. Maria Rita Ivo de Melo Machado e Gerlane Gomes da Rocha'
                },
                {
                    name: 'A Terra e o Homem no Nordeste - ferramenta transdisciplinar para o entendimento do Nordeste',
                    date: '30/04/2024',
                    location: 'auditório do IEB',
                    speaker: 'Professor Doutor Gevson Silva Andrade'
                }
            ]
        },
        visits: {
            title: 'Visitas',
            items: [
                {
                    name: 'O Brasil de Manuel Correia de Andrade: Interpretações, Diálogos e Acervos',
                    date: '28 e 29 de setembro de 2023',
                    location: 'IEB'
                },
                {
                    name: '16ª Semana de Biblioteconomia da ECA/USP',
                    date: '04/10/2023'
                },
                {
                    name: 'Alunos da UFRJ',
                    date: '08/12/2023'
                }
            ]
        }
    }
)

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


<style scoped>
p {
    margin-bottom: 0.5rem;
}
</style>