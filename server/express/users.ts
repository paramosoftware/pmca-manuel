import bcrypt from 'bcrypt';
import express from 'express';
import { prisma } from '../prisma/prisma';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        email: true
      },
      where: {
        id: parseInt(id),
      },
    });
    
    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { name, email, password } = req.body;

  try {
    const password_hash = bcrypt.hashSync(password, 10);

    const user = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        email,
        password: password_hash
      },
    });
    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    res.json(users);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  try {

    const password_hash = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password_hash
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const user = await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;