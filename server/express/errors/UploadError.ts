export default class UploadError extends Error {
    public statusCode: number;

    constructor(message : string) {
        super(message);
        this.name = 'UploadError';
        this.statusCode = 400;
    }
}