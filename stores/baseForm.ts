export const createFormStore = (name: string) => {
    return defineStore(name, () => {

        const id = ref<ID>('');
        const model = ref('');
        const label = ref('');
        const labelPlural = ref('');
        const labelSlug = ref('');
        const genderNoun = ref('n');
        const fieldsData = ref<Record<string, any>>({});
        const fieldsConfig = ref<Record<string, FormField>>({});
        const isAuxiliary = ref(false);
        const resourceStore = useResourceStore();
        const pending = ref(false);
        const error = ref('');


        async function load(resourceIdentifier: string, itemId?: ID) {

            if (!resourceIdentifier) {
                throw new Error('Resource not set');
            }

            if (itemId) {
                id.value = itemId;
            }

            await loadResource(resourceIdentifier);

            if (id.value) {
                await loadFieldsData();
            } else {
                setEmptyFields();
            }

        }

        async function loadResource(resourceIdentifier: string) {
            await resourceStore.fetch(resourceIdentifier);

            if (!resourceStore.model) {
                throw new Error('Resource not found');
            }

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

            const { data, pending, error } = await useFetchWithBaseUrl(`/api/${resourceStore.model}/${id.value}`);

            pending.value = pending.value;

            if (error.value) {
                throw new Error(error.value.message);
            }

            fieldsData.value = data.value;
        }

        function getId() {
            return id.value;
        }

        function setFieldsConfig() {

            if (!resourceStore.fields) {
                throw new Error('Resource fields not found');
            }

            const config = resourceStore.fields.reduce((acc: Record<string, FormField>, field: FormField) => {
                acc[field.name] = field;
                return acc;
            }, {});

            fieldsConfig.value = config;
        }

        function getFieldsConfig() {
            return fieldsConfig.value;
        }

        function getFieldConfig(field: string) {
            if (!fieldsConfig.value[field]) {
                throw new Error(`Field ${field} not found`);
            }

            const fieldConfig = fieldsConfig.value[field];
            return fieldConfig;
        }

        function getFieldsData() {
            return fieldsData.value;
        }

        function getFieldData(field: string) {
            if (!fieldsData.value[field]) {
                return undefined;
            }

            return fieldsData.value[field];
        }

        function setFieldData(field: string, value: any) {

            const fieldConfig = getFieldConfig(field);

            if (fieldConfig.valueType === 'string') {
                if (value.name) {
                    fieldsData.value[field] = value.name;
                    return;
                }
            }

            fieldsData.value[field] = value;
        }

        function getIsAuxiliary() {
            return isAuxiliary.value;
        }

        function setIsAuxiliary(auxiliary: boolean) {
            isAuxiliary.value = auxiliary;
        }

        function resetFieldData(field: string) {

            const fieldConfig = getFieldConfig(field);

            if (fieldConfig.valueType === 'object') {
                fieldsData.value[field] = {};
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

            if (fieldsData.value[field].find((v: Item) => {

                if (!value || !v) { return false; }

                if (value.id) {
                    return v.id === value.id;
                } else if (value.name) {
                    return v.name === value.name;
                }

                return false;

            })) {
                return;
            }

            fieldsData.value[field] = [...fieldsData.value[field], value];
        }

        function removeFieldData(field: string, value: Item) {

            const fieldConfig = getFieldConfig(field);

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

            fieldsData.value[field] = fieldsData.value[field].filter((v: Item) => {

                if (!value || !v) { return false; }

                if (value.id) {
                    return v.id !== value.id;
                } else if (value.name) {
                    return v.name !== value.name;
                }

                return false;
            });
        }

        function setEmptyFields() {
            fieldsData.value = createEmptyFields();
        }

        function createEmptyFields() {

            const fields = {} as Record<string, any>;

            for (const field of Object.keys(fieldsConfig.value)) {
                const fieldConfig = getFieldConfig(field);

                if (fieldConfig.valueType === 'array') {
                    fields[field] = [];
                } else if (fieldConfig.valueType === 'object') {
                    fields[field] = {};
                } else {
                    fields[field] = null;
                }
            }

            return fields;
        }

        async function save() {

            if (!model) {
                throw new Error('Resource not found');
            }

            if (!id.value) {

                const { data: saved, error } = await useFetchWithBaseUrl(`/api/${resourceStore.model}`, {
                    method: 'POST',
                    body: JSON.stringify(fieldsData.value)
                });

                if (error.value) {
                    throw new Error(error.value.message);
                }

                id.value = saved.value.id;

            } else {

                const { data: data, error } = await useFetchWithBaseUrl(`/api/${resourceStore.model}/${id.value}`, {
                    method: 'PUT',
                    body: JSON.stringify(fieldsData.value)
                });

                if (error.value) {
                    throw new Error(error.value.message);
                }
            }

            const toast = useToast();

            toast.add({
                title: 'Dados salvos com sucesso.',
                ui: { rounded: 'rounded-sm', padding: 'p-5' }
            })

            if (process.client) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }

        return {
            label,
            labelPlural,
            labelSlug,
            genderNoun,
            model,
            pending,
            error,
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
            removeFieldData
        }
    });
}