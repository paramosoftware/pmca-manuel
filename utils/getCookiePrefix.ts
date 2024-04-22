import isHTTPS from './isHTTPS';

export default function getCookiePrefix() {
    return isHTTPS() ? '__Host-' : '';
}
