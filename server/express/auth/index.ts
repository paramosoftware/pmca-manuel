import express from 'express';
import decodeJwt from '~/utils/decodeJwt';
import getCookieOptions from '~/utils/getCookieOptions';
import { UnauthorizedError, ServerError } from '../error';
import {
    login,
    logout,
    refreshAccessToken,
    setUserPassword,
    getAccessToken
} from './helpers';

const router = express.Router();
const ACCESS_COOKIE_NAME = 'access';
const CSRF_COOKIE_NAME = 'csrf';

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const { accessToken, csrf } = await login(email, password);
        const accessCookie = getCookieOptions(ACCESS_COOKIE_NAME);
        const csrfCookie = getCookieOptions(CSRF_COOKIE_NAME);

        res.cookie(accessCookie.name, accessToken, accessCookie.options);
        res.cookie(csrfCookie.name, csrf, csrfCookie.options);

        res.json({ message: 'Login successful' });
    } catch (error) {
        next(error);
    }
});

router.get('/refresh', async (req, res, next) => {
    const currentAccessToken = getAccessToken(req);
    try {
        const tokens = await refreshAccessToken(currentAccessToken, res);
        res.json(tokens);
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

router.post('/logout', async (req, res, next) => {
    try {
        const currentAccessToken = getAccessToken(req);
        await logout(currentAccessToken, res, next);
    } catch (error) {
        next(error);
    }
});

router.post('/change-password', async (req, res, next) => {
    const { password } = req.body;

    try {
        const accessToken = getAccessToken(req);

        const decodedToken = decodeJwt(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET!
        ) as { isAdmin: boolean; userId: string };

        if (!decodedToken) {
            throw new UnauthorizedError('Invalid credentials');
        }

        if (!setUserPassword(decodedToken.userId, password)) {
            throw new ServerError('Password could not be changed');
        }

        res.json({ message: 'Password changed' });
    } catch (error) {
        next(error);
    }
});

router.get('/user', async (req, res, next) => {
    const accessToken = getAccessToken(req);
    try {
        const decodedToken = decodeJwt(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET!
        ) as {
            isAdmin: boolean;
            userId: string;
            permissions: Permission;
            name: string;
        };

        if (!decodedToken) {
            throw new UnauthorizedError('Invalid credentials');
        }

        res.json({
            isAdmin: decodedToken.isAdmin,
            id: decodedToken.userId,
            permissions: decodedToken.permissions,
            name: decodedToken.name
        });
    } catch (error) {
        next(error);
    }
});

export default router;
