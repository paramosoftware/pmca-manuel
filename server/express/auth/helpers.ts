import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import decodeJwt from '~/utils/decodeJwt';
import getCookiePrefix from '~/utils/getCookiePrefix';
import hashPassword from '~/utils/hashPassword';
import isHTTPS from '~/utils/isHTTPS';
import { prisma } from '../../prisma/prisma';
import { InvalidCredentialError, ServerError, UnauthorizedError } from '../error';


export async function logout(accessToken: string, res: express.Response, next: express.NextFunction) {
    
    const decodedToken = decodeJwt(accessToken, process.env.ACCESS_TOKEN_SECRET!, true) as { sessionId: string; };

    if (!decodedToken) {
        return next();
    }

    await deleteSession(decodedToken.sessionId);

    res.clearCookie(getCookiePrefix() + 'jwt');
    res.clearCookie(getCookiePrefix() + 'csrf');
    res.json({ message: 'Logout successful' });
}

export async function login(login: string, password: string) {

    const user = await findUserByLoginOrId(login, true) as AppUser
    
    if (!user.restricted) {
        throw new InvalidCredentialError('Invalid credentials');
    }

    if (!user || !bcrypt.compareSync(password, user.restricted.password)) {
        throw new InvalidCredentialError('Invalid credentials');
    }

    const userId = user.id;

    const refreshToken = generateToken( { userId }, 'refresh');
    const sessionId = await setSession(user.id, refreshToken);

    if (!sessionId) {
        throw new InvalidCredentialError('Invalid credentials');
    }

    const csrf = uuidv4();
    const accessToken = generateToken( { sessionId, userId, csrf , isAdmin: user.restricted.isAdmin }, 'access');
    return { accessToken, csrf };
}

export async function refreshAccessToken(accessToken: string) {


    const decodedToken = decodeJwt(accessToken, process.env.ACCESS_TOKEN_SECRET!, true) as { sessionId: string; csrf: string; };

    if (!decodedToken) {
        throw new InvalidCredentialError('Invalid credentials');
    }

    const isAccessTokenExpired = !decodeJwt(accessToken, process.env.ACCESS_TOKEN_SECRET!);

    if (!isAccessTokenExpired) {
        return { accessToken, csrf: decodedToken.csrf };
    }
    
    const session = await getSession(decodedToken.sessionId);

    if (!session) {
        throw new InvalidCredentialError('Invalid session');
    }

    if (!decodeJwt(session.refreshToken, process.env.REFRESH_TOKEN_SECRET!)) {
        throw new InvalidCredentialError('Invalid refresh token');
    }

    const user = await findUserByLoginOrId(session.userId, true) as AppUser;

    const csrf = uuidv4();
    const newAccessToken = generateToken({ sessionId: session.id, userId: user.id, csrf, isAdmin: user.restricted?.isAdmin }, 'access');

    return { accessToken: newAccessToken, csrf };

}

export async function changePassword(userId: string, password: string, currentUserId: string, isAdmin: boolean = false) {

        if (userId !== currentUserId && !isAdmin) {
            throw new UnauthorizedError('Unauthorized');
        }
    
        if (!setUserPassword(userId, password)) {
            throw new ServerError('Password could not be changed');
        }
    
        return true;
}

export async function setUserPassword(userId: string, password: string) {

    const hashedPassword = hashPassword(password);

    try {
        await prisma.appUser.update({
            where: {
                id: userId,
            },
            data: {
                restricted: {
                    update: {
                        password: hashedPassword,
                    },
                },
            },
        });
        
        return true;
    } catch (error) {
        return false;
    }
}

export async function findUserByLoginOrId(login: string, includeRestricted = false) {

    const query = {
        where: {
            OR: [
                { email: login },
                { login: login },
                { id: login    }
            ],
        },
    };

    if (includeRestricted) {
        // @ts-ignore
        query.include = {
            restricted: true,
        };
    }

    return await prisma.appUser.findFirst(query);
}

export async function deleteSession(sessionId: string) {

    try {
        await prisma.appUserSession.deleteMany({
            where: {
                id: sessionId,
            },
        });

        return true;

    } catch (error) {
        return false;
    }
}

export async function getSession(sessionId: string) {

    const session = await prisma.appUserSession.findFirst({
        where: {
            id: sessionId,
        },
    });

    return session;
}

export async function setSession(userId: string, refreshToken: string) {

    const session = await prisma.appUserSession.upsert({
        where: {
            userId_refreshToken: {
                userId,
                refreshToken,
            },
        },
        update: {
            refreshToken,
        },
        create: {
            userId,
            refreshToken,
        },
    });

    return session.id;
}

export function generateToken(payload: string | object, type: 'access' | 'refresh') {

    if (type === 'access') {

        return jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '10m' }
        );

    } else if (type === 'refresh') {

        return jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '1d' }
        );
    }

    throw new Error('Invalid token type');
}

export function setAccessTokenCookie(res: express.Response, accessToken: string) {

    const cookieName = getCookiePrefix() + 'jwt';

    res.cookie(cookieName, accessToken, {
        secure: isHTTPS(),
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    });
}

export function setCsrfCookie(res: express.Response, csrf: string) {

    const cookieName = getCookiePrefix() + 'csrf';

    res.cookie(cookieName, csrf, {
        secure: isHTTPS(),
        sameSite: 'strict',
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24
    });
}




