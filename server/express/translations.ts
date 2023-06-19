import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma } from './utils';


const router = express.Router();

router.get('/autocomplete', async (req, res, next) => {
    const { q } = req.query;

    if (!q) {
        return res.json([]);
    }

    try {
        const translations = await prisma.translation.findMany({
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
        
        res.json(translations);

    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const translations = await prisma.translation.findMany({
            include: {
                language: true,
                entry: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(translations);

    } catch (error) {
        next(error);
    }

});

router.post('/', async (req, res, next) => {
    
    const data: any = prepareRequestBodyForPrisma(req.body, true);

    try {

        data.id = undefined;

        const translation = await prisma.translation.create({
            data
        });

        res.json(translation);

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
        const translation = await prisma.translation.update({
            where: {
                id: parseInt(id)
            },
            data
        });
        res.json(translation);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const translation = await prisma.translation.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.json(translation);
    } catch (error) {
        next(error);
    }
});



export default router;






