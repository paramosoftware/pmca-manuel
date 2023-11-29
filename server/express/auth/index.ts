import express from 'express';
import decodeJwt from '~/utils/decodeJwt';
import getCookiePrefix from '~/utils/getCookiePrefix';
import { InvalidCredentialError } from '../error';
import { setAccessTokenCookie, setCsrfCookie, login, logout, changePassword, refreshAccessToken } from './helpers';

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
        const { accessToken, csrf } = await refreshAccessToken(currentAccessToken);
        setAccessTokenCookie(res, accessToken);
        setCsrfCookie(res, csrf);

        res.json({ message: 'Access token refreshed' });

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
    const { password , userId } = req.body;

    try {
        const accessToken = req.cookies[getCookiePrefix() + 'jwt'] || '';

        const decodedToken = decodeJwt(accessToken, process.env.ACCESS_TOKEN_SECRET!) as { isAdmin: boolean; userId: string; }
    
        if (!decodedToken) {
            throw new InvalidCredentialError('Invalid credentials');
        }

        await changePassword(userId, password, decodedToken.userId, decodedToken.isAdmin);

        res.json({ message: 'Password changed' });

    } catch (error) {
        next(error);
    }
});

export default router;
