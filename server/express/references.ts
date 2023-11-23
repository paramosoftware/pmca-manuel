import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma, normalizeString } from './utils';


const router = express.Router();


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
export default router;
