import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma } from './utils';
import { useNormalizeString } from '../../composables/useNormalizeString';

const router = express.Router();

router.get('/autocomplete', async (req, res, next) => {
    const { q } = req.query;

    if (!q) {
        return res.json([]);
    }

    try {
        const entries = await prisma.entry.findMany({
            where: {
                name: {
                    contains: q as string
                }
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.json(entries);

    } catch (error) {
      next(error);
    }
});

router.post('/search', async (req, res, next) => {

    const { query } = req.body;

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
                notes: {
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

    try {
        const entries = await prisma.entry.findMany({
            where: whereConditions,
            include: {
                category: true,
                translations: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.json(entries);

    } catch (error) {
        next(error);
     }
});

router.post('/by-code', async (req, res, next) => {

    const { code } = req.body;

    try {
        const entry = await prisma.entry.findUnique({
            where: {
                code: code
            },
            include: {
                category: true,
                media: true
            }
        });
        res.json(entry);

    } catch (error) {
      next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const deleteEntry = await prisma.entry.delete({
            where: {
                id: parseInt(id)
            }
        });

        res.json(deleteEntry);

    } catch (error) {
      next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const entry = await prisma.entry.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                category: true,
                translations: true,
                relatedEntries: true,
                entries: true,
                references: true,
                media: true
            }
        });
        res.json(entry);

    } catch (error) {
      next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { normalizeString } = useNormalizeString();

    try {

        let data:any = prepareRequestBodyForPrisma(req.body);

        if (data.name) {
            data.code = normalizeString(data.name);
        }

        if (data.category || data.category === null) {
            data.category = undefined;
        }

        const savedEntry = await prisma.entry.update({
            where: {
                id: parseInt(id)
            },
            data
        });

        res.json(savedEntry);

    } catch (error) {
        next(error);
    } 
});


router.get('/', async (req, res, next) => {

    try {
        const entries = await prisma.entry.findMany({
            include: {
                category: true,
                translations: true,
                relatedEntries: true,
                entries: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(entries);

    } catch (error) {
        next(error);
    }

});

router.post('/', async (req, res, next) => {

    const { normalizeString } = useNormalizeString();

    try {

        let data:any = prepareRequestBodyForPrisma(req.body, true);

        data.id = undefined;
       
        if (data.name) {
            data.code = normalizeString(data.name);
        }

        if (data.category) {
            data.category = undefined;
        }

        const savedEntry = await prisma.entry.create({
            data
        });

        res.json(savedEntry);

    } catch (error) {
      next(error);
    }

});

export default router;
