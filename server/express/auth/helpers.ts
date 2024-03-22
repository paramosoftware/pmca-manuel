import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import decodeJwt from '~/utils/decodeJwt';
import getCookiePrefix from '~/utils/getCookiePrefix';
import hashPassword from '~/utils/hashPassword';
import isHTTPS from '~/utils/isHTTPS';
import { prisma } from '../../prisma/prisma';
import { UnauthorizedError, ForbiddenError } from '../error';

export async function logout(
    accessToken: string,
    res: express.Response,
    next: express.NextFunction
) {
    const decodedToken = decodeJwt(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!,
        true
    ) as { sessionId: string };

    if (!decodedToken) {
        return next();
    }

    await deleteSession(decodedToken.sessionId);

    res.clearCookie(getCookiePrefix() + 'jwt');
    res.clearCookie(getCookiePrefix() + 'csrf');
    res.json({ message: 'Logout successful' });
}

export async function login(login: string, password: string) {
    const user = (await findUserByLoginOrId(login)) as User;

    if (
        !user ||
        user.isBlocked ||
        !bcrypt.compareSync(password, user.password)
    ) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const userId = user.id;

    const permissions = await getPermissions(user);

    const refreshToken = generateToken({ userId }, 'refresh');
    const sessionId = await setSession(user.id, refreshToken);

    if (!sessionId) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const csrf = uuidv4();
    const accessToken = generateToken(
        {
            sessionId,
            userId,
            csrf,
            isAdmin: user.isAdmin,
            permissions,
            name: user.name
        },
        'access'
    );
    return { accessToken, csrf };
}

export async function refreshAccessToken(
    accessToken: string,
    res: express.Response
) {
    const decodedToken = decodeJwt(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!,
        true
    ) as { sessionId: string; csrf: string; userId: string };

    if (!decodedToken) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const isAccessTokenExpired = !decodeJwt(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
    );

    const user = (await findUserByLoginOrId(decodedToken.userId)) as User;

    if (user.isBlocked) {
        throw new ForbiddenError('User is blocked');
    }

    if (!isAccessTokenExpired) {
        return { accessToken, csrf: decodedToken.csrf };
    }

    const session = await getSession(decodedToken.sessionId);

    if (!session) {
        throw new UnauthorizedError('Invalid session');
    }

    if (!decodeJwt(session.refreshToken, process.env.REFRESH_TOKEN_SECRET!)) {
        throw new UnauthorizedError('Invalid refresh token');
    }

    const permissions = await getPermissions(user);

    const csrf = uuidv4();
    const newAccessToken = generateToken(
        {
            sessionId: session.id,
            userId: user.id,
            csrf,
            isAdmin: user.isAdmin,
            permissions,
            name: user.name
        },
        'access'
    );

    setAccessTokenCookie(res, newAccessToken);
    setCsrfCookie(res, csrf);

    return { accessToken: newAccessToken, csrf };
}

export async function setUserPassword(userId: string, password: string) {
    const hashedPassword = hashPassword(password);

    try {
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                password: hashedPassword
            }
        });

        return true;
    } catch (error) {
        return false;
    }
}

export async function findUserByLoginOrId(login: string) {
    const query = {
        where: {
            OR: [{ email: login }, { login: login }, { id: login }]
        }
    };

    return await prisma.user.findFirst(query);
}

export async function deleteSession(sessionId: string) {
    try {
        await prisma.userSession.deleteMany({
            where: {
                id: sessionId
            }
        });

        return true;
    } catch (error) {
        return false;
    }
}

export async function getSession(sessionId: string) {
    const session = await prisma.userSession.findFirst({
        where: {
            id: sessionId
        }
    });

    return session;
}

export async function setSession(userId: string, refreshToken: string) {
    const session = await prisma.userSession.upsert({
        where: {
            userId_refreshToken: {
                userId,
                refreshToken
            }
        },
        update: {
            refreshToken
        },
        create: {
            userId,
            refreshToken
        }
    });

    return session.id;
}

export function generateToken(
    payload: string | object,
    type: 'access' | 'refresh'
) {
    if (type === 'access') {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
            expiresIn: '10m'
        });
    } else if (type === 'refresh') {
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
            expiresIn: '1d'
        });
    }

    throw new Error('Invalid token type');
}

export function setAccessTokenCookie(
    res: express.Response,
    accessToken: string
) {
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

async function getPermissions(user: User) {
    const permissions = {} as Permission;

    if (user.groupId && !user.isBlocked) {
        const groupPermissions = await prisma.groupPermission.findMany({
            where: {
                groupId: {
                    in: [user.groupId]
                }
            },
            include: {
                resource: true
            }
        });

        for (const groupPermission of groupPermissions) {
            const resource = groupPermission.resource.name as string;

            if (!permissions[resource]) {
                permissions[resource] = {
                    create: groupPermission.create ?? false,
                    read: groupPermission.read ?? false,
                    update: groupPermission.update ?? false,
                    delete: groupPermission.delete ?? false,
                    import: groupPermission.import ?? false
                };
            } else {
                permissions[resource].create =
                    (permissions[resource].create || groupPermission.create) ??
                    false;
                permissions[resource].read =
                    (permissions[resource].read || groupPermission.read) ??
                    false;
                permissions[resource].update =
                    (permissions[resource].update || groupPermission.update) ??
                    false;
                permissions[resource].delete =
                    (permissions[resource].delete || groupPermission.delete) ??
                    false;
                permissions[resource].import =
                    (permissions[resource].import || groupPermission.import) ??
                    false;
            }
        }
    }

    if (user.isAdmin) {
        const resources = await prisma.resource.findMany();
        for (const resource of resources) {
            permissions[resource.name] = {
                create: true,
                read: true,
                update: true,
                delete: true,
                import: true
            };
        }
    }

    return permissions;
}
