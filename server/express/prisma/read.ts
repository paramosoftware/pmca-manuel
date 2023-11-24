import express from 'express';
import { prisma } from '../../prisma/prisma';
import type { ParsedQs } from 'qs';
import type { PaginatedQuery, Query } from './interfaces';
import { createRequest, validatePaginatedQuery, convertPaginatedQueryToPrismaQuery, convertQueryParamsToPaginatedQuery } from './helpers';

export async function readOne(model: string, id: string, body: Partial<PaginatedQuery>, res: express.Response, next: express.NextFunction) {

    const request = createRequest(body);
    request.orderBy = undefined;
    request.pageSize = -1;

    try {
        validatePaginatedQuery(request);

        const query = convertPaginatedQueryToPrismaQuery(request);

        query.where = { id: Number(id) };

        // @ts-ignore
        const data = await prisma[model].findUnique(query);

        res.json(data);

    } catch (error) {
        return next(error);
    }
}

export async function readMany(model: string, queryParams: ParsedQs, res: express.Response, next: express.NextFunction) {

    const body = convertQueryParamsToPaginatedQuery(queryParams);
    const request = createRequest(body);

    try {
        validatePaginatedQuery(request);
    } catch (error) {
        return next(error);
    }

    const query = convertPaginatedQueryToPrismaQuery(request);

    await executePaginatedPrismaFindQuery(model, query, res, next);
}

export async function readOneOrManyWithQuery(model: string, body: Partial<PaginatedQuery>, res: express.Response, next: express.NextFunction) {

    const request = createRequest(body);

    try {
        validatePaginatedQuery(request);
    } catch (error) {
        return next(error);
    }

    const query = convertPaginatedQueryToPrismaQuery(request);

    await executePaginatedPrismaFindQuery(model, query, res, next);
}

async function executePaginatedPrismaFindQuery(model: string, query: Query, res: express.Response, next: express.NextFunction) {

    try {
        const [total, data] = await prisma.$transaction([
            // @ts-ignore
            prisma[model].count({ where: query.where }),
            // @ts-ignore
            prisma[model].findMany(query)
        ]);

        res.json({ total, data });

    } catch (error) {
        next(error);
    }
}
