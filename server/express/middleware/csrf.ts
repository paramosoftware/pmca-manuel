import InvalidCredentialError from '../errors/InvalidCredentialError'
import express from 'express'
import jwt from 'jsonwebtoken'
import useGetCookiePrefix from '~/composables/useGetCookiePrefix';

const csrf = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO: Review exceptions
    const exceptions = ['/api/auth/login', '/api/entries/by-slug', '/api/entries/search'];

    if (req.method !== 'GET' && req.path !== '/api/auth/login' && !exceptions.includes(req.path)) {
        const csrf = req.headers['x-csrf-token'];

        const cookieName = useGetCookiePrefix() + 'jwt';

        const token = req.cookies[cookieName];

        if (!token || !csrf) {
            throw new InvalidCredentialError('Invalid CSRF token');
        }

        try {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, { ignoreExpiration: true, maxAge: '3h' });
        } catch (error) {
            throw new InvalidCredentialError('Invalid CSRF token');
        }

        const csrfToken = jwt.decode(token) as { csrf: string };

        if (csrfToken.csrf !== csrf) {
            throw new InvalidCredentialError('Invalid CSRF token');
        }
    }

    next();
}


export default csrf;