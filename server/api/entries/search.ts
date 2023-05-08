import { parse } from 'path';
import { prisma } from '../../prisma';

export default defineEventHandler(async (event) => {

    const { query } = await readBody(event);

    const search = query.termo ?? undefined;
    const category = query.categoria ?? undefined;

    const whereConditions = {};

    if (search) {
        // @ts-ignore
        whereConditions.OR = [
            {
                name: {
                    contains: search
                }
            },
            {
                definition: {
                    contains: search
                }
            },
            {
                notes:
                {
                    contains: search
                }
            },
            {
                references: {
                    contains: search
                }
            }
        ];
    }

    if (category) {
        // @ts-ignore
        whereConditions.AND = [
            {
                categoryId: parseInt(category)
            }
        ];
    }

    const entries = await prisma.entry.findMany({
        where: whereConditions,
        include: {
            category: true,
            translations: true
        },
        orderBy: {
            name: 'asc'
        }
    }).catch((error) => {
        console.error(error);
    });

    return entries;
});
