import express from 'express';
import multer from 'multer';
import UploadError  from './errors/UploadError'
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma/prisma';
import path from 'path';


const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
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
        await prisma.media.create({
            data: {
                entries: {
                    connect: {
                        id: parseInt(entryId)
                    }
                },
                name: fileName
            }
        });
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

        await saveMedia(req.body.entryId, req.file?.filename, res)

        res.json({ message: 'File uploaded' });

    } catch (error) {
        // TODO: delete file from disk
        next(error);
    }
    
})

export default router;