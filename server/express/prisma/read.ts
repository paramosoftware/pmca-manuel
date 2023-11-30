import express from 'express';
import { prisma } from '../../prisma/prisma';
import type { ParsedQs } from 'qs';
import type { PaginatedQuery, Query } from './interfaces';
import { createRequest, validatePaginatedQuery, convertPaginatedQueryToPrismaQuery, convertQueryParamsToPaginatedQuery } from './helpers';

export async function readOne(model: string, id: string, queryParams: ParsedQs, body: any | undefined, next: express.NextFunction | undefined = undefined) {

    try {

        if (body === undefined) {
            body = convertQueryParamsToPaginatedQuery(queryParams);
        }
    
        const request = createRequest(body);
        
        request.pageSize = -1;

        validatePaginatedQuery(request);

        const query = convertPaginatedQueryToPrismaQuery(request, model);

        query.orderBy = undefined;

        query.where = { id: isNaN(Number(id)) ? id : Number(id) };

        // @ts-ignore
        const data = await prisma[model].findUnique(query);

        return data;

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
        
    }
}

export async function readMany(model: string, queryParams: ParsedQs, next: express.NextFunction | undefined = undefined) {

    try {
        const body = convertQueryParamsToPaginatedQuery(queryParams);
        const request = createRequest(body);

        validatePaginatedQuery(request);

        const query = convertPaginatedQueryToPrismaQuery(request, model);
    
        return await executePaginatedPrismaFindQuery(model, query);

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
    }

}

export async function readOneOrManyWithQuery(model: string, body: Partial<PaginatedQuery>, next: express.NextFunction | undefined = undefined) {

    try {

        const request = createRequest(body);

        validatePaginatedQuery(request);

        const query = convertPaginatedQueryToPrismaQuery(request, model);
    
        return await executePaginatedPrismaFindQuery(model, query);

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
    }

}

async function executePaginatedPrismaFindQuery(model: string, query: Query) {

    try {
        const [total, data] = await prisma.$transaction([
            // @ts-ignore
            prisma[model].count({ where: query.where }),
            // @ts-ignore
            prisma[model].findMany(query)
        ]);

    
        if (query.take === undefined || !query.skip === undefined) {
            return {
                currentPage: 1,
                pageSize: total,
                totalPages: 1,
                totalCount: total,
                data
            };
        } else {
            return {
                currentPage: query.skip ? query.skip / query.take + 1 : 1,
                pageSize: query.take,
                totalPages: Math.ceil(total / query.take),
                totalCount: total,
                data
            };
        }

    } catch (error) {
        throw error;
    }
}
