import express from 'express';
import { prisma } from '../../prisma/prisma';
import type { PaginatedQuery } from './interfaces';
import { createRequest, validatePaginatedQuery, convertPaginatedQueryToPrismaQuery } from './helpers';

export async function readOne(model: string, id: string, body?: Partial<PaginatedQuery>, next: express.NextFunction | undefined = undefined) {

    try {

        if (body === undefined) {
            body = {};
        }
    
        const request = createRequest(body);
        
        request.pageSize = -1;

        validatePaginatedQuery(request);

        const query = convertPaginatedQueryToPrismaQuery(request, model);

        query.orderBy = undefined;
        query.where = { id: isNaN(Number(id)) ? id : Number(id) };

        // @ts-ignore
        return await prisma[model].findUnique(query);

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
        
    }
}


export async function readMany(model: string, body?: Partial<PaginatedQuery>, next: express.NextFunction | undefined = undefined) {

    try {

        if (body === undefined) {
            body = {};
        }

        const request = createRequest(body);

        validatePaginatedQuery(request);

        const query = convertPaginatedQueryToPrismaQuery(request, model);
    
        const [total, data] = await prisma.$transaction([
            // @ts-ignore
            prisma[model].count({ where: query.where }),
            // @ts-ignore
            prisma[model].findMany(query)
        ]);



        return {
            page: query.skip && query.take ? query.skip / query.take + 1 : 1,
            pageSize: query.take || total,
            totalPages: query.take ? Math.ceil(total / query.take) : 1,
            total: total,
            items: data
        } as PaginatedResponse;

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
    }

}