<template>
    <UICardContainer>
        <template #header>
            <UIAnchorReturn href="/admin" />
            <UIContainerTitle>Exportar</UIContainerTitle>
        </template>
        <p class="mt-4">
            Todos os termos disponíveis no site serão exportados no formato
            selecionado. O arquivo gerado pode ser utilizado diretamente na
            funcionalidade de importação da versão de desktop da aplicação
            (disponível <UILink href="#">aqui</UILink>) ou em outros sistemas
            que suportem os formatos disponíveis. Além disso, os dados podem ser
            editados manualmente e importados novamente para o sistema ou
            utilizados para outros fins.
        </p>

        <p class="mt-4">
            Caso a opção <strong>Incluir imagens</strong> esteja marcada, as
            imagens utilizadas nos termos serão exportadas em uma pasta chamada
            <i>media</i>, com o nome do termo como prefixo, em um arquivo
            zipado.
        </p>

        <form class="mt-3 w-full md:w-2/5">
            <div class="mb-3">
                <FieldSelect
                    id="formato"
                    label="Formato"
                    :options="options"
                    :required="true"
                    v-model="format"
                />
            </div>

            <div class="mb-3">
                <FieldCheckbox
                    id="addMedia"
                    label="Incluir imagens"
                    v-model="addMedia"
                />
            </div>

            <div class="mb-3 text-right md:text-left">
                <UIButton
                    type="button"
                    @click="onExport"
                    :disabled="disableExport"
                >
                    Exportar
                </UIButton>
            </div>
        </form>
    </UICardContainer>
</template>

<script setup lang="ts">
const exportData = useExportData();
const format = ref<DataTransferFormat>('xlsx');
const addMedia = ref(false);

const disableExport = computed(() => exportData.loading.value);

async function onExport() {
    const url = `/api/concept/export?format=${format.value}&addMedia=${addMedia.value}`;
    const date = new Date().toISOString().replace(/:/g, '-');
    const ext = addMedia.value ? 'zip' : format.value;
    const fileName = `export-${date}.${ext}`;

    await exportData.download(url, fileName);
}

const options = ref([
    { value: 'xlsx', name: 'XLSX (Excel)' },
    { value: 'csv', name: 'CSV' },
    { value: 'json', name: 'JSON' },
    { value: 'xml', name: 'SKOS (Simple Knowledge Organization System)' }
]);

useHead({
    title: 'Exportar | ' + useRuntimeConfig().public.appName
});
</script>
