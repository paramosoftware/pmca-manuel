export default function isHTTPS() {

    const config = useRuntimeConfig();

    const isSecure = config.public.baseURL.startsWith('https://');

    return isSecure;
}