import getCookiePrefix from '../utils/getCookiePrefix';

export const useFetchWithBaseUrl: typeof useFetch = (request, opts?) => {
    const config = useRuntimeConfig();

    let headers = useRequestHeaders();

    if (opts?.method && opts?.method != 'GET') {
        const csrfToken = useCookie(getCookiePrefix() + 'csrf');
        if (csrfToken.value) {
            headers = {
                ...headers,
                'X-CSRF-Token': csrfToken.value
            };
        }
    }

    const accessToken = useState('access');
    if (accessToken.value && process.server) {
        headers = {
            ...headers,
            Authorization: `Bearer ${accessToken.value}`
        };
    }

    return useFetch(request, {
        headers: headers,
        baseURL: config.public.baseURL,
        credentials: 'include',
        ...opts
    });
};
