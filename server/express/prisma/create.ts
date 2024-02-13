import { prisma } from '../../prisma/prisma';
import { processRequestBody } from './helpers';
import type express from 'express';

export async function createOneOrMany(model: string, body: any, next: express.NextFunction | undefined = undefined) {

    try {

        if (!Array.isArray(body)) {
            body = [body];
        }

        const inserts: any[] = [];

        for (const item of body) {
            const query = await processRequestBody(model, item);
            // @ts-ignore
            inserts.push(prisma[model].create({ data: query }));
        }

        // TODO: Should this be always a transaction?
        // createMany is not supported for SQLite
        const data = await prisma.$transaction(inserts);

        if (data.length === 1) {
            return data[0];
        } else {
            return data;
        }

    } catch (error) {
        if (next) {
            next(error);
        } else {
            throw error;
        }
    }

}
