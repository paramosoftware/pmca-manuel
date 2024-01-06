import express from 'express';
import { prisma } from '../../prisma/prisma';
import type { PaginatedQuery } from './interfaces';
import { createRequest, validatePaginatedQuery, convertPaginatedQueryToPrismaQuery } from './helpers';
import { Prisma } from '@prisma/client';
import capitalize from '~/utils/capitalize';
import parseNumber from '~/utils/parseNumber';
import normalizeString from '~/utils/normalizeString';

export async function readOne(model: string, id: string, body?: Partial<PaginatedQuery>, next: express.NextFunction | undefined = undefined) {

    try {

        const fieldsMap = new Map<string, Prisma.DMMF.Field>();
        const fields = Prisma.dmmf.datamodel.models.find(m => m.name === capitalize(model))?.fields.filter(f => {
            fieldsMap.set(f.name, f);
            if (f.isUnique || f.isId) {
                return f;
            }
        });

        if (body === undefined) {
            body = {};
        }
    
        const request = createRequest(body);
        
        request.pageSize = -1;

        validatePaginatedQuery(request);

        const query = convertPaginatedQueryToPrismaQuery(request, model);

        query.orderBy = undefined;
        query.where = { OR: [] };

        buildWhere(fields, query, fieldsMap);

        // @ts-ignore
        return await prisma[model].findFirst(query);

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
        
    }

    function buildWhere(fields: Prisma.DMMF.Field[] | undefined, query: any, fieldsMap: Map<string, Prisma.DMMF.Field>) {
        for (const field of fields ?? []) {
            const value = parseNumber(id);
            const valueType = typeof value;

            if (field.type === 'Int' && valueType === 'number') {
                query.where.OR.push({ [field.name]: value });
            }

            if (field.type === 'String' && valueType === 'string') {
                query.where.OR.push({ [field.name]: value });
            }

            if (fieldsMap.get(field.name + 'Slug') && valueType === 'string') {
                query.where.OR.push({ [field.name + 'Slug']: normalizeString(value, true) });
            }

            if (fieldsMap.get(field.name + 'Normalized') && valueType === 'string') {
                query.where.OR.push({ [field.name + 'Normalized']: normalizeString(value) });
            }
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