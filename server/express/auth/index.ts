import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import useGetCookiePrefix from '~/composables/useGetCookiePrefix';
import useIsSecure from '~/composables/useIsSecure';
import { prisma } from '../../prisma/prisma';
import { InvalidCredentialError } from '../error';

const router = express.Router();

const generateToken = (email: string, type: 'access' | 'refresh', csrf?: string) => {
   
    if (type === 'access') {

        return jwt.sign(
            { email, csrf },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '10m' }
        );

    } else if (type === 'refresh') {

        return jwt.sign(
            { email },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '1d' }
        );
    }

    throw new Error('Invalid token type');
}

const setAccessTokenCookie = (res: express.Response, accessToken: string) => {

    const cookieName = useGetCookiePrefix() + 'jwt';
    
    res.cookie(cookieName, accessToken, {
        secure: useIsSecure(),
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    });
}

const setCsrfCookie = (res: express.Response, csrf: string) => {

    const cookieName = useGetCookiePrefix() + 'csrf';

    res.cookie(cookieName, csrf, {
        secure: useIsSecure(),
        sameSite: 'strict',
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24
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

const logout = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {

        const accessToken = req.cookies[useGetCookiePrefix() + 'jwt'];

        if (!accessToken) {
            throw new InvalidCredentialError('Invalid credentials');
        }

        if (!isJwtValid(accessToken, process.env.ACCESS_TOKEN_SECRET!, true)) {
            throw new InvalidCredentialError('Invalid credentials');
        }

        const { email } = jwt.decode(accessToken) as { email: string };
        await updateUserRefreshToken(email, null);
        
        res.clearCookie(useGetCookiePrefix() + 'jwt');
        res.clearCookie(useGetCookiePrefix() + 'csrf');

        res.json({ message: 'Logged out' });

    } catch (error) {
      next(error);
    }
}

const isJwtValid = (token: string, secret: string, ignoreExpiration = false) => {
    try {
        jwt.verify(token, secret, { ignoreExpiration });
        return true;
    } catch (error) {
        return false;
    }
}


router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);

        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new InvalidCredentialError('Invalid credentials');
        }
        
        const csrf = uuidv4();
        const accessToken = generateToken(user.email, 'access', csrf);
        const refreshToken = generateToken(user.email, 'refresh');

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
            return logout(req, res, next);
        }

        const isAccessTokenValid = isJwtValid(oldAccessToken, process.env.ACCESS_TOKEN_SECRET!, true);
        const isAccessTokenExpired = !isJwtValid(oldAccessToken, process.env.ACCESS_TOKEN_SECRET!);

        if (!isAccessTokenValid) {
           return logout(req, res, next);
        }

        if (!isAccessTokenExpired) {
            return res.json({ message: 'Access token is valid' });
        }
        
        const { email } = jwt.decode(oldAccessToken) as { email: string };

        const user = await findUserByEmail(email);

        if (!user || !user.refreshToken) {
            return logout(req, res, next);
        }

        const isRefreshTokenValid = isJwtValid(user.refreshToken, process.env.REFRESH_TOKEN_SECRET!);

        if (!isRefreshTokenValid) {
            return logout(req, res, next);
        }

        const csrf = uuidv4();
        const newAccessToken = generateToken(user.email, 'access', csrf);
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

        await logout(req, res, next);

    } catch (error) {
      next(error);
    }
});




export default router;
