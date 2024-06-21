import type express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadError } from '../express/error';
import getDataFolderPath from '~/utils/getDataFolderPath';
import logger from '~/utils/logger';
import PrismaService from './PrismaService';

const resource = 'Media'

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
        req.file?.originalname ?? '',
        model
    );

    res.json(mediaData);
}

export async function deleteModelMedia(modelMedia: Array<Media>, mediaService?: PrismaService, deleteRecords: boolean = true) {
    if (!mediaService) {
        mediaService = new PrismaService('ConceptMedia', false);
    }

    for (const media of modelMedia) {
        logger.debug(`Deleting media ${media.name}`);
        const mediaPath = path.join(getDataFolderPath('media'), media.name);

        if (fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }

        if (deleteRecords) {
            await mediaService.deleteOne(media.id);
        }
    }
}

export async function handleMedia(
    oldMedia: Array<Media>,
    modelId: number,
    model: string
) {
    
    const mediaService = new PrismaService(`${model}Media`, false);
    const newMedia: Array<Media> = await mediaService.readMany({
        where: {
            [`${model.toLowerCase()}Id`]: modelId
        }
    }, false) as unknown as Array<Media>;

    const mediaToDelete: Array<Media> = [];

    oldMedia.forEach((media: Media) => {
        if (
            !newMedia.find((newMedia: Media) => newMedia.id === media.id)
        ) {
            mediaToDelete.push(media);
        }
    });

    deleteModelMedia(mediaToDelete, mediaService);
}

export async function saveMedia(
    modelId: number,
    fileName: string,
    originalFilename: string,
    model: string,
    position: number = 1
) {
    try {
        const serviceModel = `${model}${resource}`
        const mediaService = new PrismaService(serviceModel, false);
 
        const media = await mediaService.createOne({
            name: fileName,
            originalFilename: originalFilename,
            position: position,
            [`${model.toLowerCase()}Id`]: modelId,
            [model.toLowerCase()]: {
                id: modelId
            }
            
    } );

        return media;
    } catch (error) {
        throw new UploadError('Error saving media to database: ' + JSON.stringify(error));
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
