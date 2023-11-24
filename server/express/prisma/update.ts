import express from 'express';
import { prisma } from '../../prisma/prisma';
import { ApiValidationError } from '../error';
import { handleMedia, trackChanges } from '../utils';
import { convertBodyToPrismaUpdateOrCreateQuery, convertWhereToPrismaQuery, validateWhere } from './helpers';

export async function updateOne(model: string, id: string, body: any, res: express.Response, next: express.NextFunction, token: string) {

    try {

        // TODO: Temporary solution for media
        let media = [];

        if (model === 'entry' && body.media) {
            media = body.media;
            body.media = undefined;
        }

        const query = convertBodyToPrismaUpdateOrCreateQuery(model, body, true);

        query.id = undefined;

        // @ts-ignore
        const data = await prisma[model].update({
            where: {
                id: Number(id)
            },
            data: query
        });


        if (model === 'entry') {
            trackChanges(body, token);
            handleMedia(media, id);
        }

        res.json(data);

    } catch (error) {
        next(error);
    }
}
export async function updateMany(model: string, body: any, res: express.Response, next: express.NextFunction) {
    try {

        if (!Array.isArray(body)) {
            body = [body];
        }

        const updates: any[] = [];

        for (const item of body) {

            if (item.where === undefined) {
                throw new ApiValidationError('Update must have a where clause');
            }

            if (item.data === undefined) {
                throw new ApiValidationError('Update must have a data clause');
            }

            const query = convertBodyToPrismaUpdateOrCreateQuery(model, item.data, true);

            // TODO: Temporary solution for media
            let media: any[] = [];
            if (model === 'entry' && item.data.media) {
                media = item.data.media;
            }

            validateWhere(item.where);
            const where = convertWhereToPrismaQuery(item.where);

            // TODO: Is there a performance issue? 
            // Pros: 1. Allow nested updates 2. Allow complex where clauses
            // Cons: 1. Multiple queries
            // Create a flag to control if this should be a transaction
            // @ts-ignore
            const ids = await prisma[model].findMany({
                where,
                select: {
                    id: true
                }
            });

            ids.forEach((id: { id: number; }) => {
                // @ts-ignore
                updates.push(prisma[model].update({
                    where: {
                        id: parseInt(id.id)
                    },
                    data: query
                }));

                if (model === 'entry') {
                    handleMedia(media, id.id);
                }
            });
        }

        const data = await prisma.$transaction(updates);

        if (data.length === 1) {
            res.json(data[0]);
        } else {
            res.json(data);
        }

    } catch (error) {
        next(error);
    }
}
