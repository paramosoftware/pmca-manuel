import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma } from './utils';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const webPages = await prisma.webPage.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        res.json(webPages);

    } catch (error) {
        next(error);
    }

});

router.get('/by-slug/:slug', async (req, res, next) => {
    const { slug } = req.params;

    try {
        const webPage = await prisma.webPage.findUnique({
            where: {
                slug
            }
        });
        res.json(webPage);

    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const webPage = await prisma.webPage.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        res.json(webPage);

    } catch (error) {
        next(error);
    }
});

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

router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const webPage = await prisma.webPage.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.json(webPage);
    } catch (error) {
        next(error);
    }
});

export default router;
