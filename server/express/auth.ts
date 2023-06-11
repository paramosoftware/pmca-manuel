import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import InvalidCredentialError  from './errors/InvalidCredentialError'
import { prisma } from '../prisma/prisma';
import { User } from '@prisma/client';

const router = express.Router();


const generateAccessToken = (user: User) => {
    const expiresIn = '10m';
    const accessToken = process.env.ACCESS_TOKEN_SECRET!;
    const email = user.email;

    return jwt.sign({ email }, accessToken, { expiresIn });
}

const generateRefreshToken = (user: User) => {
    const expiresIn = '7d';
    const refreshToken = process.env.REFRESH_TOKEN_SECRET!;
    const email = user.email;

    return jwt.sign({ email }, refreshToken, { expiresIn });
}


const setAccessTokenCookie = (res: express.Response, accessToken: string) => { 
    res.cookie('token', accessToken, { // TODO: set flags to true in production
        secure: false, 
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
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await updateUserRefreshToken(email, refreshToken);

        setAccessTokenCookie(res, accessToken);

        res.json({ message: 'Login successful' });
    } catch (error) {
        next(error);
    }
});

router.get('/refresh', async (req, res, next) => {
    try {
        const oldAccessToken = req.cookies.token;
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
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        await updateUserRefreshToken(email, newRefreshToken);

        setAccessTokenCookie(res, newAccessToken);
        res.json({ message: 'Access token is refreshed' });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', async (req, res, next) => {
    try {
        const accessToken = req.cookies.token;
        const { email } = jwt.decode(accessToken) as { email: string };
        await updateUserRefreshToken(email, null);
        
        res.clearCookie('token');
        res.json({ message: 'Logged out successfully' });

    } catch (error) {
      next(error);
    }
});




export default router;
