// https://stackoverflow.com/questions/1229518/javascript-regex-replace-html-chars
export default function replaceHtmlEntities(str: string): string {
    const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    
    const translate = {
        nbsp: String.fromCharCode(160), // Non-breaking space
        amp: '&',
        quot: '"',
        lt: '<',
        gt: '>'
    };

    // @ts-ignore
    const translator = (match: string, entity: string) => translate[entity];

    if (typeof str !== 'string') {
        return str;
    }

    return str.replace(translate_re, translator);
}
