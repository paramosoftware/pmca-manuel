const config = useRuntimeConfig();

export const useGlossaryStore = defineStore('glossary', () => {
    const id = ref('');
    const code = ref('');
    const name = ref(config.public.appName);
    const description = ref(config.public.appDescription);
    const keywords = ref<Keyword[]>([]);

    async function fetch() {
        // TODO: Improve which glossary is chosen
        const { data, pending, error } = (await useFetchWithBaseUrl(
            `/api/public/glossary`,
            {
                params: {
                    pageSize: 1,
                    include: JSON.stringify(['keywords'])
                }
            }
        )) as {
            data: Ref<PaginatedResponse>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        console.log(data.value);

        if (data.value && data.value.items.length > 0) {
            id.value = data.value.items[0].id;
            code.value = data.value.items[0].code;
            name.value = data.value.items[0].name;
            description.value = data.value.items[0].description;
            keywords.value = data.value.items[0].keywords || [];
        }
    }

    return {
        id,
        name,
        description,
        keywords,
        fetch
    };
});
