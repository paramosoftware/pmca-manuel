import useElectron from './useElectron';

export default function useMedia() {

    const folder = 'media';
    const isElectron = useElectron().isElectron;
    const mediaPath = isElectron ? process.env.USER_DATA_PATH! + '/' + folder + '/' : 'public/' + folder;

    return {
        mediaPath
    }
}