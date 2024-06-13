<template>
    <UICardContainer>
        <template #header>
            <UIAnchorReturn href="/admin" />
            <UIContainerTitle>Importar</UIContainerTitle>
        </template>
        <div v-if="!importing && !completed">
            <p class="mt-4">
                É possível importar termos para o sistema nos formatos:
                <strong>JSON, CSV, XLXS, SKOS</strong> (extensão .xml ou .rdf) e
                <strong>ZIP</strong> (contendo um dos formatos anteriores).
            </p>
            <p class="mt-4">
                Os dados devem estar no formato correto para que a importação
                seja realizada com sucesso. Abaixo é possível baixar um template
                para cada formato. Arquivos exportados pelo sistema (pelo site
                ou outras instâncias), em qualquer formato, podem ser utilizados
                para importação sem necessidade de alterações.
            </p>

            <p class="mt-4">
                A propriedade/coluna <strong>posicao</strong> é opcional e deve
                ser um número inteiro, representando a posição relativa do termo
                em relação aos seus irmãos. Caso não seja informada, o sistema
                irá atribuir um valor automaticamente com base na ordem de
                importação.
            </p>

            <p class="mt-4">
                Para incluir imagens, é necessário que os arquivos estejam no
                formato <strong>ZIP</strong> e que o nome do arquivo seja o
                mesmo do campo <strong>id</strong> do termo. As imagens devem
                estar no formato <strong>JPG</strong> ou <strong>PNG</strong> e
                estar dentro de uma pasta com o nome <strong>media</strong>.
                Vários arquivos para o mesmo termo são permitidos adicionando um
                número ao final do nome do arquivo com _, por exemplo:
                <strong>id_1.jpg</strong>, <strong>id_2.jpg</strong>,
                <strong>id_3.jpg</strong>.
            </p>

            <p class="mt-4">
                Os <strong>ids</strong> dos termos devem ser únicos e podem ser
                numéricos ou textuais.
            </p>

            <h4 class="mt-4 font-bold">Opções de importação:</h4>

            <ul class="list-disc list-inside mt-4">
                <li class="mb-2">
                    <strong>Mesclar</strong>: Adiciona novos termos e atualiza
                    os existentes (baseado no nome do termo).
                </li>
                <li>
                    <strong>Sobrescrever</strong>: Apaga todos os termos do
                    sistema e importa os novos termos.
                </li>
            </ul>

            <p class="mt-6">
                <UIIcon
                    name="ph:warning"
                    class="h-8 w-8 text-pmca-primary mr-1"
                />
                <strong>Atenção:</strong> A importação de termos é uma operação
                irreversível.
            </p>

            <UDivider class="my-8" />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="px-10">
                    <b>
                        Baixe um arquivo template e preencha com os dados que
                        deseja importar.
                    </b>

                    <span v-for="template in templates" class="block mt-4">
                        <UIIcon
                            name="ph:download"
                            class="h-6 w-6 text-pmca-primary mr-1"
                            @click="onClick(template.ext)"
                        >
                        </UIIcon>
                        {{ template.name }}
                    </span>
                </div>

                <div class="px-10">
                    <FieldDropzone
                        url="/api/concept/import"
                        :max-files="1"
                        :max-filesize="10000000"
                        :accepted-files="acceptedFiles.join(', ')"
                        :params="{ mode: mode }"
                        @finish="updateProgress"
                    >
                        <URadioGroup
                            v-model="mode"
                            :options="options"
                            class="mb-3"
                        />
                    </FieldDropzone>
                </div>
            </div>
        </div>

        <div class="my-0 h-full" v-if="importing">
            <div class="flex flex-col">
                <UProgress
                    class="mt-5"
                    :value="progress"
                    :indicator="progress !== undefined"
                    size="lg"
                    :color="error ? 'red' : 'red'"
                    :ui="{
                        progress: {
                            color: 'text-{color}-700 dark:text-{color}-600'
                        },
                    }"
                />
                <div
                    class="text-center mt-3"
                    :class="error ? 'text-red-700' : 'text-gray-400'"
                >
                    {{ message }}
                </div>

                <div v-if="report" class="mt-5">
                    <UIImportReport :report="report" :has-error="error" />
                </div>

                <div></div>

                <div class="my-5 flex justify-end">
                    <UIButton
                        class="text-end"
                        v-if="completed || error"
                        @click="restart"
                    >
                        Fazer outra importação
                    </UIButton>
                </div>
            </div>
        </div>
    </UICardContainer>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'resource']
});

useHead({
    title: 'Importar | ' + useRuntimeConfig().public.appName
});

const options = [
    {
        value: 'merge',
        label: 'Mesclar (adicionar e atualizar dados existentes)'
    },
    {
        value: 'overwrite',
        label: 'Sobrescrever (apagar todos os dados e importar novos)'
    }
];

const res = ref('');
const progress = ref<number | undefined>();
const report = ref<undefined | ImportReport>();
const message = ref('');
const error = ref(false);
const tries = ref(0);
const maxTries = ref(5);

const mode = ref('merge');
const importing = ref(false);
const completed = ref(false);
const acceptedFiles = ref([
    'application/json',
    'application/xml',
    'application/zip',
    'application/*',
    'text/csv',
    'text/xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const templates = ref([
    { ext: 'xlsx', name: 'XLSX (Excel)' },
    { ext: 'csv', name: 'CSV' },
    { ext: 'json', name: 'JSON' },
    { ext: 'xml', name: 'SKOS (Simple Knowledge Organization System)' }
]);

const restart = () => {
    res.value = '';
    progress.value = 0;
    message.value = '';
    error.value = false;
    importing.value = false;
    completed.value = false;
    tries.value = 0;
};

const updateProgress = async (processId: string) => {
    res.value = processId;
    importing.value = true;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/public/concept/${res.value}/@progress`, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            progress.value = data.progress;

            if (data.progress < 100 && !data.error) {
                setTimeout(() => {
                    updateProgress(processId);
                }, 500);
                message.value = data.message || 'Importando...';
            } else if (data.error) {
                if (tries.value < maxTries.value) {
                    tries.value++;
                    setTimeout(() => {
                        updateProgress(processId);
                    }, 1000);
                    message.value = 'Processando...';
                    progress.value = undefined;
                } else {
                    error.value = true;
                    message.value = data.message || 'Erro ao importar os dados';
                    report.value = data.report || undefined;
                }
            } else {
                completed.value = true;
                message.value = data.message || 'Importação concluída';
                progress.value = 100;
                report.value = data.report || undefined;
            }
        } else {
            error.value = true;
            message.value = 'Erro ao importar os dados';
        }
    };

    xhr.send();
};

// TODO: Template files should be generated by the server
const onClick = (ext: string) => {
    var link = document.createElement('a');
    link.href = '/templates/import.' + ext;
    link.download = 'import.' + ext;
    link.dispatchEvent(new MouseEvent('click'));
};
</script>
