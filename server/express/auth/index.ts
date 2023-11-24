import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import useGetCookiePrefix from '~/composables/useGetCookiePrefix';
import { prisma } from '../../prisma/prisma';
import { InvalidCredentialError } from '../error';

const router = express.Router();

const generateToken = (email: string, type: string, expiresIn: string, csrf?: string) => {
    if (type === 'access') {

        return jwt.sign(
            { email, csrf },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn }
        );

    } else if (type === 'refresh') {

        return jwt.sign(
            { email },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn }
        );
    }

    throw new Error('Invalid token type');
}

const setAccessTokenCookie = (res: express.Response, accessToken: string) => {

    const cookieName = useGetCookiePrefix() + 'jwt';
    
    res.cookie(cookieName, accessToken, {
        secure: useGetCookiePrefix() === '__Host-',
        sameSite: 'strict',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 2
    });
}

// TODO: Consider using localStorage instead of cookie (questions with SSR)
const setCsrfCookie = (res: express.Response, csrf: string) => {

    const cookieName = useGetCookiePrefix() + 'csrf';

    res.cookie(cookieName, csrf, {
        secure: useGetCookiePrefix() === '__Host-',
        sameSite: 'strict',
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 2
    });
}

const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: {
            email,
        },
    });
}

const updateUserRefreshToken = async (email: string, refreshToken: string | null) => {
    await prisma.user.update({
        where: {
            email,
        },
        data: {
            refreshToken,
        },
    });
}

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        if (!user) {
            throw new InvalidCredentialError('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            throw new InvalidCredentialError('Invalid credentials');
        }
        
        const csrf = uuidv4();
        const accessToken = generateToken(user.email, 'access', '10m', csrf);
        const refreshToken = generateToken(user.email, 'refresh', '7d');

        await updateUserRefreshToken(email, refreshToken);

        setAccessTokenCookie(res, accessToken);
        setCsrfCookie(res, csrf);

        res.json({ message: 'Login successful' });
    } catch (error) {
        next(error);
    }
});

router.get('/refresh', async (req, res, next) => {
    try {


        const oldAccessToken = req.cookies[useGetCookiePrefix() + 'jwt']

        if (!oldAccessToken) {
            throw new InvalidCredentialError('Invalid credentials');
        }

        let isAccessTokenValid = true;
        try {
            jwt.verify(oldAccessToken, process.env.ACCESS_TOKEN_SECRET!);
        }
        catch (error) {
            isAccessTokenValid = false;
        }

        if (isAccessTokenValid) {
            return res.json({ message: 'Access token is valid' });
        }
        
        const { email } = jwt.decode(oldAccessToken) as { email: string };

        const user = await findUserByEmail(email);
        if (!user || !user.refreshToken) {
            throw new InvalidCredentialError('Invalid credentials');
        }

        const csrf = uuidv4();
        const newAccessToken = generateToken(user.email, 'access', '10m', csrf);
        const newRefreshToken = generateToken(user.email, 'refresh', '7d');

        await updateUserRefreshToken(email, newRefreshToken);

        setAccessTokenCookie(res, newAccessToken);
        setCsrfCookie(res, csrf);

        res.json({ message: 'Access token is refreshed' });
    } catch (error) {
        next(error);
    }
});

// TODO: Remove this route and move to role based authorization
router.get('/isadmin', async (req, res, next) => {
    try {
        
        const accessToken = req.cookies[useGetCookiePrefix() + 'jwt'];
        
        if (!accessToken) {
            throw new InvalidCredentialError('Invalid credentials');
        }
  
        const { email } = jwt.decode(accessToken) as { email: string };
        const user = await findUserByEmail(email);
        
        if (!user) {
            throw new InvalidCredentialError('Invalid credentials');
        }

        const isAdmin = (user.role == 1);

        res.json(isAdmin);
    } catch (error) {
        next(error);
    }
});

router.post('/logout', async (req, res, next) => {
    try {

        const accessToken = req.cookies[useGetCookiePrefix() + 'jwt'];
        const { email } = jwt.decode(accessToken) as { email: string };
        await updateUserRefreshToken(email, null);
        
        res.clearCookie(useGetCookiePrefix() + 'jwt');
        res.clearCookie(useGetCookiePrefix() + 'csrf');

        res.json({ message: 'Logged out successfully' });

    } catch (error) {
      next(error);
    }
});




export default router;
