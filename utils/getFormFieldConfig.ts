export default function getFormFieldConfig(attribute: string, defaultValue: any,  props: { [key: string]: any }) {

    if (props.formStore && typeof createFormStore) {

        if (!props.id) {
            throw new Error('Id not set');
        }

        const fieldConfig = props.formStore.getFieldConfig(props.id);

        if (fieldConfig) {
            // @ts-ignore
            return computed(() => fieldConfig[attribute] ?? defaultValue);
        }

    } else if (props) {
        return computed(() => props[attribute] ?? defaultValue);
    }

    return computed(() => defaultValue);
}