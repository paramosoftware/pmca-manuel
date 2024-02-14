import express from 'express';
import { prisma } from '../../prisma/prisma';
import { deleteEntryMedia } from './media';
import type { PaginatedQuery } from './interfaces';
import { createRequest, validatePaginatedQuery, convertPaginatedQueryToPrismaQuery } from './helpers';

export async function deleteOne(model: string, id: string, next: express.NextFunction | undefined = undefined) {

    try {

        await deleteOneOrManyWithQuery(model, { where: { id } }, next);

        return id;

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
    }
}

export async function deleteOneOrManyWithQuery(model: string, body: Partial<PaginatedQuery>, next: express.NextFunction | undefined = undefined) {

    const request = createRequest(body);
    request.orderBy = undefined;
    request.pageSize = -1;

    try {

        validatePaginatedQuery(request);

        const entryMedia: string | any[] = [];

        const query = convertPaginatedQueryToPrismaQuery(request, model);

        if (model.toLowerCase() === 'entry') {
            const entries = await prisma.entry.findMany(query);
            const ids = entries.map(entry => entry.id);

            let entryMediaTemp = await prisma.entryMedia.findMany({
                where: {
                    entryId: {
                        in: ids
                    }
                }
            });

            entryMediaTemp.forEach(entry => {
                entryMedia.push(entry);
            });
        }

        query.orderBy = undefined;

        // @ts-ignore
        const data = await prisma[model].deleteMany(query);

        if (entryMedia.length > 0) {
            deleteEntryMedia(entryMedia);
        }

        return data;

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
    }
}
