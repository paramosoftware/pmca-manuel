export default function parseNumber(value: any): any {
    if (value === undefined) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((v) => parseNumber(v));
    }

    if (value instanceof Date) {
        return value;
    }

    const parsed = Number(value);

    if (isNaN(parsed)) {
        return value;
    }

    return parsed;
}   