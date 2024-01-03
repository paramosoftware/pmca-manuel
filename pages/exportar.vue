<template>
    <NuxtLayout name="public">
        <div class="container mx-auto mb-auto p-2">
            <div class="flex flex-col justify-left">

                <UIPageTitle>Exportar</UIPageTitle>

                <p class="mt-4">
                    Todos os verbetes disponíveis no site serão exportados no formato selecionado. 
                    O arquivo gerado pode ser utilizado diretamente na funcionalidade de importação da versão de desktop da aplicação (disponível <UILink href="#">aqui</UILink>) ou 
                    em outros sistemas que suportem os formatos disponíveis. Além disso, os dados podem ser editados manualmente e importados novamente para o sistema ou utilizados para
                    outros fins.
                </p>

                <p class="mt-4">
                    Caso a opção <strong>Incluir imagens</strong> esteja marcada, as imagens utilizadas nos verbetes serão exportadas em uma pasta chamada <i>media</i>, 
                    com o nome do verbete como prefixo, em um arquivo zipado.
                </p>

                <p class="mt-4">
                    Para exportar somente uma parte dos verbetes, selecione os verbetes desejados (utilize o ícone <Icon name="ph:bookmark-simple" class="text-pmca-accent w-6 h-6" />),
                    acesse a página de verbetes selecionados (utilize o ícone <Icon class="text-pmca-accent w-6 h-6" name="ph:bookmarks-simple-fill" /> no menu superior) 
                    e clique na opção "Exportar".
                </p>

                <form class="mt-3 w-full md:w-2/5">
                    <div class="mb-3">
                        <FieldSelect id="formato" label="Formato" :options="options" :required="true" v-model="exportConfig.format" />
                    </div>

                    <div class="mb-3">
                        <FieldCheckbox id="addMedia" label="Incluir imagens" v-model="exportConfig.addMedia" />
                    </div>

                    <div class="mb-3 text-right md:text-left">
                        <UIButton type="button" @click="exportData" :disabled="disableExport">
                            Exportar
                        </UIButton>
                    </div>
                </form>

            </div>
        </div>
    </NuxtLayout>
</template>
  
<script setup lang="ts">
definePageMeta({
    layout: false,
});

const disableExport = ref(false);

const toast = useToast();

async function exportData() {

    disableExport.value = true;

    const exportToast = toast.add({ 
        title: 'Exportando...',
        icon: 'i-heroicons-archive-box-arrow-down',  // TODO: change to ph:download
        ui: { rounded: 'rounded-sm', padding: 'p-5', icon: { color: 'text-pmca-accent' } },
        closeButton: {
            disabled: true
        },
        timeout: 0
    })

    let filename = 'export-' +  Date.now() + '.' + exportConfig.value.addMedia ? 'zip' : exportConfig.value.format.id;

    const response = await fetch('/api/export?format=' + exportConfig.value.format.id + '&addMedia=' + exportConfig.value.addMedia);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const header = response.headers.get('Content-Disposition');
    const parts = header?.split(';');
    if (parts && parts.length > 1) {
        filename = parts[1].split('=')[1].replaceAll("\"", "");
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.remove(exportToast.id);

    disableExport.value = false;
}

const exportConfig = ref({
    format: { id: 'json', name: 'JSON' },
    addMedia: false
});

const options = ref([
   // { id: 'xlxs', name: 'XLXS (Excel)' },
   // { id: 'csv', name: 'CSV' },
    { id: 'json', name: 'JSON' },
    { id: 'xml', name: 'SKOS (Simple Knowledge Organization System)' }
]);

</script>
  