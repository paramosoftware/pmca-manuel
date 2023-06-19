import express from 'express';
import { prisma } from '../prisma/prisma';

const router = express.Router();

router.get('/:id', async (req, res, next) => {
  const id = req.params.id;

  try {
    const category = await prisma.category.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  const id = req.params.id;
  const { name, description, parentId } = req.body;

  try {
    const category = await prisma.category.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        description: description === '' ? null : description,
        parentId: parentId == 0 ? null : parseInt(parentId),
      },
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        entries: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { name, description, parentId } = req.body;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        description: description ? description : undefined,
        parentId: parentId ? parseInt(parentId) : undefined,
      },
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
});


router.delete('/:id', async (req, res, next) => {
  const id = req.params.id;

  try {
    const category = await prisma.category.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
});

export default router;