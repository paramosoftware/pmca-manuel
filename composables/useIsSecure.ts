export default function useIsSecure() {

    const config = useRuntimeConfig();

    const isSecure = config.public.baseURL.startsWith('https://');

    return isSecure;
}