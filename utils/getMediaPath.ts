import isElectron from './isElectron';

export default function getMediaPath() {

    const folder = 'media';
    const mediaPath = isElectron() ? process.env.USER_DATA_PATH! + '/' + folder + '/' : 'public/' + folder;

    return mediaPath
}