import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/prisma';
import fs from 'fs';
import useMedia from '../../../composables/useMedia';
import sanitizeHtml from 'sanitize-html'

function normalizeString(str: string, slug: boolean = false) {
    if (str === null || typeof str !== 'string') {
        return str;
    }

    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    str = sanitizeHtml(str, {
        allowedTags: [],
        allowedAttributes: {}
    });

    if (slug) {
        str = str.replace(/\s/g, '-');
    }

    return str;
}

async function getUserFromToken(token: string) {
    const decodedToken: any = jwt.decode(token);

    if (!decodedToken) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: {
            email: decodedToken.email
        },
    });

    return user;
}

async function deleteMedia(entryMedia: Array<EntryMedia>) {

    const mediaIds: number[] = [];
    const relationsIds: number[] = [];

    entryMedia.forEach((media: EntryMedia) => {

        if (!media.media) {
            return;
        }

        const mediaPath = useMedia().mediaPath + '/' + media.media.name;
        
        if (fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }

        mediaIds.push(media.mediaId);
        relationsIds.push(media.id);
    });

    const transaction = await prisma.$transaction([
        prisma.media.deleteMany({
            where: {
                id: {
                    in: mediaIds
                }
            }
        })
    ]);

    return transaction;

}

async function trackChanges(newData: any, token: any) {

    const user = await getUserFromToken(token);
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

async function handleMedia(media: any[], entryId: string | number) {

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
    
export { normalizeString, getUserFromToken, deleteMedia, sanitizeHtml, trackChanges, handleMedia };