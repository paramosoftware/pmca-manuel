
import useIsSecure from './useIsSecure';

export default function useGetCookiePrefix() {

    return useIsSecure() ? '__Host-' : '';
}
