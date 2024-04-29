<template>
    <div class="flex flex-col">
        <div class="overflow-x-auto">
            <template v-if="totalConceptChanges != 0 || conceptChangesLoading">
                <div class="flex justify-end mb-1">
                    <UPagination
                        v-model="page"
                        :page-count="pageSize"
                        :total="totalConceptChanges"
                        size="xs"
                        v-if="totalConceptChanges > pageSize"
                    />
                </div>

                <UTable
                    :loading="conceptChangesLoading"
                    v-model:sort="sort"
                    sort-mode="manual"
                    :rows="currentChanges"
                    :columns="columns"
                    :ui="{
                        wrapper: 'w-full overflow-x-auto',
                        base: 'w-full table-auto border-collapse',
                        tr: { base: 'bg-gray-50 text-wrap' },
                        td: { base: 'break-all', color: '' },
                        th: { base: 'w-auto bg-white' },
                        default: { loadingState: { label: 'Carregando...' } }
                    }"
                >
                    <template #changes-data="{ row }">
                        <span class="text-wrap" v-html="row.changes"></span>
                    </template>
                </UTable>
            </template>

            <div v-else class="flex justify-center items-center mt-4 h-48">
                <p class="text-pmca-primary">Nenhuma alteração registrada.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as Diff from 'diff';

const columns = [
    {
        key: 'createdAt',
        label: 'Data',
        sortable: true,
        class: 'w-1/12'
    },
    {
        key: 'user',
        label: 'Usuário',
        sortable: true,
        class: 'w-1/12'
    },
    {
        key: 'field',
        label: 'Campo',
        sortable: true,
        class: 'w-1/12'
    },
    {
        key: 'changes',
        label: 'Alterações',
        class: 'min-w-80 w-9/12'
    }
];

const sort = ref({
    column: 'createdAt',
    direction: 'desc'
});

const page = ref(1);
const pageSize = 8;

const conceptStore = useConceptStore();
const { conceptChanges, totalConceptChanges, conceptChangesLoading } =
    storeToRefs(conceptStore);

await conceptStore.fetchConceptChanges(
    page.value,
    pageSize,
    sort.value.column,
    sort.value.direction
);

// @ts-ignore
let currentChanges = computed(() => formatRows(conceptChanges.value));

watch(
    () => conceptChanges.value,
    async () => {
        // @ts-ignore
        currentChanges = computed(() => formatRows(conceptChanges.value));
    }
);

watch(
    () => page.value,
    async () => {
        await conceptStore.fetchConceptChanges(
            page.value,
            pageSize,
            sort.value.column,
            sort.value.direction
        );
    }
);

watch(
    () => sort.value,
    async () => {
        page.value = 1;
        await conceptStore.fetchConceptChanges(
            page.value,
            pageSize,
            sort.value.column,
            sort.value.direction
        );
    }
);

function formatRows(
    changes: {
        createdAt: string;
        user: { name: string };
        field: { label: string; name: string };
        changes: string;
    }[]
) {
    const rows = [];

    for (const change of changes) {
        const row = {
            createdAt: new Date(change.createdAt)
                .toLocaleString('pt-BR')
                .substring(0, 17),
            user: change.user ? change.user.name : 'Não identificado',
            field:
                change.field?.label || change.field?.name || 'Campo excluído',
            changes: formatChanges(JSON.parse(change.changes))
        };

        rows.push(row);
    }

    return rows;
}

function formatChanges(change: {
    old: string;
    new: string;
    added: string[];
    removed: string[];
}) {
    const formattedChanges = [];

    if (change.old || change.new) {
        change.old = change.old || '';
        change.new = change.new || '';

        const diff = Diff.diffWords(change.old, change.new);

        const diffFormatted = diff
            .map((part) => {
                const classText = part.added
                    ? 'text-green-700'
                    : part.removed
                      ? 'text-red-700 line-through'
                      : '';
                return `<p class="${classText} inline">${part.value}</p>`;
            })
            .join('');

        formattedChanges.push(diffFormatted);

        return formattedChanges.join('');
    }

    for (const [key, value] of Object.entries(change)) {
        if (key === 'added') {
            // @ts-ignore
            formattedChanges.push(
                '<span class="text-green-700">Adicionado: </span>' +
                    value.join(', ')
            );
        }

        if (key === 'removed') {
            // @ts-ignore
            formattedChanges.push(
                '<span class="text-red-700">Removido: </span>' +
                    value.join(', ')
            );
        }
    }

    return formattedChanges.join('<br>');
}
</script>
