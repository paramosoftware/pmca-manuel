import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma } from './utils';

const router = express.Router();

router.put('/:id', async (req, res, next) => {
  const id = req.params.id;

  const data: any = prepareRequestBodyForPrisma(req.body, true);

  try {
    const category = await prisma.category.update({
      where: {
        id: parseInt(id),
      },
      data
    });

    res.json(category);

  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
 
  const data: any = prepareRequestBodyForPrisma(req.body, true);

  data.id = undefined;

  try {
    const category = await prisma.category.create({
      data
    });

    res.json(category);

  } catch (error) {
    next(error);
  }
});

export default router;