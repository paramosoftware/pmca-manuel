import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma, normalizeString } from './utils';


const router = express.Router();

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

export default router;






