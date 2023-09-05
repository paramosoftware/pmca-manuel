import express from 'express';
import multer from 'multer';
import UploadError from './errors/UploadError'
import ServerError from './errors/ServerError'
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma/prisma';
import fs from 'fs';
import path from 'path';
import useMedia  from '../../composables/useMedia';

const router = express.Router();

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


const saveMedia = async (entryId: string, fileName: string, res: express.Response) => {
    try {
        const media = await prisma.media.create({
            data: {
                name: fileName,
                entries: {
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
                entries: {
                    include: {
                        media: true
                    }
                }
            }
        });


        return media.entries[0];
        
    } catch (error) {
        throw new UploadError('Error saving media to database')
    }

}

router.post('/', upload, async (req, res, next) => {
    try {

        if (!req.body.entryId) {
            throw new UploadError('A related entry is mandatory');
        }

        if (!req.file) {
            throw new UploadError('No file was sent');
        }

        const data = await saveMedia(req.body.entryId, req.file?.filename, res)

        res.json(data);

    } catch (error) {
        const filePath = path.join('public', req.file?.filename);

        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    throw new ServerError('Error deleting file');
                }
            });
        }

        next(error);
    }
    
})

export default router;