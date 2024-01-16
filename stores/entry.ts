import QUERIES from '~/config/queries';

export const useEntryStore = defineStore('entry', () => {

    const model = 'Entry';
    const entryIdentifier = ref<ID>(''); // nameSlug or Id
    const page = ref(1);
    const pageSize = ref(12);
    const pageSizes = ref([12, 24, 36]);
    const total = ref(0);
    const totalPages = ref(0);
    const search = ref('');
    const sort = ref('asc');
    const fetchSelected = ref(false);
    const entry = ref<Entry>();
    const entryChanges = ref<EntryChanges>();
    const randomEntryIds = ref<number[]>([]);
    const entries = ref<Entry[]>([]);
    const entriesNetwork = ref<Entry[]>([]); // only used to build network for home
    const categoriesTree = ref<TreeNode[]>([]);

    const pending = ref(false);
    const error = ref<Error | undefined>(undefined);

    const query = computed(() => {
        const q = {
            page: page.value,
            pageSize: pageSize.value,
            include: QUERIES.get(model)?.include,
            where: {
                or: [
                    {
                        name: {
                            like: search.value
                        }
                    },
                    {
                        definition: {
                            like: search.value
                        }
                    },
                    {
                        notes: {
                            like: search.value
                        }
                    }
                ],
                and: []
            },
            orderBy: {
                name: sort.value
            }
        } as any;

        if (fetchSelected.value) {
            q.where.and.push({
                id: {
                    in: useEntrySelection().getSelected()
                }
            });
        }

        return q;
    });

    watch(() => query.value, async () => {
       await fetchList();
    }, { deep: true });


    async function load(resourceIdentifier: ID = '', fetchSelectedEntries = false) {
        if (resourceIdentifier) {
            entryIdentifier.value = resourceIdentifier;
            await fetchOne(resourceIdentifier);
            return;
        }
        fetchSelected.value = fetchSelectedEntries;
        await fetchList();
    }

    async function fetchOne(resourceIdentifier: ID) {
        const urlData = computed(() => `/api/${model}/${resourceIdentifier}`);

        const { data, pending, error } = await useFetchWithBaseUrl(urlData, {
            method: 'GET',
            params: { ...QUERIES.get(model) }
        }) as { data: Ref<Entry>, pending: Ref<boolean>, error: Ref<Error | undefined> };

        entry.value = data.value;
        pending.value = pending.value;
        error.value = error.value;
    }

    async function fetchList() {
        entryIdentifier.value = '';
        const urlData = computed(() => `/api/${model}`);

        const { data, pending, error } = await useFetchWithBaseUrl(urlData, {
            params: query.value
        }) as { data: Ref<PaginatedResponse>, pending: Ref<boolean>, error: Ref<Error | undefined> };


        if (data.value) {
            entries.value = data.value.items || [];
            total.value = data.value?.total || 0;
            totalPages.value = data.value?.totalPages || 0;
        }

        pending.value = pending.value;
    }

    async function fetchNetwork() {

        const { data, pending, error } = await useFetchWithBaseUrl(`api/${model}`, {
            params: {
                ...QUERIES.get('network')
            }
        }) as { data: Ref<PaginatedResponse>, pending: Ref<boolean>, error: Ref<Error | undefined> };

        entriesNetwork.value = data.value.items || [];
    }

    async function fetchRandom() {
        // TODO: implement
    }

    async function fetchCategoriesTree() {

        const { data } = await useFetchWithBaseUrl('/api/Entry', {
            method: 'GET',
            params: {
              pageSize: -1,
              select: JSON.stringify(['id', 'name', 'nameSlug', 'parentId']),
              where: {
                isCategory: false,
              },
              include: {
                children: {
                  where: {
                    isCategory: false
                  }
                }
              }
            },
            transform: (data: PaginatedResponse) => {
                if (!data) {
                    return [];
                } else {
                    return data.items;
                }
            }
          });
        
          if (data.value) {
            categoriesTree.value = buildTreeData(data.value, false, entry.value?.id, undefined, 'children');
          }

    }

    function sortByName() {
        sort.value === 'asc' ? sort.value = 'desc' : sort.value = 'asc';
    }

    async function exportData(format: DataTransferFormat, addMedia = false) {
        
        const exportData = useExportData();

        if (entryIdentifier.value) {
            await exportData.download(format, addMedia, { id: entry.value?.id });
            return;
        }

        await exportData.download(format, addMedia, query.value.where);

    }

    function clear() {
        entry.value = undefined;
        entryChanges.value = undefined;
        entries.value = [];
        total.value = 0;
        totalPages.value = 0;
        pending.value = false;
        error.value = undefined;
        search.value = '';
    }

    async function clearSelection() {
        useEntrySelection().clearSelected();
        window.location.reload();
    }

    return {
        entryIdentifier,
        page,
        pageSize,
        pageSizes,
        total,
        totalPages,
        search,
        sort,
        entry,
        entryChanges,
        randomEntryIds,
        entries,
        entriesNetwork,
        categoriesTree,
        pending,
        error,
        load,
        fetchNetwork,
        fetchCategoriesTree,
        sortByName,
        exportData,
        clear,
        clearSelection
    }

})
