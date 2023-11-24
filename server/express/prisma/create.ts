import express from 'express';
import { prisma } from '../../prisma/prisma';
import { convertBodyToPrismaUpdateOrCreateQuery } from './helpers';

export async function createOneOrMany(model: string, body: any, res: express.Response, next: express.NextFunction) {

    try {

        if (!Array.isArray(body)) {
            body = [body];
        }

        const inserts: any[] = [];

        for (const item of body) {
            const query = convertBodyToPrismaUpdateOrCreateQuery(model, item);
            // @ts-ignore
            inserts.push(prisma[model].create({ data: query }));
        }

        // TODO: Should this be always a transaction?
        // createMany is not supported for SQLite
        const data = await prisma.$transaction(inserts);

        if (data.length === 1) {
            res.json(data[0]);
        } else {
            res.json(data);
        }

    } catch (error) {
        next(error);
    }
}
