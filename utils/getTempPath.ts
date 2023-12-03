import isElectron from './isElectron';

export default function getTempPath() {

    const folder = 'temp';
    const mediaPath = isElectron() ? process.env.USER_DATA_PATH! + '/' + folder + '/' : process.cwd() + '/server/' + folder + '/';

    return mediaPath
}