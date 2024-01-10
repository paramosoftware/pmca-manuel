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
    const pending = ref(false);
    const error = ref<Error | undefined>(undefined);

    // TODO: allow query in label
    const query = computed(() => {
        const q = {
            page: page.value,
            pageSize: pageSize.value,
            where: {
                name: {
                    like: search.value
                }
            },
            orderBy: {
                name: sort.value
            }
        }

        if (QUERIES.get(resourceStore.model)?.where) {
            q.where = Object.assign(q.where, QUERIES.get(resourceStore.model)?.where);
        }

        return q;
    });

    watch(() => query.value, async () => {
       await fetch(resourceStore.model);
    }, { deep: true });

    async function fetch(resourceIdentifier: string) {

        await resourceStore.fetch(resourceIdentifier);

        const urlData = computed(() => `/api/${resourceStore.model}`);

        const { data, pending, error } = await useFetchWithBaseUrl(urlData, {
            params: query.value
        }) as { data: Ref<PaginatedResponse>, pending: Ref<boolean>, error: Ref<Error | undefined> };

        label.value = resourceStore.label || '';
        labelPlural.value = resourceStore.labelPlural || '';
        labelSlug.value = resourceStore.labelSlug || '';
        genderNoun.value = resourceStore.genderNoun || 'n';
        items.value = data.value?.items || [];
        total.value = data.value?.total || 0;
        totalPages.value = data.value?.totalPages || 0;
        total.value = data.value?.total || 0;
        totalPages.value = data.value?.totalPages || 0;
        pending.value = pending.value;
    }


    function sortByName() {
        sort.value === 'asc' ? sort.value = 'desc' : sort.value = 'asc';
    }

    async function deleteItem(id: number | string) {

        const urlDelete = computed(() => `/api/${resourceStore.model}/${id}`);

        const { data, error } = await useFetchWithBaseUrl(urlDelete, {
            method: 'DELETE'
        }) as { data: Ref<{ error: string }>, error: Ref<Error | undefined> };

        pending.value = pending.value;

        if (error.value) {
            toast.add({ 
                title: 'Aconteceu algum problema ao excluir o item',
                ui: { rounded: 'rounded-sm', padding: 'p-5' }
            })
        }

        if (data.value) {
            toast.add({ 
                title: 'Item excluído com sucesso',
                ui: { rounded: 'rounded-sm', padding: 'p-5' }
            })
        }

        await fetch(resourceStore.model);
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
        pending,
        error,
        sortByName,
        deleteItem,
        fetch,
        destroy
    }

})
