import fs from 'fs';
import path from 'path';
import logger from './logger';

export default function deleteFolder(directoryPath: string) {
    logger.info(`Deleting folder: ${directoryPath}`);
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file: any) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
}
