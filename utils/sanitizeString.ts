import sanitizeHtml from 'sanitize-html';

export default function sanitizeString(str: string) {
    if (str === null || typeof str !== 'string') {
        return str;
    }

    str = sanitizeHtml(str);

    return str;
}
