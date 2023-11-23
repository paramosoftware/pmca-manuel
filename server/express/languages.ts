import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma, normalizeString } from './utils';


const router = express.Router();

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

export default router;

