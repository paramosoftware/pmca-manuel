export default class ApiValidationError extends Error {
    public statusCode: number;

    constructor(message : string) {
        super(message);
        this.name = 'ApiValidationError';
        this.statusCode = 400;
    }
}