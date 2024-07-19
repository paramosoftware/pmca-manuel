export const useGlossaryStore = defineStore('glossary', () => {
    const config = useRuntimeConfig();
    const id = ref(0);
    const code = ref<string | null>(null);
    const name = ref(config.public.appName);
    const description = ref<string | null>(config.public.appDescription);
    const keywords = ref<Keyword[]>([]);
    const availableGlossaries = ref<Glossary[]>([]);

    async function fetch(isPublic = true) {
        const url = isPublic ? '/api/public/glossary' : '/api/glossary';

        const { data, pending, error } = (await useFetchWithBaseUrl(url, {
            params: {
                pageSize: -1,
                include: JSON.stringify(['keywords']),
                orderBy:  JSON.stringify([{ default: 'desc' }, { name: 'asc' }])
            }
        })) as {
            data: Ref<PaginatedResponse>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        if (data.value && data.value.items.length > 0) {
            id.value = data.value.items[0].id;
            code.value = data.value.items[0].code;
            name.value = data.value.items[0].name;
            description.value = data.value.items[0].description;
            keywords.value = data.value.items[0].keywords || [];
            availableGlossaries.value = data.value.items;
        }
    }

    async function setGlossary(glossaryId: number) {
        const glossary = availableGlossaries.value.find((g) => g.id === glossaryId);

        if (glossary) {
            id.value = glossary.id;
            code.value = glossary.code;
            name.value = glossary.name;
            description.value = glossary.description;
            keywords.value = glossary.keywords || [];
        }
    }

    return {
        id,
        name,
        description,
        keywords,
        availableGlossaries,
        fetch,
        setGlossary
    };
});
