import express from 'express'
import { prisma } from '../../prisma/prisma';
import { readOne, readMany, readOneOrManyWithQuery } from './read';
import { deleteOne, deleteOneOrManyWithQuery } from './delete';
import { createOneOrMany } from './create';
import { updateOne, updateMany } from './update';
import { getParamsFromPath } from './helpers';

const prismaHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    /*
    GET /api/:model - Get many
    GET /api/:model/:id - Get one

    PUT /api/:model - Update all
    PUT /api/:model/:id - Update one

    POST /api/:model - Create one or many
    POST /api/:model/query - Get one or many with query
    POST /api/:model/:id - Get one with query

    DELETE /api/:model/:id - Delete one
    DELETE /api/:model/query - Delete one or many with query
    */

    const method = req.method.toUpperCase();
    const body = req.body;
    const queryParams = req.query;

    const { model, id, query } = getParamsFromPath(req.path);

    // @ts-ignore
    if (!model || prisma[model] === undefined) {
        return next();
    }


    switch (method) {
        case 'GET':
            if (id) {
                readOne(model, id, body, res, next);
            } else {
                readMany(model, queryParams, res, next);
            }
            break;
        case 'PUT':
            if (id) {
                const token = req.cookies.token
                updateOne(model, id, body, res, next, token);
            } else {
                updateMany(model, body, res, next);
            }
            break;
        case 'POST':
            if (id) {
                readOne(model, id, body, res, next);
            } else if (query) {
                readOneOrManyWithQuery(model, body, res, next);
            } else {
                createOneOrMany(model, body, res, next);
            }
            break;
        case 'DELETE':
            if (id) {
                deleteOne(model, id, res, next);
            } else if (query) {
                deleteOneOrManyWithQuery(model, body, res, next);
            }
            break;
        default:
            next();
    }
}

export default prismaHandler;