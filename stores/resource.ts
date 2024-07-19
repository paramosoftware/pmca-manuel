export const useResourceStore = defineStore('resource', () => {
    const name = ref('');
    const model = ref('');
    const label = ref('');
    const labelSlug = ref('');
    const labelPlural = ref('');
    const fields = ref<ResourceField[]>([]);
    const isAppModel = ref(false);
    const isPublic = ref(false);
    const genderNoun = ref('n');
    const pending = ref(false);
    const error = ref<Error | undefined>(undefined);
    const isHierarchical = ref(false)
    const isConcept = computed(() => model.value === 'Concept');
    const query = computed(() => {
        return {
            include: {
                fields: {
                    include: {
                        relatedResource: true,
                        oppositeField: true
                    },
                    orderBy: ['position']
                }
            }
        };
    });

    async function fetch(resourceIdentifier: string) {
        const urlResource = computed(
            () => `/api/resource/${resourceIdentifier}`
        );

        const { data, pending, error } = (await useFetchWithBaseUrl(
            urlResource,
            {
                params: query.value
            }
        )) as {
            data: Ref<Resource>;
            pending: Ref<boolean>;
            error: Ref<Error | undefined>;
        };

        if (data.value) {
            name.value = data.value.name || '';
            model.value = data.value.model || '';
            label.value = data.value.label || '';
            labelSlug.value = data.value.labelSlug || '';
            labelPlural.value = data.value.labelPlural || '';
            fields.value = data.value.fields || [];
            isAppModel.value = data.value.isAppModel || false;
            isPublic.value = data.value.isPublic || false;
            isHierarchical.value = data.value.isHierarchical || false;
        }

        pending.value = pending.value;
        error.value = error.value;
    }

    return {
        name,
        model,
        label,
        labelPlural,
        labelSlug,
        genderNoun,
        fields,
        isAppModel,
        isPublic,
        isHierarchical,
        isConcept,
        pending,
        error,
        fetch
    };
});
