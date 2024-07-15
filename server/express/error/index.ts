export class CustomError extends Error {
    public statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = 'CustomError';
        this.statusCode = 500;
    }
}

export class ApiValidationError extends CustomError {
    constructor(message: string) {
        super(message);
        this.name = 'ApiValidationError';
        this.statusCode = 400;
    }
}

export class UnauthorizedError extends CustomError {
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
        this.statusCode = 401;
    }
}

export class ForbiddenError extends CustomError {
    constructor(message: string) {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}

export class ServerError extends CustomError {
    constructor(message: string) {
        super(message);
        this.name = 'ServerError';
        this.statusCode = 500;
    }
}

export class UploadError extends CustomError {
    constructor(message: string) {
        super(message);
        this.name = 'UploadError';
        this.statusCode = 400;
    }
}

export class ExportError extends CustomError {
    constructor(message: string) {
        super(message);
        this.name = 'ExportError';
        this.statusCode = 400;
    }
}
