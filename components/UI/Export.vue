<template>
    <div class="flex flex-col justify-left">
        <p class="mt-4">
            Os dados exportados serão gerados de acordo com o recurso
            selecionado. O arquivo gerado pode ser utilizado diretamente na
            funcionalidade de importação da versão de desktop da aplicação
            (disponível <UILink href="#">aqui</UILink>) ou em outros sistemas
            que suportem os formatos disponíveis. Além disso, os dados podem ser
            editados manualmente e importados novamente para o sistema ou
            utilizados para outros fins.
        </p>

        <p class="mt-4">
            Caso a opção <strong>Incluir imagens</strong> esteja marcada
            (somente disponível com o recurso <b>Termo</b>), as imagens
            utilizadas nos termos serão exportadas em uma pasta chamada
            <i>media</i>, com o nome do termo como prefixo, em um arquivo
            zipado.
        </p>

        <p class="mt-4" v-if="public">
            Para exportar somente uma parte dos termos, selecione os termos
            desejados (utilize o ícone
            <UIIcon
                name="ph:bookmark-simple"
                class="text-app-theme-500 w-6 h-6"
                variant="static"
            />), acesse a página de termos selecionados (utilize o ícone
            <UIIcon
                class="text-app-theme-500 w-6 h-6"
                name="ph:bookmarks-simple-fill"
                variant="static"
            />
            no menu superior) e clique na opção "Exportar".
        </p>

        <form class="mt-3 w-full md:w-2/5">
            <div class="mb-3">
                <FieldSelect
                    id="recurso"
                    label="Recurso"
                    :options="exportableResourcesOptions"
                    :required="true"
                    v-model="resource"
                />
                <FieldSelect
                    id="glossario"
                    label="Escolha o glossário para exportar"
                    :options="glossaryOptions"
                    :required="true"
                    v-model="glossary"
                    v-if="resource == conceptKey"
                />
                <FieldSelect
                    id="formato"
                    label="Formato"
                    :options="options"
                    :required="true"
                    v-model="format"
                />
            </div>

            <div class="mb-3" v-if="resource === 'Concept'">
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
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    public: {
        type: Boolean,
        required: true,
        default: false
    }
});

const glossaryStore = useGlossaryStore();
await glossaryStore.fetch(props.public);
const { availableGlossaries, id: glossaryId } = storeToRefs(glossaryStore);
const conceptKey = 'Concept';
const exportableResourcesOptions = ref([]) as Ref<
    { value: string; name: string }[]
>;
const exportData = useExportData();
const format = ref<DataTransferFormat>('xlsx');
const resource = ref<string | null>(conceptKey);
const glossary = ref<ID>(glossaryId.value);
const addMedia = ref(false);

const glossaryOptions = buildGlossaryOptions(availableGlossaries.value);
await getExportableResources(props.public);
const disableExport = computed(() => exportData.loading.value);

async function onExport() {
    let url = `/api/${props.public ? 'public/' : ''}${resource.value}/export?format=${format.value}&addMedia=${addMedia.value}`;

    if (resource.value === conceptKey) {
        const where = {
            glossaryId: glossary.value
        };

        url += `&where=${JSON.stringify(where)}`;
    }

    const date = new Date().toISOString().replace(/:/g, '-');
    const ext = addMedia.value ? 'zip' : format.value;
    const fileName = `export-${date}.${ext}`;

    await exportData.download(url, fileName);
}

const options = ref([
    { value: 'xlsx', name: 'XLSX (Excel)' },
    { value: 'csv', name: 'CSV' },
    { value: 'json', name: 'JSON' }
]);

const skosOption = {
    value: 'skos',
    name: 'SKOS (Simple Knowledge Organization System)'
};

watch(
    () => resource.value,
    (value) => {
        toggleSkosOption();
    }
);

toggleSkosOption();

function toggleSkosOption() {
    if (resource.value === conceptKey) {
        options.value.push(skosOption);
    } else {
        options.value = options.value.filter(
            (option) => option.value !== skosOption.value
        );
    }
}

function buildGlossaryOptions(glossaries: Glossary[]) {
    const g = glossaries.map((glossary) => ({
        value: glossary.id,
        name: glossary.name
    }));

    return g;
}

async function getExportableResources(
    isPublic = true,
) {

    const { data } = await useFetchWithBaseUrl(
        `/api/${isPublic ? 'public/' : ''}resource`,
        {
            method: 'GET',
            params: {
                where: {
                    canBeExported: true
                },
                pageSize: 100
            }
        }
    );

    if (data.value) {
        exportableResourcesOptions.value = data.value.items.map((item: Resource) => ({
            value: item.model,
            name: item.labelPlural
        }));
    }
}

useHead({
    title: 'Exportar | ' + useRuntimeConfig().public.appName
});
</script>
