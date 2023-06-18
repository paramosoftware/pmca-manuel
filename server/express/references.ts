import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma } from './utils';


const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const references = await prisma.reference.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        res.json(references);

    } catch (error) {
        next(error);
    }

});

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const reference = await prisma.reference.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        res.json(reference);

    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    
    const data: any = prepareRequestBodyForPrisma(req.body, true);

    try {

        data.id = undefined;

        const reference = await prisma.reference.create({
            data
        });

        res.json(reference);

    } catch (error) {
        console.log(error);
        next(error);
    }

}
);

router.put('/:id', async (req, res, next) => {

    const { id } = req.params;

    const data: any = prepareRequestBodyForPrisma(req.body, true);

    try {
        const reference = await prisma.reference.update({
            where: {
                id: parseInt(id)
            },
            data
        });
        res.json(reference);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const reference = await prisma.reference.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.json(reference);
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
        const references = await prisma.reference.findMany({
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
        
        res.json(references);

    } catch (error) {
        next(error);
    }
});


export default router;
