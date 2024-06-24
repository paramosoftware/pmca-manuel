import express from 'express';
import fs from 'fs';
import type { ParsedQs } from 'qs';
import logger from '~/utils/logger';
import capitalize from '~/utils/capitalize';
import decodeJwt from '~/utils/decodeJwt';
import parseNumber from '~/utils/parseNumber';
import getDataFolderPath from '~/utils/getDataFolderPath';
import PrismaService from '../../prisma/PrismaService';
import { v4 as uuidv4 } from 'uuid';
import { ApiValidationError, ForbiddenError, UploadError } from '../error';
import { refreshAccessToken, getAccessToken } from '../auth/helpers';
import multer from 'multer';
import path from 'path';

const dataHandler = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const {
        model,
        id,
        partialResource,
        hasQuery,
        isUpload,
        isImport,
        isExport,
        isPublic,
        apiMethod
    } = getParamsFromPath(req.path);

    // @ts-ignore
    if (!model || !PrismaService.modelExists(model)) {
        next();
        return;
    }
    
    const requestMethod = req.method.toUpperCase() as Method;
    
    const body = req.body;
    const queryParams = req.query;
    const format = req.query.format
        ? req.query.format
        : body.format
          ? body.format
          : undefined;
    const addMedia = req.query.addMedia ? req.query.addMedia === 'true' : false;
    
    const accessToken = getAccessToken(req);

    let userId = '';
    let permissions: Permission = {};
    let isAdmin = false;
    if (!isPublic && accessToken) {
        try {
            const refreshToken = await refreshAccessToken(accessToken, res);

            const decodedToken = decodeJwt(
                refreshToken.accessToken,
                process.env.ACCESS_TOKEN_SECRET!
            ) as UserToken;

            userId = decodedToken.userId;
            permissions = decodedToken.permissions;
            isAdmin = decodedToken.isAdmin;
        } catch (error) {
            logger.error(error);
            next(error);
            return;
        }
    }

    const prismaService = new PrismaService(model, true, isPublic, isPublic);
    prismaService.setMethod(requestMethod);
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
        
        const request = requestMethod == 'GET' ? query : body;

        if (apiMethod) {
            response = executeApiMethod(apiMethod, prismaService, id, request);
            
        } else {
            switch (requestMethod) {
                case 'GET':
                    if (isExport) {
                        response = prismaService.exportToFormat(
                            format,
                            addMedia,
                            query
                        );
                    } else if (id) {
                        response = prismaService.readOne(
                            id,
                            request,
                            partialResource
                        );
                    } else {
                        response = prismaService.readMany(request);
                    }
                    break;
                case 'PUT':
                    if (id) {
                        response = prismaService.updateOne(id, request);
                    } else {
                        response = prismaService.updateMany(request);
                    }
                    break;
                case 'POST':
                    if (id && hasQuery) {
                        response = prismaService.readOne(
                            id,
                            request,
                            partialResource
                        );
                    } else if (hasQuery) {
                        response = prismaService.readMany(request);
                    } else if (isUpload) {
                        response = uploadMedia(prismaService, id, req, res, next);
                    } else if (isImport && canImport) {
                        const importFilePath = (await importUploadFile(
                            req,
                            res,
                            next
                        )) as string;
                        // mode is accessible only after multipart form data is parsed by multer
                        const mode = req.body.mode ? req.body.mode : 'merge';
                        response = prismaService.importData(
                            importFilePath,
                            mode
                        );
                    } else {
                        response = prismaService.createOne(request);
                    }
                    break;
                case 'DELETE':
                    if (id) {
                        response = prismaService.deleteOne(id);
                    } else if (hasQuery) {
                        response = prismaService.deleteMany(request);
                    }
                    break;
                default:
                    next();
            }
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
 * Execute an API method
 * @param apiMethod - The API method
 * @param prismaService - The Prisma service
 * @param id - The ID
 * @param request - The request
 * @param res - The response
 * @param next - The next function
 */
function executeApiMethod(
    apiMethod: string,
    prismaService: PrismaService,
    id: ID,
    request: any
) {
    const mappedMethods = {
        progress: 'getProgress',
        ancestors: 'findAncestors',
        descendants: 'findDescendants',
        trees: 'findTrees',
        treeDepth: 'findTreeDepth',
        treeIds: 'findTreeIds',
        availableLetters: 'getAvailableLetters'
    } as Record<string, string>;

    if (mappedMethods[apiMethod]) {
        // @ts-ignore
        return prismaService[mappedMethods[apiMethod]](
            parseNumber(id),
            request
        );
    } else {
        throw new ApiValidationError('Invalid API method');
    }
}

/**
 * Get the parameters from the path
 * @param path - The path
 * @returns The parameters as an object
 */
function getParamsFromPath(path: string) {
    const info = {
        model: '',
        id: null,
        partialResource: '',
        hasQuery: false,
        isPublic: false,
        isUpload: false,
        isImport: false,
        isExport: false,
        apiMethod: ''
    } as ApiParams;

    const parts = path.replace('/api/', '').split('/');

    if (parts[0] === 'public') {
        info.isPublic = true;
        parts.shift();
    }

    info.model = capitalize(parts[0]);
    parts.shift();

    const lastPart = parts[parts.length - 1];

    if (typeof lastPart === 'string' && lastPart.startsWith('@')) {
        info.apiMethod = lastPart.substring(1);
        parts.pop();
    }

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



async function importUploadFile(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    destinationFolder: string = ''
) {
    if (!destinationFolder) {
        destinationFolder = getDataFolderPath('temp');
    }

    if (!fs.existsSync(destinationFolder)) {
        next(new UploadError('Destination folder does not exist'));
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationFolder);
        },
        filename: function (req, file, cb) {
            cb(null, uuidv4() + path.extname(file.originalname));
        }
    });

    const upload = multer({
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 100 }
    }).single('file');

    return new Promise((resolve, reject) => {
        upload(req, res, async (err: any) => {
            try {
                if (err) {
                    throw new UploadError(
                        'Error uploading file: ' + err.message
                    );
                }

                if (!req.file) {
                    throw new UploadError('No file was sent');
                }

                resolve(path.join(destinationFolder, req.file?.filename));
            } catch (error) {
                const fileName = req.file?.filename ?? '';
                const filePath = path.join(destinationFolder, fileName);

                if (fs.existsSync(filePath) && fileName) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            throw new UploadError('Error deleting file');
                        }
                    });
                }

                next(reject(error));
            }
        });
    });
}

async function uploadMedia(
    prismaService: PrismaService,
    id: ID,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    const mediaPath = (await importUploadFile(
        req,
        res,
        next,
        getDataFolderPath('media')
    )) as string;

    if (!mediaPath || !fs.existsSync(mediaPath)) {
        return next(new UploadError('Error uploading file'));
    }

    const fileName = path.basename(mediaPath);
    id = parseInt(id as string);

    const mediaData = await prismaService.saveMedia(
        id,
        fileName,
        req.file?.originalname ?? ''
    );

    return mediaData;
}

export default dataHandler;
