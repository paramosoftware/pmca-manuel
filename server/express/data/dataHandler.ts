import express from 'express';
import fs from 'fs';
import type { ParsedQs } from 'qs';
import logger from '~/utils/logger';
import capitalize from '~/utils/capitalize';
import decodeJwt from '~/utils/decodeJwt';
import getCookiePrefix from '~/utils/getCookiePrefix';
import PrismaService from '../../prisma/PrismaService';
import { exportData } from '../../prisma/export';
import { importData } from '../../prisma/import';
import { importUploadFile, uploadMedia } from '../../prisma/media';
import { ApiValidationError, ForbiddenError } from '../error';
import { prisma } from '../../prisma/prisma';
import { refreshAccessToken } from '../auth/helpers';

const dataHandler = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const { model, id, partialResource, hasQuery, isUpload, isImport, isExport, isPublic } =
        getParamsFromPath(req.path);

    // @ts-ignore
    if (!model || !prisma[model]) {
        next();
        return;
    }

    const method = req.method.toUpperCase() as Method;
    const body = req.body;
    const queryParams = req.query;
    const format = req.query.format
        ? req.query.format
        : body.format
          ? body.format
          : undefined;

    const addMedia = req.query.addMedia ? req.query.addMedia === 'true' : false;

    const accessToken = req.cookies[getCookiePrefix() + 'jwt'];

    let userId = '';
    let permissions: Permission = {};
    let isAdmin = false;

    if (!isPublic && accessToken) {
        try {
            const refreshToken = await refreshAccessToken(accessToken, res);

            const decodedToken = decodeJwt(
                refreshToken.accessToken,
                process.env.ACCESS_TOKEN_SECRET!
            ) as { userId: string; permissions: Permission; isAdmin: boolean };

            userId = decodedToken.userId;
            permissions = decodedToken.permissions;
            isAdmin = decodedToken.isAdmin;
        } catch (error) {
            logger.error(error);
            next(error);
            return;
        }
    }

    const prismaService = new PrismaService(model, true, isPublic);
    prismaService.setMethod(method);
    prismaService.setUserId(userId);
    prismaService.setPermissions(permissions);

    const canAccess = await prismaService.canAccess();

    const canImport = permissions[model] && permissions[model].import;

    if (!canAccess) {
        logger.debug({ userId, model, permissions, isAdmin }, 'Access denied');
        next(new ForbiddenError('Access denied'));
    }

    try {
        let response: any = null;
        const query = convertQueryParamsToRequest(queryParams);
        const request = method == 'GET' ? query : body;

        switch (method) {
            case 'GET':
                if (isExport) {
                    response = exportData.exportToFormat(
                        model,
                        format,
                        addMedia,
                        query
                    );
                } else if (id) {
                    response = prismaService.readOne(id, request, partialResource);
                } else {
                    response = prismaService.readMany(request);
                }
                break;
            case 'PUT':
                if (id) {
                    response = prismaService.updateOne(id, request);
                } else if (isAdmin) {
                    response = prismaService.updateMany(request);
                }
                break;
            case 'POST':
                if (id && hasQuery) {
                    response = prismaService.readOne(id, request, partialResource);
                } else if (hasQuery) {
                    response = prismaService.readMany(request);
                } else if (isUpload) {
                    response = uploadMedia(model, id, body, req, res, next);
                } else if (isImport && canImport) {
                    const importFilePath = (await importUploadFile(
                        req,
                        res,
                        next
                    )) as string;
                    await importData.importFrom(model, importFilePath);
                    response = { message: 'Imported successfully' };
                } else {
                    response = prismaService.createOne(request);
                }
                break;
            case 'DELETE':
                if (id) {
                    response = prismaService.deleteOne(id);
                } else if (hasQuery && isAdmin) {
                    response = prismaService.deleteMany(request);
                }
                break;
            default:
                next();
        }

        if (response && response instanceof Promise) {
            response = await response;
        }

        if (response && isExport) {
            res.download(response, () => {
                fs.unlinkSync(response);
            });
        } else if (response) {
            res.json(response);
        } else {
            next();
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Get the parameters from the path
 * @param path - The path
 * @returns The parameters as an object
 */
function getParamsFromPath(path: string): {
    model: string;
    id: string;
    hasQuery: boolean;
    partialResource: string;
    isPublic: boolean;
    isUpload: boolean;
    isImport: boolean;
    isExport: boolean;
} {
    const info = {
        model: '',
        id: '',
        partialResource: '',
        hasQuery: false,
        isPublic: false,
        isUpload: false,
        isImport: false,
        isExport: false
    };

    const parts = path.replace('/api/', '').split('/');

    if (parts[0] === 'public') {
        info.isPublic = true;
        parts.shift();
    }

    info.model = capitalize(parts[0]);

    parts.shift();

    if (parts[parts.length - 1] === 'query') {
        info.hasQuery = true;
        parts.pop();
    }

    if (parts[parts.length - 1] === 'upload') {
        info.isUpload = true;
        parts.pop();
    }

    if (parts[parts.length - 1] === 'import') {
        info.isImport = true;
        parts.pop();
    }

    if (parts[parts.length - 1] === 'export') {
        info.isExport = true;
        parts.pop();
    }

    if (parts.length > 0) {
        info.id = parts[0];
        info.partialResource = parts[1] || '';
    }

    return info;
}

/**
 * Convert the query parameters to a paginated query
 * @param queryParams - The query parameters from the request
 * @returns The paginated query
 * @throws ApiValidationError
 * @example Returns { pageSize: 20, page: 1, select: ['id', 'name'], where: { id: 1 }, include: ['user'], orderBy: { id: 'asc' } }
 */
function convertQueryParamsToRequest(queryParams: ParsedQs): Query {
    const body: Query = {};

    try {
        if (queryParams.pageSize) {
            body.pageSize = Number(queryParams.pageSize);
        }

        if (queryParams.page) {
            body.page = Number(queryParams.page);
        }

        if (queryParams.select) {
            body.select = JSON.parse(queryParams.select.toString());
        }

        if (queryParams.where) {
            body.where = JSON.parse(queryParams.where.toString());
        }

        if (queryParams.include) {
            if (queryParams.include === '*') {
                body.include = '*';
            } else {
                body.include = JSON.parse(queryParams.include.toString());
            }
        }

        if (queryParams.orderBy) {
            body.orderBy = JSON.parse(queryParams.orderBy.toString());
        }

        return body;
    } catch (error: SyntaxError | any) {
        logger.error(error);
        throw new ApiValidationError(
            'Invalid query parameters: ' +
                (process.env.NODE_ENV === 'development' ? error.message : '')
        );
    }
}

export default dataHandler;
