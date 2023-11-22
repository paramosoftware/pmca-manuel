import bcrypt from 'bcrypt';
import express from 'express';
import { prisma } from '../prisma/prisma';

const router = express.Router();

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { name, email, password, role } = req.body;

  try {

    let dataToSave = {};

    if (password)
    {
        const password_hash = bcrypt.hashSync(password, 10);
        dataToSave = {name, email, role, password: password_hash};
    }
    else
        dataToSave = {name, email, role};
    
    const user = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: dataToSave,
    });

    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {

    const password_hash = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password_hash,
        role
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