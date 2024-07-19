import QUERIES from '~/config/queries';

export const useListStore = defineStore('list', () => {
    const toast = useToast();
    const page = ref(1);
    const pageSize = ref(10);
    const search = ref('');
    const sort = ref('asc');
    const label = ref('');
    const labelPlural = ref('');
    const labelSlug = ref('');
    const genderNoun = ref('n');
    const items = ref<any[]>([]);
    const total = ref(0);
    const totalPages = ref(0);
    const resourceStore = useResourceStore();
    const userStore = useUserStore();
    const loadingStore = useLoadingStore();
    const glossaryStore = useGlossaryStore();
    const isHierarchical = ref(false)
    const model = ref('');
    const canCreate = computed(
        () => userStore.permissions[resourceStore.model]?.create
    );
    const canUpdate = computed(
        () => userStore.permissions[resourceStore.model]?.update
    );
    const canDelete = computed(
        () => userStore.permissions[resourceStore.model]?.delete
    );
    const canBatch = computed(
        () => userStore.permissions[resourceStore.model]?.batch
    );
    const pending = ref(false);
    const error = ref<Error | undefined>(undefined);
    let timeoutId: NodeJS.Timeout = setTimeout(() => {}, 500);

    const query = computed(() => {
        const q = {
            page: page.value,
            pageSize: pageSize.value,
            where: {
                OR : [
                    { 
                        name: {
                            like: search.value
                        }
                    },
                    {
                        label: {
                            like: search.value
                        }
                    },
                    {
                        labelPlural: {
                            like: search.value
                        }
                    }
                ],
                AND: [] as any[]
            },
            orderBy: {
                name: sort.value
            }
        };

        if (QUERIES.get(resourceStore.name)?.where) {
            q.where = Object.assign(
                q.where,
                QUERIES.get(resourceStore.name)?.where
            );
        }

        if (resourceStore.isConcept) {
            q.where.AND.push({
                glossaryId: glossaryStore.id
            });
        }

        return q;
    });

    watch(
        query,
        async (newQuery, oldQuery) => {
            if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(async () => {
                    await fetch(resourceStore.name);
                }, 500);
            }
        },
        { deep: true }
    );

    async function fetch(resourceIdentifier: string) {
        loadingStore.start();
        await resourceStore.fetch(resourceIdentifier);
        await userStore.fetch();

        const urlData = computed(() => `/api/${resourceStore.model}`);

        const { data, pending, error } = (await useFetchWithBaseUrl(urlData, {
            params: query.value
        })) as {
            data: Ref<PaginatedResponse>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        label.value = resourceStore.label || '';
        labelPlural.value = resourceStore.labelPlural || '';
        labelSlug.value = resourceStore.labelSlug || '';
        isHierarchical.value = resourceStore.isHierarchical || false;
        model.value = resourceStore.model || '';
        genderNoun.value = resourceStore.genderNoun || 'n';
        items.value = data.value?.items || [];
        total.value = data.value?.total || 0;
        totalPages.value = data.value?.totalPages || 0;
        total.value = data.value?.total || 0;
        totalPages.value = data.value?.totalPages || 0;
        pending.value = pending.value;
        error.value = error.value;
        loadingStore.stop();
    }

    function sortByName() {
        page.value = 1;
        sort.value === 'asc' ? (sort.value = 'desc') : (sort.value = 'asc');
    }

    async function deleteItem(id: ID) {
        const urlDelete = computed(() => `/api/${resourceStore.model}/${id}`);

        const { data, error } = (await useFetchWithBaseUrl(urlDelete, {
            method: 'DELETE'
        })) as { data: Ref<{ error: string }>; error: Ref<Error | undefined> };

        pending.value = pending.value;

        if (error.value) {
            toast.add({
                title: 'Aconteceu algum problema ao excluir o item',
                ui: { rounded: 'rounded-sm', padding: 'p-5' }
            });
        }

        if (data.value) {
            toast.add({
                title: 'Item excluído com sucesso',
                ui: { rounded: 'rounded-sm', padding: 'p-5' }
            });
        }

        await fetch(resourceStore.name);
    }

    async function deleteAll() {
        const urlDelete = computed(() => `/api/${resourceStore.model}/query`);

        const { data, error } = (await useFetchWithBaseUrl(urlDelete, {
            method: 'DELETE',
            body: JSON.stringify(query.value)
        })) as { data: Ref<{ error: string }>; error: Ref<Error | undefined> };

        pending.value = pending.value;

        if (error.value) {
            toast.add({
                title: 'Aconteceu algum problema ao excluir os itens',
                ui: { rounded: 'rounded-sm', padding: 'p-5' }
            });
        }

        if (data.value) {
            toast.add({
                title: 'Itens excluídos com sucesso',
                ui: { rounded: 'rounded-sm', padding: 'p-5' }
            });
        }

        await fetch(resourceStore.name);
    }

    function destroy() {
        destroyStore(resourceStore);
    }

    return {
        label,
        labelPlural,
        labelSlug,
        genderNoun,
        sort,
        page,
        pageSize,
        total,
        totalPages,
        search,
        items,
        query,
        isHierarchical,
        model,
        pending,
        error,
        canCreate,
        canUpdate,
        canDelete,
        canBatch,
        sortByName,
        deleteItem,
        deleteAll,
        fetch,
        destroy
    };
});
