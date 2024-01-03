import type express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import getMediaPath from '~/utils/getMediaPath';
import getTempPath from '~/utils/getTempPath';
import { prisma } from '../../prisma/prisma';
import { UploadError } from '../error';


export async function uploadMedia(model: string, id: string, body: any, req: express.Request, res: express.Response, next: express.NextFunction) {

    const mediaPath = await importUploadFile(req, res, next, getMediaPath(true)) as string;

    if (!mediaPath || !fs.existsSync(mediaPath)) {
        return next(new UploadError('Error uploading file'));
    }

    const fileName = path.basename(mediaPath);
    const mediaData = await saveMedia(id, fileName, req.file?.originalname ?? '');

    res.json(mediaData);
}

export async function deleteMedia(entryMedia: Array<EntryMedia>) {

    const mediaIds: number[] = [];
    const relationsIds: number[] = [];

    entryMedia.forEach((media: EntryMedia) => {

        if (!media.media) {
            return;
        }

        const mediaPath = getMediaPath() + '/' + media.media.name;
        
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

export async function saveMedia(entryId: string | Number, fileName: string, originalFilename: string, position: number = 1){
    try {
        const media = await prisma.appMedia.create({
            data: {
                name: fileName,
                originalFilename: originalFilename,
                entryMedia: {
                    create: {
                        entry: {
                            connect: {
                                id: parseInt(entryId),
                            }
                        },
                        position: position
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


export async function importUploadFile(req: express.Request, res: express.Response, next: express.NextFunction, destinationFolder: string = '') {

    if (!destinationFolder) {
        destinationFolder = getTempPath(true);
    }

    if (!fs.existsSync(destinationFolder)) {
        next(new UploadError('Destination folder does not exist'));
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationFolder)
        },
        filename: function (req, file, cb) {
            cb(null, uuidv4() + path.extname(file.originalname))
        }
    })

    const upload = multer({
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 20 }
    }).single('file')



    return new Promise((resolve, reject) => {
        upload(req, res, async (err: any) => {
            try {
                if (err) {
                    throw new UploadError('Error uploading file');
                }

                if (!req.file) {
                    throw new UploadError('No file was sent');
                }

                resolve(path.join(destinationFolder, req.file?.filename));

            } catch (error) {

                const filePath = path.join(destinationFolder, req.file?.filename);

                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            throw new UploadError('Error deleting file');
                        }
                    });
                }

                next(reject(error));

            }
        });
    });
}