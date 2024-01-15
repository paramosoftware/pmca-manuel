export const useCamelCase = () => {
    const to = (str: string) => {
        // https://stackoverflow.com/questions/2970525/converting-a-string-with-spaces-into-camel-case
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    };

    const from = (str: string) => {
        // https://stackoverflow.com/questions/54246477/how-to-convert-camelcase-to-snake-case
        return str.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`);
    }

    return { to, from };
}