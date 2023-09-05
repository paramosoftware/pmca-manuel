import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma, normalizeString } from './utils';


const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const languages = await prisma.language.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        res.json(languages);
    } catch (error) {
        next(error);
    }
});

router.get('/autocomplete', async (req, res, next) => {
    const { q } = req.query;

    if (!q) {
        return res.json([]);
    }

    try {
        const languages = await prisma.language.findMany({
            where: {
                nameNormalized: {
                    contains: normalizeString(q.toString())
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

        res.json(languages);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {

    const { id } = req.params;

    try {
        const language = await prisma.language.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        
        res.json(language);

    } catch (error) {
        next(error);
    }
});


router.post('/', async (req, res, next) => {
    
    const data: any = prepareRequestBodyForPrisma(req.body);

    try {
        const language = await prisma.language.create({
            data
        });

        res.json(language);

    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {

    const { id } = req.params;
    
    const data: any = prepareRequestBodyForPrisma(req.body);

    try {
        const language = await prisma.language.update({
            where: {
                id: parseInt(id)
            },
            data
        });
        res.json(language);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const language = await prisma.language.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.json(language);
    } catch (error) {
        next(error);
    }
});


export default router;

