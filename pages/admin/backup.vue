<template>
    <UICardContainer>
        <template #header>
            <UIAnchorReturn href="/admin" />
            <UIContainerTitle class="mt-1">
                Backup de dados
            </UIContainerTitle>
        </template>

        <form class="mt-3 w-full md:w-2/5">
            <div class="mb-3">
                <FieldSelect
                    id="folder"
                    label="Formato"
                    :options="options"
                    :required="true"
                    v-model="folder"
                />
            </div>

            <div class="mb-3 text-right md:text-left">
                <UIButton type="button" @click="onBackup(folder)" :disabled="disableBackup">
                    Realizar backup
                </UIButton>
            </div>
        </form>
    </UICardContainer>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'admin']
});
useHead({
    title: 'Backup | ' + useRuntimeConfig().public.appName
});

const folder = ref('');

const options = ref([
    { value: '', name: 'Todos os dados' },
    { value: 'media', name: 'Mídia' },
    { value: 'db', name: 'Banco de dados' },
    { value: 'logs', name: 'Logs' }
]);

const exportData = useExportData();
const disableBackup = computed(() => exportData.loading.value);

const onBackup = async (folder: string = '') => {
    exportData.title.value = 'Fazendo backup...';
    const date = new Date().toISOString().replace(/:/g, '-');
    const fileName = `backup-${folder}-${date}.zip`;
    const url = `/api/admin/backup` + (folder ? `?folder=${folder}` : ''); 
    await exportData.download(url, fileName);
};
</script>
