import useIsElectron from './useIsElectron';

export default function useMedia() {

    const folder = 'media';
    const mediaPath = useIsElectron() ? process.env.USER_DATA_PATH! + '/' + folder + '/' : 'public/' + folder;

    return {
        mediaPath
    }
}