import isHTTPS from './isHTTPS';
import type { CookieOptions } from 'express';


export default function getCookieOptions(name: string, unset = false) {
    const prefix = isHTTPS() ? '__Host-' : '';

    const options = {
        name: prefix + name,
        options: {
            httpOnly: name === 'access',
            secure: isHTTPS(),
            sameSite: name === 'access' ? 'lax' : 'strict'
        }
    } as { name: string; options: CookieOptions };

    if (unset) {
        options.options.expires = new Date(0);
    } else {
        options.options.expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    }

    return options;
}
