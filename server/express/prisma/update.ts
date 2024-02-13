import express from 'express';
import { prisma } from '../../prisma/prisma';
import { ApiValidationError } from '../error';
import { processRequestBody, convertWhereToPrismaQuery, validateWhere } from './helpers';
import { handleMedia } from './media';

export async function updateOne(model: string, id: string | number, body: any, next: express.NextFunction | undefined = undefined, userId: string = '') {

    try {

        // TODO: Temporary solution for media
        let media = [];

        if (model === 'entry' && body.media) {
            media = body.media;
            body.media = undefined;
        }

        const query = await processRequestBody(model, body, true);

        query.id = undefined;

        // @ts-ignore
        const data = await prisma[model].update({
            where: {
                id: isNaN(Number(id)) ? id : Number(id)
            },
            data: query
        });


        if (model === 'entry') {
            trackChanges(body, userId);
            handleMedia(media, id);
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


export async function updateMany(model: string, body: any, next: express.NextFunction | undefined = undefined) {
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

            const query = await processRequestBody(model, item.data, true);

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

            ids.forEach((id: { id: number | string }) => {
                // @ts-ignore
                updates.push(prisma[model].update({
                    where: {
                        id: id.id
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
            return data[0]
        } else {
            return data
        }

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
    }
}


export async function trackChanges(newData: any, userId: string) {

    const changes: any = {};

    const fieldsToTrack = [
        'name',
        'definition',
        'notes',
        'parent',
        'relatedEntries',
        'entries',
        'variations',
        'translations',
        'references'
    ];


    const oldData = await prisma.entry.findUnique({
        where: {
            id: parseInt(newData.id)
        },
        include: {
            parent: true,
            media: true,
            relatedEntries: true,
            entries: true,
            variations: true,
            translations: true,
            references: true
        }
    });


    fieldsToTrack.forEach((field: any) => {

        if (typeof newData[field] === 'string' || newData[field] === null) {
            if (newData[field] !== oldData[field]) {
                changes[field] = {
                    old: oldData[field],
                    new: newData[field]
                }
            }
        }

        if (typeof newData[field] === 'object' && newData[field] !== null) {
            if (Array.isArray(newData[field])) {

                const newNames = newData[field].map((item: any) => item.name);
                const oldNames = oldData[field].map((item: any) => item.name);


                const added = newNames.filter((name: any) => !oldNames.includes(name));
                const removed = oldNames.filter((name: any) => !newNames.includes(name));


                if (added.length > 0) {
                    changes[field] = {
                        added
                    }
                }

                if (removed.length > 0) {
                    changes[field] = {
                        removed
                    }
                }

            } else if (newData[field].name !== undefined) {
                if (newData[field].name !== oldData[field].name) {
                    changes[field] = {
                        added: [newData[field].name],
                        removed: [oldData[field].name]
                    }
                }
            }
        }
    })

    if (Object.keys(changes).length === 0) {
        return;
    }

    await prisma.entryChanges.create({
        data: {
            entry: {
                connect: {
                    id: parseInt(newData.id)
                }
            },
            changes: JSON.stringify(changes),
            user: {
                connect: {
                    id: userId
                }
            }
        }
    })
}