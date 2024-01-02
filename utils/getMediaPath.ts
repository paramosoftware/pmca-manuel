import isElectron from './isElectron';
import path from 'path';

export default function getMediaPath(absolute: boolean = false) {

    const folder = 'media';

    if (isElectron()) {
        return path.join(process.env.USER_DATA_PATH!, folder);
    } else {
        return absolute ? path.join(process.cwd(), 'public', folder) : path.join('public', folder);
    }

}