import QUERIES from '~/config/queries';

export const useConceptStore = defineStore('concept', () => {
    const model = 'Concept';
    const conceptIdentifier = ref<ID>(''); // nameSlug or Id
    const page = ref(1);
    const pageSize = ref(12);
    const pageSizes = ref([12, 24, 36]);
    const total = ref(0);
    const totalPages = ref(0);
    const search = ref('');
    const sort = ref('asc');
    const fetchSelected = ref(false);
    const concept = ref<Concept>();
    const conceptChanges = ref<ConceptChanges>();
    const totalConceptChanges = ref(0);
    const conceptChangesLoading = ref(false);
    const randomConceptIds = ref<number[]>([]);
    const concepts = ref<Concept[]>([]);
    const conceptsNetwork = ref<Concept[]>([]); // only used to build network for home
    const conceptsTree = ref<TreeNode[]>([]);
    const loadingStore = useLoadingStore();

    const pending = ref(false);
    const error = ref<Error | undefined>(undefined);

    const query = computed(() => {
        const q = {
            page: page.value,
            pageSize: pageSize.value,
            include: QUERIES.get(model)?.include,
            where: {
                OR: [
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
                    },
                    {
                        translations: {
                            some: {
                                name: {
                                    like: search.value
                                }
                            }
                        }
                    },
                    {
                        variations: {
                            some: {
                                name: {
                                    like: search.value
                                }
                            }
                        }
                    }
                ],
                AND: []
            },
            orderBy: {
                name: sort.value
            }
        } as any;

        if (fetchSelected.value) {
            q.where.AND.push({
                id: {
                    in: useConceptSelection().getSelected()
                }
            });
        }

        return q;
    });

    watch(
        () => query.value,
        async () => {
            await fetchList();
        },
        { deep: true }
    );

    async function load(
        resourceIdentifier: ID = '',
        fetchSelectedConcepts = false
    ) {
        if (resourceIdentifier) {
            conceptIdentifier.value = resourceIdentifier;
            await fetchOne(resourceIdentifier);
            return;
        }
        fetchSelected.value = fetchSelectedConcepts;
        await fetchList();
    }

    async function fetchOne(resourceIdentifier: ID) {
        const urlData = computed(
            () => `/api/public/${model}/${resourceIdentifier}`
        );

        loadingStore.start();
        const { data, pending, error } = (await useFetchWithBaseUrl(urlData, {
            method: 'GET',
            params: { ...QUERIES.get(model) }
        })) as {
            data: Ref<Concept>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        concept.value = data.value;
        pending.value = pending.value;
        error.value = error.value;
        loadingStore.stop();
    }

    async function fetchList() {
        conceptIdentifier.value = '';
        const urlData = computed(() => `/api/public/${model}`);

        loadingStore.start();
        const { data, pending, error } = (await useFetchWithBaseUrl(urlData, {
            params: query.value
        })) as {
            data: Ref<PaginatedResponse>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        if (data.value) {
            concepts.value = data.value.items || [];
            total.value = data.value?.total || 0;
            totalPages.value = data.value?.totalPages || 0;
        }

        pending.value = pending.value;
        error.value = error.value;
        loadingStore.stop();
    }

    async function fetchNetwork() {
        loadingStore.start();
        const { data, pending, error } = (await useFetchWithBaseUrl(
            `/api/public/${model}`,
            {
                params: {
                    ...QUERIES.get('network')
                }
            }
        )) as {
            data: Ref<PaginatedResponse>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        conceptsNetwork.value = data.value.items || [];
        loadingStore.stop();
    }

    async function fetchRandom() {
        // TODO: implement
    }

    async function fetchConceptsTree() {
        loadingStore.start();

        const { data } = await useFetchWithBaseUrl(`/api/public/${model}`, {
            method: 'GET',
            params: {
                pageSize: -1,
                select: JSON.stringify(['id', 'name', 'nameSlug', 'parentId'])
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
            conceptsTree.value = buildTreeData(
                data.value,
                false,
                concept.value?.id
            ) as TreeNode[];
        }

        loadingStore.stop();
    }

    async function fetchConceptChanges(
        page = 1,
        pageSize = 8,
        sortBy = 'createdAt',
        sort = 'desc'
    ) {
        const urlData = computed(
            () => `/api/public/${model}/${concept.value?.id}/changes`
        );

        loadingStore.start();

        let orderBy;

        if (sortBy === 'user') {
            orderBy = { user: { name: sort } };
        } else if (sortBy === 'field') {
            orderBy = { field: { label: sort } };
        } else {
            orderBy = { [sortBy]: sort };
        }

        conceptChangesLoading.value = true;

        const { data, pending, error } = (await useFetchWithBaseUrl(urlData, {
            params: {
                page,
                pageSize,
                orderBy,
                include: {
                    user: {
                        select: ['name']
                    },
                    field: {
                        select: ['name', 'label']
                    }
                }
            }
        })) as {
            data: Ref<PaginatedResponse>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        conceptChanges.value = (data.value?.items ||
            []) as unknown as ConceptChanges;
        totalConceptChanges.value = data.value?.total || 0;
        conceptChangesLoading.value = pending.value;

        loadingStore.stop();
    }

    function sortByName() {
        page.value = 1;
        sort.value === 'asc' ? (sort.value = 'desc') : (sort.value = 'asc');
    }

    async function exportData(format: DataTransferFormat, addMedia = false) {
        const exportData = useExportData();

        if (conceptIdentifier.value) {
            await exportData.download(format, addMedia, {
                id: concept.value?.id
            });
            return;
        }

        await exportData.download(format, addMedia, query.value.where);
    }

    function clear() {
        concept.value = undefined;
        conceptChanges.value = undefined;
        concepts.value = [];
        total.value = 0;
        totalPages.value = 0;
        pending.value = false;
        error.value = undefined;
        search.value = '';
    }

    async function clearSelection() {
        useConceptSelection().clearSelected();
        window.location.reload();
    }

    return {
        conceptIdentifier,
        page,
        pageSize,
        pageSizes,
        total,
        totalPages,
        search,
        sort,
        concept,
        conceptChanges,
        totalConceptChanges,
        conceptChangesLoading,
        randomConceptIds,
        concepts,
        conceptsNetwork,
        conceptsTree,
        pending,
        error,
        load,
        fetchNetwork,
        fetchConceptsTree,
        fetchConceptChanges,
        sortByName,
        exportData,
        clear,
        clearSelection
    };
});
