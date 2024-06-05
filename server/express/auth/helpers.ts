import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import decodeJwt from '~/utils/decodeJwt';
import getCookieOptions from '~/utils/getCookieOptions';
import hashPassword from '~/utils/hashPassword';
import { prisma } from '../../prisma/prisma';
import { UnauthorizedError, ForbiddenError } from '../error';

const ACCESS_COOKIE_NAME = 'access';
const CSRF_COOKIE_NAME = 'csrf';

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

    const accessCookie = getCookieOptions(ACCESS_COOKIE_NAME, true);
    const csrfCookie = getCookieOptions(CSRF_COOKIE_NAME, true);

    res.clearCookie(accessCookie.name, accessCookie.options);
    res.clearCookie(csrfCookie.name, csrfCookie.options);

    res.json({ message: 'logout' });
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
        ACCESS_COOKIE_NAME
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

    if (!user) {
        throw new UnauthorizedError('Invalid credentials');
    }

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
        ACCESS_COOKIE_NAME
    );

    const accessCookie = getCookieOptions(ACCESS_COOKIE_NAME);
    const csrfCookie = getCookieOptions(CSRF_COOKIE_NAME);

    res.cookie(accessCookie.name, newAccessToken, accessCookie.options);
    res.cookie(csrfCookie.name, csrf, csrfCookie.options);

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
    if (type === ACCESS_COOKIE_NAME) {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
            expiresIn: '10m'
        });
    } else if (type === 'refresh') {
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
            expiresIn: '7d'
        });
    }

    throw new Error('Invalid token type');
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
                    batch: groupPermission.batch ?? false,
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
                permissions[resource].batch =
                    (permissions[resource].batch || groupPermission.batch) ??
                    false;
                permissions[resource].import =
                    (permissions[resource].import || groupPermission.import) ??
                    false;
            }
        }
    }

    // TODO: Check if this is needed [DISCUSS]
    if (user.isAdmin && false) {
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

export function getAccessToken(req: express.Request) {
    let accessToken = req.headers.authorization || '';

    const accessCookieName = getCookieOptions(ACCESS_COOKIE_NAME).name;

    if (accessToken) {
        accessToken = accessToken.replace('Bearer ', '');
    } else {
        accessToken = req.cookies[accessCookieName] || '';
    }

    return accessToken;
}
