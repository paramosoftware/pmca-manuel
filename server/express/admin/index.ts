import express from 'express';
import decodeJwt from '~/utils/decodeJwt';
import { getAccessToken } from '~/server/express/auth/helpers';
import { UnauthorizedError } from '../error';
import getDataFolderPath from '~/utils/getDataFolderPath';
import Zip from 'adm-zip';
import fs from 'fs';

const router = express.Router();

router.get('/backup', async (req, res, next) => {
    try {
        const accessToken = getAccessToken(req);
        const decodedToken = decodeJwt(accessToken, process.env.ACCESS_TOKEN_SECRET!) as UserToken;

        if (!decodedToken || !decodedToken.isAdmin) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const allowedFolders = ['media', 'db', 'logs'];

        const folder = (req.query.folder || null) as string;

        if (folder && !allowedFolders.includes(folder)) {
            throw new Error('Invalid folder');
        }

        const tempFolder = getDataFolderPath('temp');

        const zip = new Zip();

        const targetFolders = folder ? [folder] : allowedFolders;

        for (const targetFolder of targetFolders) {
            const folderPath = getDataFolderPath(targetFolder);

            if (!fs.existsSync(folderPath)) {
                continue;
            }

            zip.addLocalFolder(folderPath, targetFolder);
        }

        const fileName = 'backup-' + (folder ? folder : 'data') + '.zip';

        const zipPath = tempFolder + '/' + fileName;

        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }

        zip.writeZip(zipPath);

        res.download(zipPath, fileName, () => {
            fs.unlinkSync(zipPath);
        });

    } catch (error) {
        next(error);
    }
});

export default router;
