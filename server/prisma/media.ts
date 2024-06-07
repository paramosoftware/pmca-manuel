import type express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from './prisma';
import { UploadError } from '../express/error';
import getDataFolderPath from '~/utils/getDataFolderPath';

export async function uploadMedia(
    model: string,
    id: ID,
    body: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    const mediaPath = (await importUploadFile(
        req,
        res,
        next,
        getDataFolderPath('media')
    )) as string;

    if (!mediaPath || !fs.existsSync(mediaPath)) {
        return next(new UploadError('Error uploading file'));
    }

    const fileName = path.basename(mediaPath);
    id = parseInt(id as string);
    const mediaData = await saveMedia(
        id,
        fileName,
        req.file?.originalname ?? ''
    );

    res.json(mediaData);
}

export async function deleteConceptMedia(conceptMedia: Array<ConceptMedia>) {
    conceptMedia.forEach((media: ConceptMedia) => {
        const mediaPath = path.join(getDataFolderPath('media'), media.name);

        if (fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }

        prisma.conceptMedia.delete({
            where: {
                id: media.id
            }
        });
    });
}

export async function handleMedia(
    oldMedia: Array<ConceptMedia>,
    conceptId: number
) {
    const newMedia: Array<ConceptMedia> = await prisma.conceptMedia.findMany({
        where: {
            conceptId: conceptId
        }
    });

    const mediaToDelete: Array<ConceptMedia> = [];

    oldMedia.forEach((media: ConceptMedia) => {
        if (
            !newMedia.find((newMedia: ConceptMedia) => newMedia.id === media.id)
        ) {
            mediaToDelete.push(media);
        }
    });

    deleteConceptMedia(mediaToDelete);
}

export async function saveMedia(
    conceptId: number,
    fileName: string,
    originalFilename: string,
    position: number = 1
) {
    try {
        const media = await prisma.conceptMedia.create({
            data: {
                name: fileName,
                originalFilename: originalFilename,
                position: position,
                conceptId: conceptId
            }
        });

        return media;
    } catch (error) {
        throw new UploadError('Error saving media to database');
    }
}

export async function importUploadFile(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    destinationFolder: string = ''
) {
    if (!destinationFolder) {
        destinationFolder = getDataFolderPath('temp');
    }

    if (!fs.existsSync(destinationFolder)) {
        next(new UploadError('Destination folder does not exist'));
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationFolder);
        },
        filename: function (req, file, cb) {
            cb(null, uuidv4() + path.extname(file.originalname));
        }
    });

    const upload = multer({
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 100 }
    }).single('file');

    return new Promise((resolve, reject) => {
        upload(req, res, async (err: any) => {
            try {
                if (err) {
                    throw new UploadError('Error uploading file: ' + err.message);
                }

                if (!req.file) {
                    throw new UploadError('No file was sent');
                }

                resolve(path.join(destinationFolder, req.file?.filename));
            } catch (error) {

                const fileName = req.file?.filename ?? '';
                const filePath = path.join(
                    destinationFolder,
                    fileName
                );

                if (fs.existsSync(filePath) && fileName) {
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
