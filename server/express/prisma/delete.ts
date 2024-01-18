import express from 'express';
import { prisma } from '../../prisma/prisma';
import { deleteMedia } from './media';
import type { PaginatedQuery } from './interfaces';
import { createRequest, validatePaginatedQuery, convertPaginatedQueryToPrismaQuery } from './helpers';

export async function deleteOne(model: string, id: string, next: express.NextFunction | undefined = undefined) {


    let entryMedia: string | any[] = [];

    try {

        // TODO: Temporary solution for deleting media
        if (model === 'Entry') {
            entryMedia = await prisma.entryMedia.findMany({
                where: {
                    entryId: parseInt(id)
                },
                include: {
                    media: true
                }
            });
        }

        // @ts-ignore
        const data = await prisma[model].delete({
            where: {
                id: isNaN(Number(id)) ? id : Number(id)
            }
        });

        if (entryMedia.length > 0) {
            deleteMedia(entryMedia);
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

export async function deleteOneOrManyWithQuery(model: string, body: Partial<PaginatedQuery>, next: express.NextFunction | undefined = undefined) {

    const request = createRequest(body);
    request.orderBy = undefined;
    request.pageSize = -1;

    try {

        validatePaginatedQuery(request);

        const entryMedia: string | any[] = [];

        const query = convertPaginatedQueryToPrismaQuery(request, model);

        // TODO: Temporary solution for deleting media
        if (model === 'Entry') {
            const entries = await prisma.entry.findMany(query);
            const ids = entries.map(entry => entry.id);

            let entryMediaTemp = await prisma.entryMedia.findMany({
                where: {
                    entryId: {
                        in: ids
                    }
                },
                include: {
                    media: true
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
            deleteMedia(entryMedia);
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
