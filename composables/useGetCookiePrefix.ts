export default function useGetCookiePrefix() {

    const config = useRuntimeConfig();

    const isSecure = config.public.baseURL.startsWith('https://');
    const cookiePrefix = isSecure ? '__Host-' : '';

    return cookiePrefix;
}
