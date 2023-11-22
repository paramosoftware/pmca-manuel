import express from 'express';
import { prisma } from '../prisma/prisma';
import { prepareRequestBodyForPrisma, normalizeString, getUserFromToken, deleteMedia } from './utils';

const router = express.Router();

router.delete('/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const entryMedia = await prisma.entryMedia.findMany({
            where: {
                entryId: parseInt(id)
            },
            include: {
                media: true
            }
        });


        const deletedEntry = await prisma.$transaction([

            prisma.entryChanges.deleteMany({
                where: {
                    entryId: parseInt(id)
                }
            }),

            prisma.entryMedia.deleteMany({
                where: {
                    entryId: parseInt(id)
                }
            }),

            prisma.entry.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    relatedEntries: {set: []},
                    variations: {deleteMany: {}},
                    translations: {deleteMany: {}},
                }
            }),

            prisma.entry.delete({
                where: {
                    id: parseInt(id)
                }
            })             
        ])


        if (entryMedia.length > 0) {
            deleteMedia(entryMedia);
        }


        res.json(deletedEntry);

    } catch (error) {
      next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const token = req.cookies.token;

    const user = await getUserFromToken(token);

    try {

        const variations = req.body.variations || [];
        const translations = req.body.translations || [];
        const media = req.body.media || [];

        let data: any = prepareRequestBodyForPrisma(req.body);

        data.media = undefined;

        if (data.category || data.category === null) {
            data.category = undefined;
        }

        data.variations = { 
            deleteMany: {},
            connectOrCreate: variations.map((variation: Variation) => {
                return {
                    where: {
                        id: parseInt(variation.id)
                    },
                    create: {
                        name: variation.name,
                    }
                }
            }
        )};


        data.translations = {
            deleteMany: {},
            connectOrCreate: translations.map((translation: Translation) => {
                return {
                    where: {
                        id: translation.id
                    },
                    create: {
                        name: translation.name,
                        language: {
                            connect: {
                                id: parseInt(translation.languageId)
                            }
                        }
                    }
                }
            })
        };

        trackChanges(req.body, user);

        handleMedia(media, id);

        const savedEntry = await prisma.entry.update({
            where: {
                id: parseInt(id)
            },
            data
        });

        res.json(savedEntry);

    } catch (error) {
        next(error);
    } 
});

router.post('/', async (req, res, next) => {


    try {

        let data:any = prepareRequestBodyForPrisma(req.body, true);
        const variations = req.body.variations || [];
        const translations = req.body.translations || [];

        data.id = undefined;
       
        if (data.category || data.category === null) {
            data.category = undefined;
        }

        data.variations = { 
            connectOrCreate: variations.map((variation: Variation) => {
                return {
                    where: {
                        id: parseInt(variation.id)
                    },
                    create: {
                        name: variation.name,
                    }
                }
            }
        )};


        data.translations = {
            connectOrCreate: translations.map((translation: Translation) => {
                return {
                    where: {
                        id: translation.id
                    },
                    create: {
                        name: translation.name,
                        language: {
                            connect: {
                                id: parseInt(translation.languageId)
                            }
                        }
                    }
                }
            })
        };

        const savedEntry = await prisma.entry.create({
            data
        });

        res.json(savedEntry);

    } catch (error) {
      next(error);
    }

});


async function trackChanges(newData: any, user: any) {

    const changes: any = {};

    const fieldsToTrack = [
        'name',
        'definition',
        'notes',
        'category',
        'relatedEntries',
        'entries',
        'variations',
        'translations',
        'references'
    ];


    const oldData = await prisma.entry.findUnique({
        where: {
            id: parseInt(newData.id)
        },
        include: {
            category: true,
            media: true,
            relatedEntries: true,
            entries: true,
            variations: true,
            translations: true,
            references: true
        }
    });


    fieldsToTrack.forEach((field: any) => {

        if (typeof newData[field] === 'string') {
            if (newData[field] !== oldData[field]) {
                changes[field] = {
                    old: oldData[field],
                    new: newData[field]
                }
            }
        }

        if (typeof newData[field] === 'object') {
            if (Array.isArray(newData[field])) {

                const newNames = newData[field].map((item: any) => item.name);
                const oldNames = oldData[field].map((item: any) => item.name);


                const added = newNames.filter((name: any) => !oldNames.includes(name));
                const removed = oldNames.filter((name: any) => !newNames.includes(name));


                if (added.length > 0) {
                    changes[field] = {
                        added
                    }
                }

                if (removed.length > 0) {
                    changes[field] = {
                        removed
                    }
                }

            } else if (newData[field].name) {
                if (newData[field].name !== oldData[field].name) {
                    changes[field] = {
                        added: [newData[field].name],
                        removed: [oldData[field].name]
                    }
                }
            }
        }
    })

    if (Object.keys(changes).length === 0) {
        return;
    }

    await prisma.entryChanges.create({
        data: {
            entry: {
                connect: {
                    id: parseInt(newData.id)
                }
            },
            changes: JSON.stringify(changes),
            user: {
                connect: {
                    id: parseInt(user.id)
                }
            }
        }
    })
}


async function handleMedia(media: any[], entryId: string) {

    const oldMedia = await prisma.entryMedia.findMany({
        where: {
            entryId: parseInt(entryId)
        },
        include: {
            media: true
        }
    });

    const mediaToDelete = oldMedia.filter((oldMediaItem: any) => {
        return !media.find((newMediaItem: EntryMedia) => {
            return newMediaItem.id === oldMediaItem.id;
        })
    });

    deleteMedia(mediaToDelete);

    media.map(async (item: any) => {
        // Workaround for Prisma bug: Timed out during query execution
        await prisma.$executeRaw`UPDATE entries_media SET position = ${item.position} WHERE id = ${item.id}`;
    });
}


export default router;
