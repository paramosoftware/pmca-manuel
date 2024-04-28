import stripHtmlTags from './stripHtmlTags';

export default function normalizeString(str: string, slug: boolean = false) {
    if (str === null || typeof str !== 'string') {
        return str;
    }

    str = str.trim();

    str = str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    str = stripHtmlTags(str);

    str = str.replace(/[^\p{L}\p{N}\s]/gu, '');

    if (slug) {
        str = str.replace(/\s/g, '-');
    }

    return str;
}
