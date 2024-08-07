import QUERIES from '~/config/queries';
export const useConceptStore = defineStore('concept', () => {
    const model = 'Concept';
    const conceptIdentifier = ref<ID>(''); // nameSlug or Id
    const page = ref(1);
    const pageSizes = ref([12, 24, 36]);
    const pageSize = ref(pageSizes.value[1]);
    const total = ref(0);
    const totalPages = ref(0);
    const search = ref('');
    const sort = ref('asc');
    const fetchSelected = ref(false);
    const concept = ref<Concept>();
    const conceptChanges = ref<ConceptChanges>();
    const totalConceptChanges = ref(0);
    const conceptChangesLoading = ref(false);
    const randomConcepts = ref<Concept[]>([]);
    const concepts = ref<Concept[]>([]);
    const conceptsNetwork = ref<Concept[]>([]); // only used to build network for home
    const conceptsTree = ref<TreeNode[]>([]);
    const loadingStore = useLoadingStore();
    const ancestors = ref<Concept[]>([]);
    const descendantsIds = ref<ID[]>([]);
    const searchInitialLetter = ref<string>('TODOS');
    const maxPage = computed(() => Math.ceil(total.value / pageSize.value));
    const glossaryStore = useGlossaryStore();

    let timeoutId: NodeJS.Timeout = setTimeout(() => {}, 500);

    const pending = ref(false);
    const error = ref<Error | undefined>(undefined);

    const query = computed(() => {
        if (page.value > maxPage.value) {
            page.value = 1;
        }

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
                AND: [{
                    glossaryId: glossaryStore.id
                }]
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

        if (searchInitialLetter.value && searchInitialLetter.value !== "TODOS") {
            q.where.AND.push({
                name: {
                    startsWith: searchInitialLetter.value
                }
            });
        }

        if (descendantsIds.value.length > 0) {
            q.where.AND.push({
                id: {
                    in: descendantsIds.value
                }
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
                    await fetchList();
                }, 500);
            }
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

        await fetchAncestors();

        loadingStore.stop();
    }

    async function fetchList() {
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
                    ...QUERIES.get('network'),
                    where: {
                        glossaryId: glossaryStore.id
                    }
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
        const { data } = await useFetchWithBaseUrl(`/api/public/${model}/@random`, {
            method: 'GET',
            params: {
                where: JSON.stringify({ glossaryId: glossaryStore.id }),
                include: JSON.stringify (QUERIES.get(model)?.include),
                orderBy: JSON.stringify({ position: 'asc' })
            }
        });

        if (data.value) {
            randomConcepts.value = data.value;
        }
    }

    async function fetchConceptsTree() {
        loadingStore.start();

        const { data } = await useFetchWithBaseUrl(`/api/public/${model}`, {
            method: 'GET',
            params: {
                pageSize: -1,
                select: JSON.stringify([
                    'id',
                    'name',
                    'nameSlug',
                    'parentId',
                    'position'
                ]),
                orderBy: JSON.stringify({ position: 'asc' }),
                where: JSON.stringify({ glossaryId: glossaryStore.id })
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

    async function fetchAncestors() {
        const { data } = await useFetchWithBaseUrl(
            `/api/public/${model}/${concept.value?.id}/@ancestors`
        );
        ancestors.value = data.value;
        return data;
    }

    async function fetchDescendants(nodeId: ID) {
        const { data } = await useFetchWithBaseUrl(
            `/api/public/${model}/${nodeId}/@treeIds`
        );

        descendantsIds.value = data.value;
    }

    function sortByName() {
        page.value = 1;
        sort.value === 'asc' ? (sort.value = 'desc') : (sort.value = 'asc');
    }

    async function exportData(format: DataTransferFormat, addMedia = false) {
        const exportData = useExportData();

        const date = new Date().toISOString().replace(/:/g, '-');
        const ext = addMedia ? 'zip' : format;
        const fileName = `export-${date}.${ext}`;
        const where = conceptIdentifier.value
            ? { id: concept.value?.id }
            : query.value.where;
        const url = `/api/concept/export?format=${format}&addMedia=${addMedia}&where=${JSON.stringify(where)}`;

        await exportData.download(url, fileName);
    }

    function reset() {
        concept.value = undefined;
        ancestors.value = <Concept[]>[];
        conceptChanges.value = undefined;
        conceptsTree.value = <TreeNode[]>[];
        descendantsIds.value = [];
        concepts.value = [];
        total.value = 0;
        totalPages.value = 0;
        pending.value = false;
        error.value = undefined;
        search.value = '';
    }

    function resetConcept() {
        conceptIdentifier.value = '';
        concept.value = undefined;
        ancestors.value = <Concept[]>[];
        conceptChanges.value = undefined;
    }

    async function clearSelection() {
        useConceptSelection().clearSelected();
        if (process.client) {
           window.location.reload();
        }
    }

    function resetFilters() {
        search.value = '';
        searchInitialLetter.value = 'TODOS';
        sort.value = 'asc';
        page.value = 1;
        pageSize.value = pageSizes.value[1];
        descendantsIds.value = [];
        ancestors.value = <Concept[]>[];
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
        ancestors,
        totalConceptChanges,
        conceptChangesLoading,
        randomConcepts,
        concepts,
        conceptsNetwork,
        conceptsTree,
        pending,
        error,
        searchInitialLetter,
        load,
        fetchNetwork,
        fetchConceptsTree,
        fetchConceptChanges,
        fetchAncestors,
        fetchDescendants,
        sortByName,
        exportData,
        reset,
        resetConcept,
        resetFilters,
        clearSelection,
        fetchRandom
    };
});
