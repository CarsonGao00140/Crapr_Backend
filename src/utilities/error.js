import { MongooseError } from 'mongoose';

class BadRequestError extends Error {
    constructor(message) {
        const fullMessage = `Bad Request${message ? `: ${message}` : '.'}`;
        super(fullMessage);
        this.code = 400;
    }
}

class UnauthenticatedError extends Error {
    constructor(message) {
        const fullMessage = `Unauthenticated${message ? `: ${message}` : '.'}`;
        super(fullMessage);
        this.code = 401;
    }
};

class ForbiddenError extends Error {
    constructor(message) {
        const fullMessage = `Access Denied${message ? `: ${message}` : '.'}`;
        super(fullMessage);
        this.code = 403;
    }
};

class NotFoundError extends Error {
    constructor(message) {
        const fullMessage = `Not Found${message ? `: ${message}` : '.'}`;
        super(fullMessage);
        this.code = 404;
    }
}

const ErrorHandler = (err, req, res, next) => {
    if (err instanceof MongooseError) err.code = 400;
    
    res.status(err.code || 500).json({
        error: {message: err.message}
    });
};

export {
    BadRequestError,
    UnauthenticatedError,
    ForbiddenError,
    NotFoundError,
    ErrorHandler
};