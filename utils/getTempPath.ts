import isElectron from './isElectron';
import path from 'path';

export default function getTempPath(absolute: boolean = false) {

    const folder = 'temp';

    if (isElectron()) {
        return path.join(process.env.USER_DATA_PATH!, folder);
    } else {
        return absolute ? path.join(process.cwd(), 'server', folder) : path.join('server', folder);
    }
}