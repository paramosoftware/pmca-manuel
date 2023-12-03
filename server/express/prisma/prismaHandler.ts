import express from 'express';
import decodeJwt from '~/utils/decodeJwt';
import getCookiePrefix from '~/utils/getCookiePrefix';
import { prisma } from '../../prisma/prisma';
import { createOneOrMany } from './create';
import { deleteOne, deleteOneOrManyWithQuery } from './delete';
import { getParamsFromPath } from './helpers';
import { uploadMedia } from './media';
import { readMany, readOne, readOneOrManyWithQuery } from './read';
import { updateMany, updateOne } from './update';
import { convertToFormatAndSend } from './dataFormatConverters';


const prismaHandler =  async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    /* Routes that need authentication:
    GET /api/:model - Get many
    GET /api/:model/:id - Get one

    PUT /api/:model - Update all
    PUT /api/:model/:id - Update one

    POST /api/:model - Create one or many
    POST /api/:model/query - Get one or many with query
    POST /api/:model/:id/query - Get one with query
    POST /api/:model/:id/upload - Upload media

    DELETE /api/:model/:id - Delete one
    DELETE /api/:model/query - Delete one or many with query
    */

    const { model, id, hasQuery, isPublic, isUpload } = getParamsFromPath(req.path);

    const method = isPublic ? 'GET' : req.method.toUpperCase();
    const body = req.body;
    const queryParams = req.query;
    const format = req.query.format ? req.query.format : body.format ? body.format : undefined;

    // @ts-ignore
    if (!model || prisma[model] === undefined) {
        return next();
    }

    const accessToken = req.cookies[getCookiePrefix() + 'jwt'];

    const decodedToken = decodeJwt(accessToken, process.env.ACCESS_TOKEN_SECRET!) as { userId: string; };

    if (!decodedToken) {
//        return next(new UnauthorizedError('Unauthorized'));
    }

    try {

        let response: any;

        switch (method) {
            case 'GET':
                if (id) {
                    response = readOne(model, id, queryParams, undefined, next);
                } else {
                    response = readMany(model, queryParams, next);
                }
                break;
            case 'PUT':
                if (id) {
                    response = updateOne(model, id, body, next, decodedToken.userId);
                } else {
                    response = updateMany(model, body, next);
                }
                break;
            case 'POST':
                if (id && hasQuery) {
                    response = readOne(model, id, queryParams, body, next);
                } else if (hasQuery) {
                    response = readOneOrManyWithQuery(model, body, next);
                } else if (isUpload) {
                     uploadMedia(model, id, body, req, res, next);
                } else {
                    response = createOneOrMany(model, body, next);
                }
                break;
            case 'DELETE':
                if (id) {
                    response = deleteOne(model, id, next);
                } else if (hasQuery) {
                    response = deleteOneOrManyWithQuery(model, body, next);
                }
                break;
            default:
                next();
        }

        if (response && response instanceof Promise) {
            response = await response;
        }

        if (response && format) {
            convertToFormatAndSend(response, format, res, next);
        } else if (response) {
            res.json(response);
        } else {
            next();
        }

    } catch (error) {
        next(error);
    }
}

export default prismaHandler;