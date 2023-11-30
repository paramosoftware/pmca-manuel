import type express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import useMedia from '../../../composables/useMedia';
import { prisma } from '../../prisma/prisma';
import { UploadError } from '../error';


export async function uploadMedia(model: string, id: string, body: any, req: express.Request, res: express.Response, next: express.NextFunction) {

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, useMedia().mediaPath + '/')
        },
        filename: function (req, file, cb) {
            cb(null, uuidv4() + path.extname(file.originalname))
        }
    })

    const upload = multer({
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 5 },
    }).single('file')


    upload(req, res, async (err: any) => {
        try {

            if (err) {
                throw new UploadError('Error uploading file');
            }

            if (!req.file) {
                throw new UploadError('No file was sent');
            }

            const data = await saveMedia(id, req.file?.filename, req.file?.originalname);

            res.json(data);

        } catch (error) {

            const filePath = path.join('public', req.file?.filename);

            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        throw new UploadError('Error deleting file');
                    }
                });
            }

            next(error);
        }
    });
}

export async function deleteMedia(entryMedia: Array<EntryMedia>) {

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
        prisma.appMedia.deleteMany({
            where: {
                id: {
                    in: mediaIds
                }
            }
        })
    ]);

    return transaction;

}

export async function handleMedia(media: any[], entryId: number) {

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
        await prisma.$executeRaw`UPDATE entryMedia SET position = ${item.position} WHERE id = ${item.id}`;
    });
}

export async function saveMedia(entryId: string, fileName: string, originalFilename: string) {
    try {
        const media = await prisma.appMedia.create({
            data: {
                name: fileName,
                originalFilename: originalFilename,
                entryMedia: {
                    create: {
                        entry: {
                            connect: {
                                id: parseInt(entryId)
                            }
                        }
                    }
                }
            },
            include: {
                entryMedia: {
                    include: {
                        media: true
                    }
                }
            }
        });

        return media.entryMedia[0];

    } catch (error) {
        throw new UploadError('Error saving media to database');
    }

}