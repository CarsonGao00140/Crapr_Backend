import { MongooseError } from 'mongoose';

class BadRequestError extends Error {
    constructor(message) {
        const fullMessage = `Bad Request${message ? `: ${message}` : '.'}`;
        super(fullMessage);
        this.code = 400;
    }
}

class NoValidTokenError extends Error {
    code = 401;
    message = "Invalid or missing JWT.";
};

class UnauthenticatedError extends Error {
    code = 401;
    message = "Unauthenticated.";
};

class ForbiddenError extends Error {
    constructor(message) {
        const fullMessage = `Access Denied${message ? `: ${message}` : '.'}`;
        super(fullMessage);
        this.code = 403;
    }
};

class UserNotFoundError extends Error {
    code = 404;
    message = "No user found for the provided token."
};

class DataNotFoundError extends Error {
    constructor(id) {
        super(`Crap with id ${id} not found`);
        this.code = 404;
    }
};

const ErrorHandler = (err, req, res, next) => {
    if (err instanceof MongooseError) err.code = 400;
    
    res.status(err.code || 405).json({
        error: {message: err.message}
    });
};

export {
    BadRequestError,
    NoValidTokenError,
    UnauthenticatedError,
    ForbiddenError,
    UserNotFoundError,
    DataNotFoundError,
    ErrorHandler
};