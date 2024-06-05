<template>
    <UDropdown
        :items="exportOptions"
        :popper="{ placement: 'bottom-end' }"
        class="align-middle"
    >
        <template #add-media="{ item }" class="cursor-pointer">
            <FieldCheckbox
                id="addMedia"
                v-model="addMedia"
                value="media"
                label="Incluir imagens"
            />
        </template>
        <UIIcon name="ph:download" title="Exportar" class="w-7" />
    </UDropdown>
</template>

<script setup lang="ts">
const conceptStore = useConceptStore();
const addMedia = ref(false);

const exportOptions = [
    [
        {
            label: 'Exportar todos os termos',
            slot: 'add-media',
            class: 'cursor-default text-sm opacity-100',
            disabled: true
        }
    ],
    [
        {
            label: 'JSON',
            click: async () => {
                await conceptStore.exportData('json', addMedia.value);
            }
        }
    ],
    [
        {
            label: 'CSV',
            click: async () => {
                await conceptStore.exportData('csv', addMedia.value);
            }
        }
    ],
    [
        {
            label: 'XLSX (Excel)',
            click: async () => {
                await conceptStore.exportData('xlsx', addMedia.value);
            }
        }
    ],
    [
        {
            label: 'SKOS (Simple Knowledge Organization System)',
            click: async () => {
                await conceptStore.exportData('xml', addMedia.value);
            }
        }
    ]
];
</script>
