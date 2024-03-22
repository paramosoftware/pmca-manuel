import sanitizeHtml from 'sanitize-html';

export default function stripHtmlTags(
    str: string,
    allowedTags: string[] = [],
    allowedAttributes: any = {}
) {
    if (str === null || typeof str !== 'string') {
        return str;
    }
    str = sanitizeHtml(str, {
        allowedTags: allowedTags,
        allowedAttributes: allowedAttributes
    });

    return str;
}
