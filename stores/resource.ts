export const useResourceStore = defineStore('resource', () => {

    const model = ref('');
    const label = ref('');
    const labelSlug = ref('');
    const labelPlural = ref('');
    const fields = ref<AppResourceField[]>([]);
    const isAppModel = ref(false);
    const isPublic = ref(false);
    const genderNoun = ref('n');
    const pending = ref(false);
    const error = ref<Error | undefined>(undefined);

    const query = computed(() => {
        return {
            include: {
                fields: {
                    include: {
                        relatedResource: true,
                        oppositeField: true
                    },
                    orderBy: ['position']
                },
                
            }
        }
    });

    async function fetch(resourceIdentifier: string) {

        const urlResource = computed(() => `/api/appResource/${resourceIdentifier}`);

        const { data, pending, error } = await useFetchWithBaseUrl(urlResource, {
            params: query.value
        }) as {
            data: Ref<AppResource>, pending: Ref<boolean>, error: Ref<Error | undefined>
        };

        if (data.value) {
            model.value = data.value.name || '';
            label.value = data.value.label || '';
            labelSlug.value = data.value.labelSlug || '';
            labelPlural.value = data.value.labelPlural || '';
            fields.value = data.value.fields || [];
            isAppModel.value = data.value.isAppModel || false;
            isPublic.value = data.value.isPublic || false;
        }

        pending.value = pending.value;
        error.value = error.value;
    }

    return {
        model,
        label,
        labelPlural,
        labelSlug,
        genderNoun,
        fields,
        isAppModel,
        isPublic,
        pending,
        error,
        fetch
    }
});
