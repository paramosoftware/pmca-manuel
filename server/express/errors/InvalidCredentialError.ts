export default class InvalidCredentialError extends Error {
    public statusCode: number;

    constructor(message : string) {
        super(message);
        this.name = 'InvalidCredentialError';
        this.statusCode = 401;
    }
}