import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma } from './utils';

const router = express.Router();

router.post('/', async (req, res, next) => {
    
    const data: any = prepareRequestBodyForPrisma(req.body, true, false);

    try {

        data.id = undefined;

        const webPage = await prisma.webPage.create({
            data
        });

        res.json(webPage);

    } catch (error) {
        console.log(error);
        next(error);
    }

}
);

router.put('/:id', async (req, res, next) => {

    const { id } = req.params;

    const data: any = prepareRequestBodyForPrisma(req.body, false, true);

    try {
        const webPage = await prisma.webPage.update({
            where: {
                id: parseInt(id)
            },
            data
        });
        res.json(webPage);
    } catch (error) {
        next(error);
    }
});

export default router;
