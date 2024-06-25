import QUERIES from '~/config/queries';
export const createFormStore = (name: string) => {
    return defineStore(name, () => {
        const id = ref<ID>(0);
        const name = ref('');
        const model = ref('');
        const label = ref('');
        const labelPlural = ref('');
        const labelSlug = ref('');
        const genderNoun = ref('n');
        const fieldsData = ref<Record<string, any>>({});
        const fieldsConfig = ref<Record<string, FormField>>({});
        const isAuxiliary = ref(false);
        const parentModel = ref('');
        const resourceStore = useResourceStore();
        const userStore = useUserStore();
        const canCreate = computed(
            () => userStore.permissions[resourceStore.model]?.create
        );
        const pending = ref(false);
        const error = ref('');

        async function load(resourceIdentifier: string, itemId?: ID) {
            if (!resourceIdentifier) {
                throw new Error('Resource not set');
            }

            if (itemId) {
                id.value = itemId;
            } else {
                id.value = 0;
            }

            await loadResource(resourceIdentifier);

            if (id.value) {
                await loadFieldsData();
            } else {
                fieldsData.value = {};
            }
        }

        async function loadResource(resourceIdentifier: string) {
            // TODO: Consider using a createResourceStore function for multiples instances [PMCA-411]
            destroyStore(resourceStore);
            await resourceStore.fetch(resourceIdentifier);

            if (!resourceStore.model) {
                throw new Error('Resource not found');
            }

            name.value = resourceStore.name;
            model.value = resourceStore.model;
            label.value = resourceStore.label || '';
            labelPlural.value = resourceStore.labelPlural || '';
            labelSlug.value = resourceStore.labelSlug || '';
            genderNoun.value = resourceStore.genderNoun || 'n';

            setFieldsConfig();
        }

        async function loadFieldsData() {
            if (!resourceStore.model) {
                throw new Error('Resource not found');
            }

            const { data, pending, error } = (await useFetchWithBaseUrl(
                `/api/${resourceStore.model}/${id.value}`,
                {
                    method: 'GET',
                    params: {
                        include:
                            QUERIES.get(resourceStore.model)?.include ?? '*'
                    }
                }
            )) as {
                data: Ref<Record<string, any>>;
                pending: Ref<boolean>;
                error: Ref<any>;
            };

            pending.value = pending.value;

            if (error.value) {
                throw new Error(error.value.message);
            }

            setFieldsData(data.value);
        }

        function getId() {
            return id.value;
        }

        function setFieldsConfig() {
            if (!resourceStore.fields) {
                throw new Error('Resource fields not found');
            }

            const config = resourceStore.fields.reduce(
                (acc: Record<string, FormField>, field: FormField) => {
                    acc[field.name] = field;
                    return acc;
                },
                {}
            );

            fieldsConfig.value = config;
        }

        function getFieldsConfig() {
            return fieldsConfig.value;
        }

        function getFieldConfig(field: string) {
            if (!fieldsConfig.value[field]) {
                return;
            }

            const fieldConfig = fieldsConfig.value[field];
            return fieldConfig;
        }

        function getFieldsData() {
            return fieldsData.value;
        }

        function getFieldData(field: string) {
            return fieldsData.value[field];
        }

        function setFieldsData(data: Record<string, any>) {
            const fields = Object.keys(data).reduce(
                (acc: Record<string, any>, key: string) => {
                    if (data[key] !== null && data[key] !== undefined) {
                        acc[key] = data[key];
                    }
                    return acc;
                },
                {}
            );

            fieldsData.value = fields;
        }

        function setFieldData(field: string, value: any) {
            const fieldConfig = getFieldConfig(field);

            if (!fieldConfig) {
                return;
            }

            if (fieldConfig.valueType === 'string') {
                if (value.name) {
                    fieldsData.value[field] = value.name;
                    return;
                }
            }

            fieldsData.value[field] = value;
        }

        function unsetFieldData(field: string) {
            delete fieldsData.value[field];
        }

        function getIsAuxiliary() {
            return isAuxiliary.value;
        }

        function setIsAuxiliary(auxiliary: boolean, parent: string) {
            isAuxiliary.value = auxiliary;
            parentModel.value = parent;
        }

        function resetFieldData(field: string) {
            const fieldConfig = getFieldConfig(field);

            if (!fieldConfig) {
                return;
            }

            if (fieldConfig.valueType === 'object') {
                fieldsData.value[field] = null;
                return;
            }

            if (fieldConfig.valueType === 'array') {
                fieldsData.value[field] = [];
                return;
            }

            if (fieldConfig.valueType === 'string') {
                fieldsData.value[field] = '';
                return;
            }

            fieldsData.value[field] = null;
        }

        function addFieldData(field: string, value: Item) {
            const fieldConfig = getFieldConfig(field);

            if (!fieldConfig) {
                return;
            }

            if (fieldConfig.valueType === 'object') {
                fieldsData.value[field] = value;
                return;
            }

            if (fieldConfig.valueType === 'array') {
                addDataArrayField(field, value);
                return;
            }

            fieldsData.value[field] = value;
        }

        function addDataArrayField(field: string, value: Item) {
            if (!fieldsData.value[field]) {
                fieldsData.value[field] = [];
            }

            if (!Array.isArray(fieldsData.value[field])) {
                fieldsData.value[field] = [fieldsData.value[field]];
            }

            if (
                fieldsData.value[field].find((v: Item) => {
                    if (!value || !v) {
                        return false;
                    }

                    if (value.id) {
                        return v.id === value.id;
                    } else if (value.name) {
                        return v.name === value.name;
                    }

                    return false;
                })
            ) {
                return;
            }

            fieldsData.value[field] = [...fieldsData.value[field], value];
        }

        function removeFieldData(field: string, value: Item) {
            const fieldConfig = getFieldConfig(field);

            if (!fieldConfig) {
                return;
            }

            if (fieldConfig.valueType === 'object') {
                fieldsData.value[field] = null;
                return;
            }

            if (fieldConfig.valueType === 'array') {
                removeDataArrayField(field, value);
                return;
            }

            fieldsData.value[field] = null;
        }

        function removeDataArrayField(field: string, value: Item) {
            if (!fieldsData.value[field]) {
                return;
            }

            if (!Array.isArray(fieldsData.value[field])) {
                return;
            }

            fieldsData.value[field] = fieldsData.value[field].filter(
                (v: Item) => {
                    if (!value || !v) {
                        return false;
                    }

                    if (value.id) {
                        return v.id !== value.id;
                    } else if (value.name) {
                        return v.name !== value.name;
                    }

                    return false;
                }
            );
        }

        async function save() {
            if (!model) {
                throw new Error('Resource not found');
            }

            // TODO: The auxiliary should only be saved with the parent? [DISCUSS]
            if (getIsAuxiliary() && !id.value) {
                return;
            }

            const url = !id.value
                ? `/api/${resourceStore.model}`
                : `/api/${resourceStore.model}/${id.value}`;
            const method = !id.value ? 'POST' : 'PUT';

            const { data, error } = (await useFetchWithBaseUrl(url, {
                method: method,
                body: JSON.stringify(treatDataBeforeSave())
            })) as { data: Ref<Item>; error: Ref<any> };

            if (!getIsAuxiliary()) {
                const toast = useToast();

                if (error.value) {
                    console.error(error.value.data ?? error.value);
                    toast.add({
                        title: 'Erro ao salvar dados.',
                        color: 'red',
                        icon: 'i-heroicons-x-circle'
                    });
                    return false;
                }

                if (data.value) {
                    toast.add({
                        title: 'Dados salvos com sucesso.'
                    });
                    return data.value.id;
                }
            }
        }

        function treatDataBeforeSave() {
            const data = getFieldsData();
            const treatedData = {} as Record<string, any>;

            for (const field of Object.keys(data)) {
                const fieldConfig = getFieldConfig(field);

                if (!fieldConfig || fieldConfig.disabled) {
                    continue;
                }

                if (fieldConfig.valueType === 'boolean') {
                    treatedData[field] = getBoolean(data[field]);
                    continue;
                }

                treatedData[field] = data[field];
            }

            return treatedData;
        }

        return {
            name,
            label,
            labelPlural,
            labelSlug,
            genderNoun,
            model,
            parentModel,
            pending,
            error,
            canCreate,
            load,
            save,
            getId,
            getFieldsConfig,
            getFieldConfig,
            getFieldsData,
            getFieldData,
            setFieldData,
            getIsAuxiliary,
            setIsAuxiliary,
            resetFieldData,
            addFieldData,
            removeFieldData,
            unsetFieldData
        };
    });
};
