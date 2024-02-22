import express from 'express';
import jwt from 'jsonwebtoken';
import getCookiePrefix from '~/utils/getCookiePrefix';
import { InvalidCredentialError } from '../error';

const csrfHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO: Review exceptions
    const exceptions = ['/api/auth/login'];

    if (req.method !== 'GET' && !exceptions.includes(req.path)) {
        const csrf = req.headers['x-csrf-token'];

        const cookieName = getCookiePrefix() + 'jwt';

        const token = req.cookies[cookieName];

        if (!token || !csrf) {
            throw new InvalidCredentialError('Invalid CSRF token');
        }

        try {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, { ignoreExpiration: true, maxAge: '3h' });
        } catch (error) {
            //throw new InvalidCredentialError('Invalid CSRF token');
        }

        const csrfToken = jwt.decode(token) as { csrf: string };

        if (csrfToken.csrf !== csrf) {
            throw new InvalidCredentialError('Invalid CSRF token');
        }
    }

    next();
}


export default csrfHandler;