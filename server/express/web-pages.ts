import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma } from './utils';
import { useNormalizeString } from '../../composables/useNormalizeString';

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

router.get('/by-code/:code', async (req, res, next) => {
    const { code } = req.params;

    try {
        const webPage = await prisma.webPage.findUnique({
            where: {
                code
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

    const { normalizeString } = useNormalizeString();
    
    const data: any = prepareRequestBodyForPrisma(req.body, true);

    try {

        data.id = undefined;
        
        if (data.name) {
            data.code = normalizeString(data.name);
        }

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

    const { normalizeString } = useNormalizeString();

    const { id } = req.params;

    const data: any = prepareRequestBodyForPrisma(req.body, true);

    try {

        if (data.name) {
            data.code = normalizeString(data.name);
        }


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
