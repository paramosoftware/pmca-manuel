import express from 'express';
import { prisma } from '../../prisma/prisma';
import { deleteMedia } from '../utils';
import type { PaginatedQuery } from './interfaces';
import { createRequest, validatePaginatedQuery, convertPaginatedQueryToPrismaQuery } from './helpers';

export async function deleteOne(model: string, id: string, res: express.Response, next: express.NextFunction) {


    let entryMedia: string | any[] = [];

    try {

        // TODO: Temporary solution for deleting media
        if (model === 'entry') {
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
                id: Number(id)
            }
        });

        res.json(data);


        if (entryMedia.length > 0) {
            deleteMedia(entryMedia);
        }

    } catch (error) {
        next(error);
    }
}
export async function deleteOneOrManyWithQuery(model: string, body: Partial<PaginatedQuery>, res: express.Response, next: express.NextFunction) {

    const request = createRequest(body);
    request.orderBy = undefined;
    request.pageSize = -1;

    try {
        validatePaginatedQuery(request);
    } catch (error) {
        return next(error);
    }

    const entryMedia: string | any[] = [];

    const query = convertPaginatedQueryToPrismaQuery(request);

    try {

        // TODO: Temporary solution for deleting media
        if (model === 'entry') {
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

        // @ts-ignore
        const data = await prisma[model].deleteMany(query);

        if (entryMedia.length > 0) {
            deleteMedia(entryMedia);
        }

        res.json(data);

    } catch (error) {
        next(error);
    }
}
