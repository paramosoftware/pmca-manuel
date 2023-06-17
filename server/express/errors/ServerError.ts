export default class DeleteError extends Error {
    public statusCode: number;

    constructor(message : string) {
        super(message);
        this.name = 'ServerError';
        this.statusCode = 500;
    }
}