import express from 'express';
import  ServerError  from './errors/ServerError';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma } from './utils';
import fs from 'fs';
import path from 'path';



const router = express.Router();


router.put('/:id', async (req, res, next) => {

    const { id } = req.params;

    const data: any = prepareRequestBodyForPrisma(req.body, true);

    try {
        const media = await prisma.media.update({
            where: {
                id: parseInt(id)
            },
            data
        });
        res.json(media);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const media = await prisma.media.delete({
            where: {
                id: parseInt(id)
            }
        });

        res.json(media);

        const filePath = path.join('public', media.name);

        // TODO: What if file is not deleted?

        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    throw new ServerError('Error deleting file');
                }
            });
        }
    } catch (error) {
        next(error);
    }
});



export default router;