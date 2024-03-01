import express from 'express';
import decodeJwt from '~/utils/decodeJwt';
import getCookiePrefix from '~/utils/getCookiePrefix';
import { UnauthorizedError, ServerError } from '../error';
import { setAccessTokenCookie, setCsrfCookie, login, logout, refreshAccessToken, setUserPassword } from './helpers';

const router = express.Router();

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const { accessToken, csrf } = await login(email, password);
        setAccessTokenCookie(res, accessToken);
        setCsrfCookie(res, csrf);
        res.json({ message: 'Login successful' });

    } catch (error) {
        next(error);
    }
});

router.get('/refresh', async (req, res, next) => {

    const currentAccessToken = req.cookies[getCookiePrefix() + 'jwt'] || '';

    try {
        await refreshAccessToken(currentAccessToken, res);
        res.json({ message: 'refreshed' });
    } catch (error) {
        await logout(currentAccessToken, res, next);
    }
});

router.post('/logout', async (req, res, next) => {
    try {

        const currentAccessToken = req.cookies[getCookiePrefix() + 'jwt'] || '';

        await logout(currentAccessToken, res, next);

    } catch (error) {
      next(error);
    }
});

router.post('/change-password', async (req, res, next) => {
    const { password } = req.body;

    try {
        const accessToken = req.cookies[getCookiePrefix() + 'jwt'] || '';

        const decodedToken = decodeJwt(accessToken, process.env.ACCESS_TOKEN_SECRET!) as { isAdmin: boolean; userId: string; }
    
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

    const accessToken = req.cookies[getCookiePrefix() + 'jwt'] || '';

    try {
        const decodedToken = decodeJwt(accessToken, process.env.ACCESS_TOKEN_SECRET!) as { 
            isAdmin: boolean; 
            userId: string; 
            permissions: Permission;
            name: string;
        }

        if (!decodedToken) {
            throw new UnauthorizedError('Invalid credentials');
        }

        res.json({ isAdmin: decodedToken.isAdmin, id: decodedToken.userId, permissions: decodedToken.permissions, name: decodedToken.name });

    } catch (error) {
        await logout(accessToken, res, next);
    }
});


export default router;
