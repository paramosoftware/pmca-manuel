export const useGlossaryStore = defineStore('glossary', () => {
    const config = useRuntimeConfig();
    const id = ref(0);
    const code = ref<string | null>(null);
    const name = ref(config.public.appName);
    const description = ref<string | null>(config.public.appDescription);
    const keywords = ref<Keyword[]>([]);
    const availableGlossaries = ref<Glossary[]>([]);
    const isPublicInterface = ref(true);

    async function fetch(isPublic = true) {
        const url = isPublic ? '/api/public/glossary' : '/api/glossary';
        isPublicInterface.value = isPublic;

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

        availableGlossaries.value = data.value.items;

        if (useCookie(getCookieKey()).value) {
            setGlossary(parseInt(useCookie(getCookieKey()).value!), isPublic);
        } else if (data.value && data.value.items.length > 0) {
            id.value = data.value.items[0].id;
            code.value = data.value.items[0].code;
            name.value = data.value.items[0].name;
            description.value = data.value.items[0].description;
            keywords.value = data.value.items[0].keywords || [];
            setGlossaryCookie(data.value.items[0].id);
        } else if (!isPublic) {
            createDefaultGlossary();
        }
    }

    async function setGlossary(glossaryId: ID, isPublic = true) {
        const glossary = availableGlossaries.value.find((g) => g.id === glossaryId);
        isPublicInterface.value = isPublic;

        if (glossary) {
            setGlossaryCookie(glossaryId);
            id.value = glossary.id;
            code.value = glossary.code;
            name.value = glossary.name;
            description.value = glossary.description;
            keywords.value = glossary.keywords || [];
        } else {
            setGlossaryCookie('');
            await fetch(isPublic);
        }
    }

    async function createDefaultGlossary() {
        const glossary = {
            name: "Glossário padrão",
            code: "GP",
            description: "Glossário padrão",
            default: true
        }

        await useFetchWithBaseUrl('/api/glossary', {
            method: 'POST',
            body: JSON.stringify(glossary)
        });

        await fetch(false);
    }

    function setGlossaryCookie(glossaryId: ID) {
        useCookie(getCookieKey(), {
            httpOnly: false,
            secure: false,
            sameSite: 'lax'
        }).value = glossaryId ? glossaryId.toString() : '';
    }

    function getCookieKey() {
        if (isPublicInterface.value) {
            return 'glossary';
        } else {
            return 'glossary-admin';
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
