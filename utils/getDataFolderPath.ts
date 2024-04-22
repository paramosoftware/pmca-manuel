import path from 'path';
import fs from 'fs';

export default function getDataFolderPath(folder: string) {
    if (!process.env.DATA_DIR) {
        throw new Error('DATA_DIR environment variable not set');
    }

    if (!fs.existsSync(path.join(process.env.DATA_DIR!, folder))) {
        fs.mkdirSync(path.join(process.env.DATA_DIR!, folder), {
            recursive: true
        });
    }

    return path.join(process.env.DATA_DIR!, folder);
}
