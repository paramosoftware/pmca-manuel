export default function getBoolean(value: any) {
    switch (typeof value) {
        case 'boolean':
            return value;
        case 'number':
            if (value === 1) {
                return true;
            } else if (value === 0) {
                return false;
            } else {
                return undefined;
            }
        case 'string':
            value = value.trim().toLowerCase();

            if (value === 'true' || value === '1' || value === 'sim' || value === 's') {
                return true;
            } else if (value === 'false' || value === '0' || value === 'não' || value === 'n' || value === 'nao') {
                return false;
            } else {
                return undefined;
            }

        default:
            return undefined;
    }
}
