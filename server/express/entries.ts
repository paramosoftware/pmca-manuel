import express from 'express';
import  { prisma }  from '../prisma/prisma';
import { useNormalizeString } from '../../composables/useNormalizeString'

const router = express.Router();

router.post('/search', async (req, res) => {

    const { query } = req.body;

    const search = query.termo ?? undefined;
    const category = query.categoria ?? undefined;

    const whereConditions = {};

    if (search) {
        // @ts-ignore
        whereConditions.OR = [
            {
                name: {
                    contains: search
                }
            },
            {
                definition: {
                    contains: search
                }
            },
            {
                notes: {
                    contains: search
                }
            },
            {
                references: {
                    contains: search
                }
            }
        ];
    }

    if (category) {
        // @ts-ignore
        whereConditions.AND = [
            {
                categoryId: parseInt(category)
            }
        ];
    }

    try {
        const entries = await prisma.entry.findMany({
            where: whereConditions,
            include: {
                category: true,
                translations: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.json(entries);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/by-code', async (req, res) => {

    const { code } = req.body;

    try {
        const entry = await prisma.entry.findUnique({
            where: {
                code: code
            },
            include: {
                category: true
            }
        });
        res.json(entry);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deleteEntry = await prisma.entry.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.json(deleteEntry);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const entry = await prisma.entry.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                category: true,
                translations: true,
                relatedEntries: true,
                entries: true
            }
        });
        res.json(entry);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {

    const { id, name, definition, notes, references, categoryId } = req.body;
    const { normalizeString } = useNormalizeString();

    try {
        const savedEntry = await prisma.entry.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name,
                code: normalizeString(name),
                definition: definition === "" ? null : definition,
                notes: notes === "" ? null : notes,
                references: references === "" ? null : references,
                categoryId:
                    categoryId == 0 ? null : parseInt(categoryId)
            }
        });

        res.json(savedEntry);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }

});

router.get('/', async (req, res) => {

    try {
        const entries = await prisma.entry.findMany({
            include: {
                category: true,
                translations: true,
                relatedEntries: true,
                entries: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(entries);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }

});

router.post('/', async (req, res) => {

    const { name, definition, notes, references, categoryId } = req.body;

    const { normalizeString } = useNormalizeString();

    try {
        const savedEntry = await prisma.entry.create({
            data: {
                name,
                code: normalizeString(name),
                definition: (definition === "") ? null : definition,
                notes: (notes === "") ? null : notes,
                references: (references === "") ? null : references,
                categoryId: (categoryId === 0) ? null : parseInt(categoryId)
            }
        });

        res.json(savedEntry);

    } catch (error : any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }

});

export default router;
